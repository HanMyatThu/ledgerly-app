import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/store/index.js';
import { materializeRecurring } from '../src/lib/materialize.js';
import { msUntilNextMidnight, runDaily } from '../src/lib/daily.js';
import { localToday } from '../src/lib/today.js';

const rent = {
  type: 'expense',
  amountCents: 120000,
  categoryId: 'housing',
  note: 'Rent',
  frequency: 'monthly',
  startDate: '2026-09-01',
};

describe('materializeRecurring', () => {
  let stores;

  beforeEach(() => {
    stores = createStore({ store: 'sqlite', databasePath: ':memory:' });
  });

  afterEach(() => stores.db.close());

  const run = (today) => materializeRecurring({ recurring: stores.recurring, store: stores.store, today });

  test('adds every occurrence due up to today', () => {
    const rule = stores.recurring.create(rent);
    const created = run('2026-11-15');
    assert.deepEqual(
      created.map((item) => item.date),
      ['2026-09-01', '2026-10-01', '2026-11-01'],
    );
    assert.ok(created.every((item) => item.recurringId === rule.id && item.amountCents === 120000));
    assert.equal(stores.store.count({}), 3);
    assert.equal(stores.recurring.get(rule.id).lastDate, '2026-11-01');
  });

  test('includes an occurrence due today', () => {
    stores.recurring.create({ ...rent, startDate: '2026-11-15' });
    assert.equal(run('2026-11-15').length, 1);
  });

  test('never adds the same occurrence twice', () => {
    stores.recurring.create(rent);
    run('2026-11-15');
    assert.equal(run('2026-11-15').length, 0);
    assert.deepEqual(
      run('2026-12-01').map((item) => item.date),
      ['2026-12-01'],
    );
    assert.equal(stores.store.count({}), 4);
  });

  test('skips paused rules and catches up when resumed', () => {
    const rule = stores.recurring.create({ ...rent, frequency: 'weekly', startDate: '2026-11-02' });
    stores.recurring.setPaused(rule.id, true);
    assert.equal(run('2026-11-20').length, 0);
    stores.recurring.setPaused(rule.id, false);
    assert.equal(run('2026-11-20').length, 3);
  });

  test('stops at the end date', () => {
    stores.recurring.create({ ...rent, endDate: '2026-10-15' });
    assert.equal(run('2027-01-01').length, 2);
  });

  test('does nothing for rules that start in the future', () => {
    stores.recurring.create({ ...rent, startDate: '2027-01-01' });
    assert.equal(run('2026-11-15').length, 0);
  });

  test('generated transactions are kept, unlinked, when the rule is deleted', () => {
    const rule = stores.recurring.create(rent);
    const [first] = run('2026-09-01');
    stores.recurring.remove(rule.id);
    assert.equal(stores.store.get(first.id).recurringId, null);
  });
});

describe('daily schedule', () => {
  test('msUntilNextMidnight points just past the next local midnight', () => {
    const now = new Date(2026, 10, 23, 23, 59, 0);
    assert.equal(msUntilNextMidnight(now), 65_000);
  });

  test('runDaily runs the task on each timer and can be stopped', () => {
    const timers = [];
    let runs = 0;
    let cleared = null;
    const stop = runDaily(() => (runs += 1), {
      setTimer: (fn, ms) => {
        timers.push({ fn, ms });
        return timers.length;
      },
      clearTimer: (id) => (cleared = id),
    });
    assert.equal(timers.length, 1);
    assert.ok(timers[0].ms > 0 && timers[0].ms <= 24 * 60 * 60 * 1000 + 5000);
    timers[0].fn();
    assert.equal(runs, 1);
    assert.equal(timers.length, 2);
    stop();
    assert.equal(cleared, 2);
  });

  test('localToday formats the local date', () => {
    assert.equal(localToday(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
  });
});
