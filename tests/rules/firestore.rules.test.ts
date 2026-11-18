import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { renderRules } from '../../scripts/renderRules.mjs';
import { PAYMENT_METHODS } from '../../src/domain/money';
import { EXPENSE_CATEGORIES, TRANSACTION_TYPES } from '../../src/domain/cashRegister';
import { COLLECTIONS } from '../../src/services/collections';

const OWNER_UID = 'ownerTestUid';
const STRANGER_UID = 'strangerTestUid';
const OPEN_DAY = '2026-11-12';
const CLOSED_DAY = '2026-11-11';

const validTransaction = {
  type: 'service',
  itemId: 'design',
  description: 'Design + henna',
  quantity: 1,
  grossCents: 6000,
  discountCents: 0,
  paymentMethod: 'pix',
  feeCents: 0,
  netCents: 6000,
  day: OPEN_DAY,
  isVoided: false,
};

let testEnv: RulesTestEnvironment;

const ownerDb = () => testEnv.authenticatedContext(OWNER_UID).firestore();
const strangerDb = () => testEnv.authenticatedContext(STRANGER_UID).firestore();
const anonymousDb = () => testEnv.unauthenticatedContext().firestore();

async function seed(path: string, data: Record<string, unknown>) {
  await testEnv.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), path), data));
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-financeiro-sem-fronteiras',
    firestore: { rules: renderRules(OWNER_UID) },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seed(`${COLLECTIONS.cashClosings}/${CLOSED_DAY}`, { isClosed: true });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('access control', () => {
  it('denies reads without login', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, validTransaction);
    await assertFails(getDoc(doc(anonymousDb(), COLLECTIONS.transactions, 't1')));
  });

  it('denies reads from another account', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, validTransaction);
    await assertFails(getDoc(doc(strangerDb(), COLLECTIONS.transactions, 't1')));
  });

  it('allows the owner to read', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, validTransaction);
    await assertSucceeds(getDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1')));
  });
});

describe('transactions', () => {
  it('accepts every domain type and payment method', async () => {
    for (const type of TRANSACTION_TYPES) {
      for (const paymentMethod of PAYMENT_METHODS) {
        await assertSucceeds(
          setDoc(doc(ownerDb(), COLLECTIONS.transactions, `${type}-${paymentMethod}`), {
            ...validTransaction,
            type,
            paymentMethod,
            expenseCategory: type === 'expense' ? EXPENSE_CATEGORIES[0] : null,
          }),
        );
      }
    }
  });

  it('rejects non-integer cents', async () => {
    await assertFails(
      setDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1'), { ...validTransaction, grossCents: 60.5 }),
    );
  });

  it('rejects discounts above the gross amount', async () => {
    await assertFails(
      setDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1'), { ...validTransaction, discountCents: 7000 }),
    );
  });

  it('rejects new transactions on a closed day', async () => {
    await assertFails(setDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1'), { ...validTransaction, day: CLOSED_DAY }));
  });

  it('never allows deletes', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, validTransaction);
    await assertFails(deleteDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1')));
  });

  it('allows voiding once on an open day', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, validTransaction);
    const transactionRef = doc(ownerDb(), COLLECTIONS.transactions, 't1');
    await assertSucceeds(updateDoc(transactionRef, { isVoided: true, voidedAt: serverTimestamp() }));
    await assertFails(updateDoc(transactionRef, { isVoided: true, voidedAt: serverTimestamp() }));
  });

  it('rejects voiding on a closed day', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, { ...validTransaction, day: CLOSED_DAY });
    await assertFails(
      updateDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1'), { isVoided: true, voidedAt: serverTimestamp() }),
    );
  });

  it('rejects edits to other fields', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, validTransaction);
    await assertFails(updateDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1'), { grossCents: 1 }));
  });
});

describe('stock movements', () => {
  it('are append-only', async () => {
    const movementRef = doc(ownerDb(), COLLECTIONS.stockMovements, 'm1');
    await assertSucceeds(setDoc(movementRef, { productId: 'serum', type: 'restock', quantity: 10, day: OPEN_DAY }));
    await assertFails(updateDoc(movementRef, { quantity: 11 }));
    await assertFails(deleteDoc(movementRef));
  });
});

describe('expenses', () => {
  const validExpense = {
    ...validTransaction,
    type: 'expense',
    itemId: 'supplies',
    description: '',
    expenseCategory: 'supplies',
  };

  it('accepts every domain category', async () => {
    for (const expenseCategory of EXPENSE_CATEGORIES) {
      await assertSucceeds(
        setDoc(doc(ownerDb(), COLLECTIONS.transactions, `expense-${expenseCategory}`), {
          ...validExpense,
          expenseCategory,
        }),
      );
    }
  });

  it('rejects unknown or missing categories', async () => {
    await assertFails(
      setDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1'), { ...validExpense, expenseCategory: 'party' }),
    );
    await assertFails(
      setDoc(doc(ownerDb(), COLLECTIONS.transactions, 't2'), { ...validExpense, expenseCategory: null }),
    );
  });
});

describe('cash closings', () => {
  it('allow voiding again once the day is reopened', async () => {
    await seed(`${COLLECTIONS.transactions}/t1`, { ...validTransaction, day: CLOSED_DAY });
    await assertSucceeds(updateDoc(doc(ownerDb(), COLLECTIONS.cashClosings, CLOSED_DAY), { isClosed: false }));
    await assertSucceeds(
      updateDoc(doc(ownerDb(), COLLECTIONS.transactions, 't1'), { isVoided: true, voidedAt: serverTimestamp() }),
    );
  });

  it('are owner-only', async () => {
    await assertFails(getDoc(doc(strangerDb(), COLLECTIONS.cashClosings, CLOSED_DAY)));
  });
});

describe('products', () => {
  it('let the owner change the stock and keep strangers out', async () => {
    await seed(`${COLLECTIONS.products}/serum`, { name: 'Sérum', quantity: 1 });
    await assertSucceeds(updateDoc(doc(ownerDb(), COLLECTIONS.products, 'serum'), { quantity: 0 }));
    await assertFails(updateDoc(doc(strangerDb(), COLLECTIONS.products, 'serum'), { quantity: 5 }));
  });
});
