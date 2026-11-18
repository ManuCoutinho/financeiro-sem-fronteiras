import { collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import {
  businessSettingsSchema,
  productSchema,
  serviceSchema,
  type BusinessSettings,
  type Product,
  type ProductInput,
  type Service,
  type ServiceInput,
} from '@/domain/schemas';
import { BUSINESS_SETTINGS_DOC_ID, COLLECTIONS } from './collections';
import { db } from './firebase';
import { commitInBackground, parseDocs, type Listener, type OnError, type Unsubscribe } from './snapshots';

const SORT_FIELD = 'sortOrder';

const settingsRef = () => doc(db, COLLECTIONS.settings, BUSINESS_SETTINGS_DOC_ID);

export function subscribeServices({ onNext, onError }: Listener<Service[]>): Unsubscribe {
  return onSnapshot(
    query(collection(db, COLLECTIONS.services), orderBy(SORT_FIELD)),
    (snapshot) => onNext(parseDocs(snapshot.docs, serviceSchema)),
    onError,
  );
}

export function subscribeProducts({ onNext, onError }: Listener<Product[]>): Unsubscribe {
  return onSnapshot(
    query(collection(db, COLLECTIONS.products), orderBy(SORT_FIELD)),
    (snapshot) => onNext(parseDocs(snapshot.docs, productSchema)),
    onError,
  );
}

export function subscribeBusinessSettings({ onNext, onError }: Listener<BusinessSettings | null>): Unsubscribe {
  return onSnapshot(
    settingsRef(),
    (snapshot) => {
      const result = businessSettingsSchema.safeParse(snapshot.data());
      onNext(result.success ? result.data : null);
    },
    onError,
  );
}

export function saveService(service: ServiceInput, onError: OnError, serviceId?: string): string {
  const data = serviceSchema.parse(service);
  const serviceRef = serviceId ? doc(db, COLLECTIONS.services, serviceId) : doc(collection(db, COLLECTIONS.services));
  commitInBackground(setDoc(serviceRef, data), onError);
  return serviceRef.id;
}

export function createProduct(product: ProductInput, onError: OnError): string {
  const productRef = doc(collection(db, COLLECTIONS.products));
  commitInBackground(setDoc(productRef, productSchema.parse(product)), onError);
  return productRef.id;
}

export type ProductDetails = Omit<ProductInput, 'quantity'>;

// Quantity only changes through stock movements: overwriting it here would erase
// sales made offline on another device that have not synced yet.
export function updateProductDetails(productId: string, details: ProductDetails, onError: OnError) {
  const data = productSchema.omit({ quantity: true }).parse(details);
  commitInBackground(updateDoc(doc(db, COLLECTIONS.products, productId), data), onError);
}

export function saveBusinessSettings(settings: BusinessSettings, onError: OnError) {
  commitInBackground(setDoc(settingsRef(), businessSettingsSchema.parse(settings)), onError);
}
