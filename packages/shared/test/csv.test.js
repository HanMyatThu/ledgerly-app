import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../src/csv.js';

const columns = [
  { key: 'date', header: 'Date' },
  { key: 'description', header: 'Description' },
  { key: 'amountCents', header: 'Amount (cents)' },
];

test('toCsv writes a header row and one line per row', () => {
  const csv = toCsv([{ date: '2026-11-01', description: 'Coffee', amountCents: 450 }], columns);
  assert.equal(csv, 'Date,Description,Amount (cents)\r\n2026-11-01,Coffee,450\r\n');
});

test('toCsv writes only the header for no rows', () => {
  assert.equal(toCsv([], columns), 'Date,Description,Amount (cents)\r\n');
});

test('toCsv follows column order and ignores extra keys', () => {
  const csv = toCsv([{ amountCents: 1, description: 'x', date: 'd', id: 9 }], columns);
  assert.equal(csv.split('\r\n')[1], 'd,x,1');
});

test('toCsv falls back to the key when there is no header', () => {
  assert.equal(toCsv([], [{ key: 'id' }]), 'id\r\n');
});

test('toCsv quotes commas, quotes and new lines', () => {
  const rows = [{ date: 'd', description: 'Rent, "flat"\nNov', amountCents: 1 }];
  assert.equal(toCsv(rows, columns).split('\r\n')[1], 'd,"Rent, ""flat""\nNov",1');
});

test('toCsv leaves missing values empty', () => {
  const csv = toCsv([{ date: 'd', description: null }], columns);
  assert.equal(csv.split('\r\n')[1], 'd,,');
});

test('toCsv defuses text that looks like a spreadsheet formula', () => {
  const csv = toCsv([{ date: 'd', description: '=SUM(A1)', amountCents: -500 }], columns);
  assert.equal(csv.split('\r\n')[1], "d,'=SUM(A1),-500");
});
