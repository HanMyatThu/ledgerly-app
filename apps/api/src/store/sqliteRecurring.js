import { randomUUID } from 'node:crypto';

const FIELDS = {
  type: 'type',
  amountCents: 'amount_cents',
  categoryId: 'category_id',
  note: 'note',
  frequency: 'frequency',
  startDate: 'start_date',
  endDate: 'end_date',
};

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amount_cents,
    categoryId: row.category_id,
    note: row.note,
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    lastDate: row.last_date,
    paused: row.paused === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Recurring transaction rules, kept in SQLite.
export function createSqliteRecurringStore(db) {
  const listStmt = db.prepare('SELECT * FROM recurring ORDER BY start_date, created_at');
  const activeStmt = db.prepare('SELECT * FROM recurring WHERE paused = 0 ORDER BY start_date, created_at');
  const getStmt = db.prepare('SELECT * FROM recurring WHERE id = ?');
  const removeStmt = db.prepare('DELETE FROM recurring WHERE id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO recurring (id, type, amount_cents, category_id, note, frequency, start_date, end_date,
      last_date, paused, created_at, updated_at)
    VALUES (@id, @type, @amountCents, @categoryId, @note, @frequency, @startDate, @endDate,
      NULL, 0, @now, @now)
  `);
  const pausedStmt = db.prepare('UPDATE recurring SET paused = @paused, updated_at = @now WHERE id = @id');
  const lastDateStmt = db.prepare('UPDATE recurring SET last_date = @lastDate WHERE id = @id');

  return {
    list() {
      return listStmt.all().map(fromRow);
    },
    // Rules that are not paused, for the materializer.
    listActive() {
      return activeStmt.all().map(fromRow);
    },
    get(id) {
      return fromRow(getStmt.get(id));
    },
    create(data) {
      const id = randomUUID();
      insertStmt.run({ note: '', endDate: null, ...data, id, now: new Date().toISOString() });
      return this.get(id);
    },
    // Changes the rule's fields (not its schedule progress). Returns null if not found.
    update(id, data) {
      const sets = Object.keys(FIELDS).filter((key) => key in data);
      if (sets.length) {
        const sql = `UPDATE recurring SET ${sets.map((key) => `${FIELDS[key]} = @${key}`).join(', ')},
          updated_at = @now WHERE id = @id`;
        const values = Object.fromEntries(sets.map((key) => [key, data[key] ?? null]));
        db.prepare(sql).run({ ...values, id, now: new Date().toISOString() });
      }
      return this.get(id);
    },
    setPaused(id, paused) {
      pausedStmt.run({ id, paused: paused ? 1 : 0, now: new Date().toISOString() });
      return this.get(id);
    },
    // Records the latest occurrence that has been turned into a transaction.
    setLastDate(id, lastDate) {
      lastDateStmt.run({ id, lastDate });
    },
    remove(id) {
      return removeStmt.run(id).changes > 0;
    },
  };
}
