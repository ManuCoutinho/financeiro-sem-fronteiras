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

const ERROR_CODE_MESSAGES: Record<string, string> = {
  'permission-denied': MESSAGES.permissionDenied,
};

export function toUserMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return ERROR_CODE_MESSAGES[code] ?? MESSAGES.unexpectedError;
}
