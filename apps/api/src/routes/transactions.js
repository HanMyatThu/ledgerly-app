import { Router } from 'express';
import { validateTransaction } from '@ledgerly/shared';
import { asyncHandler, HttpError, notFound } from '../http.js';

const FIELDS = ['type', 'amountCents', 'categoryId', 'date', 'note'];

function pick(body) {
  return Object.fromEntries(FIELDS.filter((key) => key in (body ?? {})).map((key) => [key, body[key]]));
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Reads supported filters from the query string, ignoring anything malformed.
function listFilters(query) {
  const filters = {};
  if (DATE.test(query.from ?? '')) filters.from = query.from;
  if (DATE.test(query.to ?? '')) filters.to = query.to;
  if (query.type === 'income' || query.type === 'expense') filters.type = query.type;
  if (typeof query.category === 'string' && query.category) filters.categoryId = query.category;
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) filters.q = q.slice(0, 100);
  return filters;
}

function assertValid(data) {
  const errors = validateTransaction(data);
  if (Object.keys(errors).length) throw new HttpError(400, 'Invalid transaction', errors);
}

export function transactionsRouter(store) {
  const router = Router();

  function findOrThrow(id) {
    const item = store.get(id);
    if (!item) throw notFound('Transaction');
    return item;
  }

  router.get(
    '/',
    asyncHandler((req, res) => {
      res.json(store.list(listFilters(req.query)));
    }),
  );

  router.get(
    '/:id',
    asyncHandler((req, res) => {
      res.json(findOrThrow(req.params.id));
    }),
  );

  router.post(
    '/',
    asyncHandler((req, res) => {
      const data = pick(req.body);
      assertValid(data);
      res.status(201).json(store.create(data));
    }),
  );

  router.put(
    '/:id',
    asyncHandler((req, res) => {
      const data = pick({ ...findOrThrow(req.params.id), ...pick(req.body) });
      assertValid(data);
      res.json(store.update(req.params.id, data));
    }),
  );

  router.delete(
    '/:id',
    asyncHandler((req, res) => {
      if (!store.remove(req.params.id)) throw notFound('Transaction');
      res.status(204).end();
    }),
  );

  return router;
}
