import { Router } from 'express';
import { validateTransaction } from '@ledgerly/shared';

const FIELDS = ['type', 'amountCents', 'categoryId', 'date', 'note'];

function pick(body) {
  return Object.fromEntries(FIELDS.filter((key) => key in (body ?? {})).map((key) => [key, body[key]]));
}

export function transactionsRouter(store) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(store.list());
  });

  router.get('/:id', (req, res) => {
    const item = store.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Transaction not found' });
    res.json(item);
  });

  router.post('/', (req, res) => {
    const data = pick(req.body);
    const errors = validateTransaction(data);
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    res.status(201).json(store.create(data));
  });

  router.put('/:id', (req, res) => {
    const existing = store.get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });
    const data = { ...existing, ...pick(req.body) };
    const errors = validateTransaction(data);
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    res.json(store.update(req.params.id, pick(data)));
  });

  router.delete('/:id', (req, res) => {
    if (!store.remove(req.params.id)) return res.status(404).json({ error: 'Transaction not found' });
    res.status(204).end();
  });

  return router;
}
