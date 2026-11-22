import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, toCsv } from '../src/csv.js';

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

test('parseCsv reads rows and cells', () => {
  assert.deepEqual(parseCsv('a,b\n1,2\n'), [
    ['a', 'b'],
    ['1', '2'],
  ]);
});

test('parseCsv accepts CRLF and a missing final new line', () => {
  assert.deepEqual(parseCsv('a,b\r\n1,2'), [
    ['a', 'b'],
    ['1', '2'],
  ]);
});

test('parseCsv keeps empty cells', () => {
  assert.deepEqual(parseCsv('a,,c\n,,\n'), [
    ['a', '', 'c'],
    ['', '', ''],
  ]);
});

test('parseCsv unquotes cells with commas, quotes and new lines', () => {
  assert.deepEqual(parseCsv('"Rent, ""flat""\nNov",1\n'), [['Rent, "flat"\nNov', '1']]);
});

test('parseCsv skips blank lines and a byte-order mark', () => {
  assert.deepEqual(parseCsv('\uFEFFa\n\n\nb\n'), [['a'], ['b']]);
});

test('parseCsv returns no rows for empty input', () => {
  assert.deepEqual(parseCsv(''), []);
  assert.deepEqual(parseCsv(undefined), []);
});

test('parseCsv throws on an unclosed quote', () => {
  assert.throws(() => parseCsv('"oops,1\n'), /Unclosed quote/);
});

test('parseCsv reads back what toCsv writes', () => {
  const rows = [{ date: '2026-11-01', description: 'Tea, "green"\nbox', amountCents: 300 }];
  const [header, line] = parseCsv(toCsv(rows, columns));
  assert.deepEqual(header, ['Date', 'Description', 'Amount (cents)']);
  assert.deepEqual(line, ['2026-11-01', 'Tea, "green"\nbox', '300']);
});
