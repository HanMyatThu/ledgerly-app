import express, { Router } from 'express';
import { parseListQuery, validateTransaction } from '@ledgerly/shared';
import { asyncHandler, HttpError, notFound } from '../http.js';
import { csvToDrafts, transactionsToCsv, validateDraft } from '../lib/transactionCsv.js';

const FIELDS = ['type', 'amountCents', 'categoryId', 'date', 'note'];

function pick(body) {
  return Object.fromEntries(FIELDS.filter((key) => key in (body ?? {})).map((key) => [key, body[key]]));
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
      const query = parseListQuery(req.query);
      // Total matches before paging, so clients can tell whether more pages exist.
      res.set('X-Total-Count', String(store.count(query)));
      res.json(store.list(query));
    }),
  );

  // GET /api/transactions/export.csv?from=...&to=...
  // Every transaction matching the list filters, as a CSV download. Paging is ignored.
  router.get(
    '/export.csv',
    asyncHandler((req, res) => {
      const { limit, offset, ...filters } = parseListQuery(req.query);
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', 'attachment; filename="ledgerly-transactions.csv"');
      res.send(transactionsToCsv(store.list(filters)));
    }),
  );

  // POST /api/transactions/import with a text/csv body in the export layout.
  // Valid rows are saved and invalid ones are skipped; the response lists both,
  // with each rejected row's line number, values and errors by column.
  router.post(
    '/import',
    express.text({ type: ['text/csv', 'text/plain'], limit: '1mb' }),
    asyncHandler((req, res) => {
      const accepted = [];
      const rejected = [];
      for (const draft of csvToDrafts(req.body)) {
        const errors = validateDraft(draft.data);
        if (Object.keys(errors).length) rejected.push({ line: draft.line, values: draft.data, errors });
        else accepted.push(store.create(draft.data));
      }
      res.status(accepted.length ? 201 : 200).json({ accepted, rejected });
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
