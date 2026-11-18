export const PATHS = {
  login: '/login',
  cashRegister: '/',
  confirmSale: '/sale/:itemId',
  newExpense: '/expense/new',
  closing: '/closing',
  inventory: '/inventory',
  product: '/inventory/:productId',
  month: '/month',
  settings: '/settings',
  importPricing: '/settings/import-pricing',
} as const;

export const buildConfirmSalePath = (itemId: string) => `/sale/${encodeURIComponent(itemId)}`;
export const buildProductPath = (productId: string) => `/inventory/${encodeURIComponent(productId)}`;
