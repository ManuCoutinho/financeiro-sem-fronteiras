import type { TransactionType } from '../domain/cashRegister';
import type { StockAlertType, StockMovementType } from '../domain/inventory';
import type { PaymentMethod } from '../domain/money';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cash: 'Dinheiro',
  debit: 'Débito',
  credit: 'Crédito',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  service: 'Serviço',
  product: 'Produto',
  expense: 'Despesa',
};

export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  restock: 'Chegou mercadoria',
  sale: 'Venda',
  adjustment: 'Ajuste',
  usage: 'Uso no atendimento',
  reversal: 'Venda desfeita',
};

export const STOCK_ALERT_LABELS: Record<StockAlertType, string> = {
  negative: 'Conferir estoque',
  low: 'Estoque baixo',
  expired: 'Vencido',
  expiringSoon: 'Vence em breve',
};

export const NAVIGATION_LABELS = {
  cashRegister: 'Caixa',
  inventory: 'Estoque',
  month: 'Mês',
  more: 'Mais',
} as const;

export const CSV_HEADER = [
  'dia',
  'tipo',
  'descrição',
  'quantidade',
  'forma',
  'valor',
  'desconto',
  'taxa',
  'líquido',
] as const;

export const MESSAGES = {
  saleRegistered: 'Venda registrada',
  undo: 'Desfazer',
  pendingSync: 'Aguardando envio',
  offlineSaleSaved: 'Sem internet. A venda foi salva e será enviada quando a conexão voltar.',
  dayClosedReopenFirst: 'Este dia já foi fechado. Reabra o caixa para desfazer.',
  underConstruction: 'Em construção. Em breve, o caixa do dia aparece aqui.',
  unexpectedError: 'Algo deu errado. Tente de novo; se continuar, feche e abra o app.',
  permissionDenied: 'Você não tem acesso a estes dados. Entre com a conta do negócio.',
} as const;

export const AUTH_MESSAGES = {
  tagline: 'O caixa e o estoque do seu estúdio, na palma da mão.',
  signInWithGoogle: 'Entrar com Google',
  signingIn: 'Entrando…',
  signOut: 'Sair',
  loading: 'Carregando…',
  networkError: 'Sem internet. Conecte-se para entrar pela primeira vez.',
  signInCancelled: 'O login foi cancelado. Toque em “Entrar com Google” para tentar de novo.',
} as const;

export const PAGE_TITLES = {
  cashRegister: 'Caixa',
  confirmSale: 'Confirmar venda',
  newExpense: 'Gastei',
  closing: 'Fechar o caixa',
  inventory: 'Estoque',
  product: 'Produto',
  month: 'Mês',
  settings: 'Mais',
  importPricing: 'Preço do importado',
} as const;

export const SETTINGS_MESSAGES = {
  accountTitle: 'Conta',
  accountIdLabel: 'ID da conta',
  copyAccountId: 'Copiar ID da conta',
  accountIdCopied: 'ID da conta copiado',
  accountIdCopyFailed: 'Não deu para copiar. Selecione o texto e copie à mão.',
} as const;

export const NAVIGATION_ARIA_LABEL = 'Navegação principal';
export const BACK_LABEL = 'Voltar';

const ERROR_CODE_MESSAGES: Record<string, string> = {
  'permission-denied': MESSAGES.permissionDenied,
  'auth/network-request-failed': AUTH_MESSAGES.networkError,
  'auth/popup-closed-by-user': AUTH_MESSAGES.signInCancelled,
  'auth/user-cancelled': AUTH_MESSAGES.signInCancelled,
};

export function toUserMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return ERROR_CODE_MESSAGES[code] ?? MESSAGES.unexpectedError;
}
