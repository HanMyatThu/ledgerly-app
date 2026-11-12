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
};
