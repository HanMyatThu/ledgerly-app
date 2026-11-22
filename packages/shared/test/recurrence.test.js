import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, addMonths, nextOccurrence, occurrenceAt, occurrencesBetween } from '../src/recurrence.js';

const weekly = { frequency: 'weekly', startDate: '2026-11-02' };
const monthly31 = { frequency: 'monthly', startDate: '2026-01-31' };

test('addDays crosses month and year ends', () => {
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-12-29', 7), '2027-01-05');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('addMonths clamps to the end of shorter months', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2028-01-31', 1), '2028-02-29');
  assert.equal(addMonths('2026-12-15', 1), '2027-01-15');
  assert.equal(addMonths('2026-01-15', -2), '2025-11-15');
});

test('monthly rules keep their day after a short month', () => {
  assert.equal(occurrenceAt(monthly31, 1), '2026-02-28');
  assert.equal(occurrenceAt(monthly31, 2), '2026-03-31');
  assert.equal(occurrenceAt(monthly31, 3), '2026-04-30');
});

test('weekly rules step seven days', () => {
  assert.deepEqual(occurrencesBetween(weekly, '2026-11-01', '2026-11-30'), [
    '2026-11-02',
    '2026-11-09',
    '2026-11-16',
    '2026-11-23',
    '2026-11-30',
  ]);
});

test('occurrencesBetween never starts before the start date', () => {
  assert.deepEqual(occurrencesBetween(monthly31, '2025-06-01', '2026-02-28'), ['2026-01-31', '2026-02-28']);
});

test('occurrencesBetween stops at the end date', () => {
  const rule = { ...weekly, endDate: '2026-11-15' };
  assert.deepEqual(occurrencesBetween(rule, '2026-11-01', '2026-12-31'), ['2026-11-02', '2026-11-09']);
});

test('occurrencesBetween is empty when the range is before the start', () => {
  assert.deepEqual(occurrencesBetween(weekly, '2026-10-01', '2026-10-31'), []);
});

test('occurrencesBetween respects the limit', () => {
  assert.equal(occurrencesBetween(weekly, '2026-11-01', '2030-01-01', 3).length, 3);
});

test('nextOccurrence finds the first date strictly after', () => {
  assert.equal(nextOccurrence(weekly, '2026-11-02'), '2026-11-09');
  assert.equal(nextOccurrence(weekly, '2026-10-01'), '2026-11-02');
  assert.equal(nextOccurrence(monthly31, '2026-02-28'), '2026-03-31');
});

test('nextOccurrence is null once the rule has ended', () => {
  assert.equal(nextOccurrence({ ...weekly, endDate: '2026-11-09' }, '2026-11-09'), null);
});

test('unknown frequencies throw', () => {
  assert.throws(() => occurrenceAt({ frequency: 'daily', startDate: '2026-11-01' }, 1), /Unknown frequency/);
});
