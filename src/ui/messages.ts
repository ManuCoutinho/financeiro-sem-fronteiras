import type { ExpenseCategory, TransactionType } from '../domain/cashRegister';
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

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  supplies: 'Material',
  rent: 'Aluguel',
  bills: 'Contas (água, luz, internet)',
  marketing: 'Divulgação',
  transport: 'Transporte',
  other: 'Outros',
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
  servicesTitle: 'Serviços',
  productsTitle: 'Produtos',
  businessTitle: 'Estúdio e maquininha',
  toolsTitle: 'Ferramentas',
  addService: 'Novo serviço',
  addProduct: 'Novo produto',
  editService: 'Editar serviço',
  editProduct: 'Editar produto',
  emptyServices: 'Nenhum serviço ainda. Cadastre o primeiro para registrar atendimentos em um toque.',
  emptyProducts: 'Nenhum produto ainda. Cadastre os que você vende para o estoque baixar sozinho.',
  hidden: 'Fora do caixa',
  stockCount: (quantity: number) => `${quantity} em estoque`,
  nameLabel: 'Nome',
  priceLabel: 'Preço',
  salePriceLabel: 'Preço de venda',
  costLabel: 'Custo por unidade',
  costHint: 'Quanto você pagou em cada unidade. Usado no valor do estoque.',
  quantityLabel: 'Quantidade em estoque',
  currentStock: (quantity: number) => `Em estoque agora: ${quantity}`,
  stockChangeHint: 'Para mudar a quantidade, use “Chegou mercadoria” ou “Ajuste” na aba Estoque.',
  minStockLabel: 'Avisar quando restarem',
  minStockHint: 'O alerta “Estoque baixo” aparece nessa quantidade ou menos.',
  expiresOnLabel: 'Validade (opcional)',
  isActiveLabel: 'Mostrar no caixa',
  isActiveHint: 'Desmarque para tirar do caixa sem perder o histórico de vendas.',
  businessNameLabel: 'Nome do estúdio',
  feesLegend: 'Taxa da maquininha (%)',
  feesHint: 'Quanto é descontado de cada venda. Pix e dinheiro costumam ser 0.',
  expirationAlertDaysLabel: 'Avisar validade com quantos dias de antecedência',
  save: 'Salvar',
  serviceSaved: 'Serviço salvo',
  productSaved: 'Produto salvo',
  settingsSaved: 'Configurações salvas',
} as const;

export const CASH_REGISTER_MESSAGES = {
  dayLabelPattern: "EEEE, d 'de' MMMM",
  soldToday: 'Vendido hoje',
  netLabel: 'Líquido',
  expensesLabel: 'Gastos',
  closeRegister: 'Fechar o caixa',
  dayClosed: 'Caixa de hoje fechado',
  quickSaleTitle: 'Vendi',
  noItems: 'Cadastre seus serviços e produtos na aba Mais para vender em um toque.',
  goToSettings: 'Cadastrar itens',
  dayListTitle: 'Hoje',
  noTransactions: 'Nenhuma venda hoje ainda.',
  voided: 'Desfeito',
  quantityTimes: (quantity: number) => `${quantity}×`,
} as const;

export const SALE_MESSAGES = {
  quantityLabel: 'Quantidade',
  decreaseQuantity: 'Diminuir quantidade',
  increaseQuantity: 'Aumentar quantidade',
  discountLabel: 'Desconto (opcional)',
  discountTooHigh: 'O desconto não pode passar do valor da venda.',
  totalLabel: 'Total',
  paymentTitle: 'Forma de pagamento',
  paymentHint: 'Toque na forma de pagamento para registrar a venda.',
  feeHint: (percent: string) => `taxa de ${percent}%`,
  stockCheck: (remaining: number) => `O estoque vai ficar em ${remaining}. A venda é registrada mesmo assim.`,
  itemNotFound: 'Este item não está mais no caixa. Volte e escolha outro.',
  dayClosed: 'O caixa de hoje já foi fechado. Reabra o caixa para registrar novas vendas.',
  backToRegister: 'Voltar ao caixa',
  saleVoided: 'Venda desfeita',
} as const;

export const FORM_MESSAGES = {
  required: 'Preencha este campo.',
  tooLong: 'Use um nome mais curto.',
  invalidAmount: 'Digite um valor como 60 ou 59,90.',
  invalidPercent: 'Digite um percentual entre 0 e 100, como 3,5.',
  invalidWholeNumber: 'Digite um número inteiro, como 0 ou 5.',
  invalidPositiveNumber: 'Digite um número inteiro maior que zero.',
  invalidDate: 'Escolha uma data válida.',
} as const;

export const NAVIGATION_ARIA_LABEL = 'Navegação principal';
export const BACK_LABEL = 'Voltar';
export const CLOSE_LABEL = 'Fechar';
export const LOADING_LABEL = 'Carregando…';

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
