async function send(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return { res, body: null };
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.error ?? 'Request failed');
    error.details = body.errors;
    throw error;
  }
  return { res, body };
}

async function request(path, options) {
  return (await send(path, options)).body;
}

function toQueryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export const api = {
  listTransactions: (params) => request(`/transactions${toQueryString(params)}`),
  // Like listTransactions, but also returns the total match count for paging.
  listTransactionsPage: async (params) => {
    const { res, body } = await send(`/transactions${toQueryString(params)}`);
    const total = Number(res.headers.get('X-Total-Count'));
    return { items: body, total: Number.isFinite(total) ? total : body.length };
  },
  createTransaction: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id, data) =>
    request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  // A download link for the transactions matching `params`, as CSV. Paging is ignored.
  exportCsvUrl: (params) => {
    const { limit, offset, ...filters } = params ?? {};
    return `/api/transactions/export.csv${toQueryString(filters)}`;
  },
  importCsv: (text) =>
    request('/transactions/import', { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: text }),

  reportSummary: (month) => request(`/reports/summary${toQueryString({ month })}`),
  reportMonthly: (from, to) => request(`/reports/monthly${toQueryString({ from, to })}`),
  reportCategories: (month, type = 'expense') => request(`/reports/categories${toQueryString({ month, type })}`),
  reportTop: (month, limit = 5) => request(`/reports/top${toQueryString({ month, limit })}`),

  listBudgets: (month) => request(`/budgets${toQueryString({ month })}`),
  budgetProgress: (month) => request(`/budgets/progress${toQueryString({ month })}`),
  setBudget: (month, categoryId, amountCents) =>
    request(`/budgets/${month}/${categoryId}`, { method: 'PUT', body: JSON.stringify({ amountCents }) }),
  removeBudget: (month, categoryId) => request(`/budgets/${month}/${categoryId}`, { method: 'DELETE' }),
  copyPreviousBudgets: (month) => request(`/budgets/${month}/copy-previous`, { method: 'POST' }),
};
