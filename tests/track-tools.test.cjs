'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const tools = require('../script.js');

test('race inputs accept seconds and minute notation while rejecting malformed times', () => {
  assert.equal(tools.parseTime('65.25'), 65.25);
  assert.equal(tools.parseTime(' 1:05.25 '), 65.25);
  assert.equal(tools.parseTime('0:00.01'), .01);
  assert.equal(tools.parseTime('60:00'), 3600);
  for (const invalid of ['', '0', '-2', '1:60', '1:5', 'NaN', 'Infinity', '4abc', '1:05.123', '3601', '1e2']) assert.equal(tools.parseTime(invalid), null, invalid);
});

test('time display carries rounded hundredths into the next minute', () => {
  assert.equal(tools.formatTime(59.999), '1:00.00');
  assert.equal(tools.formatTime(65.25), '1:05.25');
  assert.equal(tools.formatTime(12.5), '12.50');
  assert.equal(tools.formatTime(.01), '0.01');
});

test('cumulative splits reach the exact goal without rounding drift', () => {
  assert.deepEqual(tools.buildSplits(400, 60, 100), [
    {distance:100,time:15},{distance:200,time:30},{distance:300,time:45},{distance:400,time:60}
  ]);
  const splits = tools.buildSplits(3200, 613.13, 100);
  assert.equal(splits.length, 32);
  assert.equal(splits.at(-1).time, 613.13);
  assert.equal(splits.at(-1).distance, 3200);
  assert.deepEqual(tools.buildSplits(100, 12, 400), []);
  assert.deepEqual(tools.buildSplits(400, -1, 100), []);
  assert.deepEqual(tools.buildSplits(400, 60, 0), []);
});

const marks = [
  {id:'a',event:'400',value:65,date:'2026-05-01'},
  {id:'b',event:'400',value:63.5,date:'2026-05-02'},
  {id:'c',event:'400',value:63.5,date:'2026-05-03'},
  {id:'d',event:'long',value:4.25,date:'2026-05-01'},
  {id:'e',event:'long',value:4.6,date:'2026-05-02'},
  {id:'f',event:'shot',value:8.21,date:'2026-05-02'}
];

test('personal bests use lower times and longer/higher field marks, separated by event', () => {
  assert.deepEqual(tools.bests(marks), {'400':63.5,long:4.6,shot:8.21});
  assert.equal(tools.parseMark('long', '5.42'), 5.42);
  assert.equal(tools.parseMark('long', '1:05'), null);
  assert.equal(tools.parseMark('400', '1:05'), 65);
  assert.equal(tools.parseMark('__proto__', '5'), null);
  assert.equal(tools.formatMark(marks[4]), '4.60 m');
});

test('saved data rejects invalid dates, injected strings, duplicate IDs, and nonfinite values', () => {
  assert.equal(tools.validMarks(marks), true);
  assert.equal(tools.validMarks([]), true);
  assert.equal(tools.validMarks(null), false);
  assert.equal(tools.validMarks([...marks, marks[0]]), false);
  for (const change of [
    {date:'2026-02-30'},{date:'garbage'},{id:'<img src=x onerror=alert(1)>'},
    {event:'__proto__'},{value:NaN},{value:Infinity},{value:'65'},{value:-1},{value:4000}
  ]) assert.equal(tools.validMarks([{...marks[0],...change}]), false, JSON.stringify(change));
  assert.equal(tools.validDate('2024-02-29'), true);
  assert.equal(tools.validDate('2025-02-29'), false);
});

test('CSV exports numeric seconds and meters with correct best badges and newest date first', () => {
  const csv = tools.marksCSV(marks);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, 7);
  assert.equal(lines[1], '"2026-05-03","400m","63.50","seconds","Yes"');
  assert.ok(lines.includes('"2026-05-02","Long jump","4.60","meters","Yes"'));
  assert.ok(lines.includes('"2026-05-01","400m","65.00","seconds",""'));
  assert.equal(csv.includes('undefined'), false);
});
