import { Router } from 'express';
import { FREQUENCIES, validateTransaction } from '@ledgerly/shared';
import { asyncHandler, HttpError, notFound } from '../http.js';

const FIELDS = ['type', 'amountCents', 'categoryId', 'note', 'frequency', 'startDate', 'endDate'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function pick(body) {
  return Object.fromEntries(FIELDS.filter((key) => key in (body ?? {})).map((key) => [key, body[key]]));
}

// A rule is a transaction template plus a schedule.
function validateRule(data) {
  const { startDate, ...rest } = data;
  const errors = validateTransaction({ ...rest, date: startDate });
  if (errors.date) {
    errors.startDate = 'Start date must be in YYYY-MM-DD format';
    delete errors.date;
  }
  if (!FREQUENCIES.includes(data.frequency)) {
    errors.frequency = `Frequency must be one of: ${FREQUENCIES.join(', ')}`;
  }
  if (data.endDate != null) {
    if (typeof data.endDate !== 'string' || !DATE.test(data.endDate)) {
      errors.endDate = 'End date must be in YYYY-MM-DD format';
    } else if (!errors.startDate && data.endDate < startDate) {
      errors.endDate = 'End date must not be before the start date';
    }
  }
  if (Object.keys(errors).length) throw new HttpError(400, 'Invalid recurring rule', errors);
}

export function recurringRouter(recurring) {
  const router = Router();

  function findOrThrow(id) {
    const rule = recurring.get(id);
    if (!rule) throw notFound('Recurring rule');
    return rule;
  }

  router.get(
    '/',
    asyncHandler((req, res) => {
      res.json(recurring.list());
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
      validateRule(data);
      res.status(201).json(recurring.create(data));
    }),
  );

  router.put(
    '/:id',
    asyncHandler((req, res) => {
      const current = findOrThrow(req.params.id);
      const changes = pick(req.body);
      validateRule({ ...pick(current), ...changes });
      res.json(recurring.update(req.params.id, changes));
    }),
  );

  router.delete(
    '/:id',
    asyncHandler((req, res) => {
      if (!recurring.remove(req.params.id)) throw notFound('Recurring rule');
      res.status(204).end();
    }),
  );

  // Paused rules keep their place in the schedule but add nothing until resumed.
  for (const [action, paused] of [
    ['pause', true],
    ['resume', false],
  ]) {
    router.post(
      `/:id/${action}`,
      asyncHandler((req, res) => {
        findOrThrow(req.params.id);
        res.json(recurring.setPaused(req.params.id, paused));
      }),
    );
  }

  return router;
}
