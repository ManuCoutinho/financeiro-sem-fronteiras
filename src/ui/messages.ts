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

export const EXPENSE_MESSAGES = {
  categoryLegend: 'Com o quê?',
  amountLabel: 'Valor',
  descriptionLabel: 'Descrição (opcional)',
  descriptionHint: 'Por exemplo: luvas, cola de cílios, conta de luz.',
  paymentLegend: 'Como pagou?',
  paymentHint: 'Pagamentos em dinheiro saem da gaveta no fechamento.',
  chooseCategory: 'Escolha com o quê foi o gasto.',
  choosePayment: 'Escolha como pagou.',
  invalidAmount: 'Digite um valor maior que zero, como 15 ou 15,90.',
  save: 'Registrar gasto',
  registered: 'Gasto registrado',
  voided: 'Gasto desfeito',
  dayClosed: 'O caixa de hoje já foi fechado. Reabra o caixa para registrar gastos.',
} as const;

export const UNDO_MESSAGES = {
  undoLabel: (description: string) => `Desfazer ${description}`,
  confirmTitle: 'Desfazer este lançamento?',
  confirmSale: 'Ele sai dos totais do dia. Se for produto, a quantidade volta ao estoque.',
  confirmExpense: 'O gasto sai dos totais do dia.',
  confirm: 'Desfazer',
  cancel: 'Cancelar',
  closedTitle: 'Este dia já foi fechado',
  closedDescription: 'Para desfazer, o caixa é reaberto e a reabertura fica registrada. Depois, feche o caixa de novo.',
  reopenAndUndo: 'Reabrir e desfazer',
  done: 'Lançamento desfeito',
} as const;

export const CLOSING_MESSAGES = {
  byMethodTitle: 'Recebido por forma de pagamento',
  salesLabel: 'Total vendido',
  feesLabel: 'Taxas da maquininha',
  netLabel: 'Líquido',
  expensesLabel: 'Gastos',
  resultLabel: 'Resultado do dia',
  drawerTitle: 'Dinheiro na gaveta',
  openingCashLabel: 'Troco inicial',
  openingCashHint: 'Quanto havia na gaveta quando o dia começou.',
  expectedCashLabel: 'Dinheiro esperado',
  expectedCashHint: 'Troco inicial + vendas em dinheiro − gastos pagos em dinheiro.',
  countedCashLabel: 'Dinheiro contado',
  countedCashHint: 'Conte o dinheiro da gaveta e digite aqui.',
  differenceLabel: 'Diferença',
  differenceBalanced: 'Bateu certinho',
  differenceOver: (amount: string) => `Sobrou ${amount}`,
  differenceShort: (amount: string) => `Faltou ${amount}`,
  confirm: 'Confirmar fechamento',
  closed: 'Caixa fechado',
  closedAt: (time: string) => `Fechado às ${time}`,
  reopenings: (count: number) => (count === 1 ? 'Reaberto 1 vez' : `Reaberto ${count} vezes`),
  reopen: 'Reabrir o caixa',
  reopened: 'Caixa reaberto',
  reopenHint: 'Reabra para registrar ou desfazer lançamentos de hoje. A reabertura fica registrada.',
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
