import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easeOut, easeInOut, spring, clamp01 } from './ease';

test('easing curves are finite, start at 0, end at 1, and rise', () => {
  for (const fn of [easeOut, easeInOut, spring]) {
    assert.equal(fn(0), 0);
    assert.equal(fn(1), 1);
    let prev = -Infinity;
    for (let i = 1; i < 100; i++) {
      const v = fn(i / 100);
      assert.ok(Number.isFinite(v), `${fn.name}(${i / 100}) is ${v}`);
      if (fn !== spring) { assert.ok(v >= prev - 1e-9, `${fn.name} decreases at ${i / 100}`); prev = v; }
    }
  }
});

test('ease-in-out is symmetric around the middle', () => {
  assert.ok(Math.abs(easeInOut(0.5) - 0.5) < 0.01);
  assert.ok(Math.abs(easeInOut(0.2) + easeInOut(0.8) - 1) < 0.01);
});

test('spring overshoots a little and settles', () => {
  const peak = Math.max(...Array.from({ length: 100 }, (_, i) => spring(i / 100)));
  assert.ok(peak > 1.02 && peak < 1.2, `peak ${peak}`);
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
});
