import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeTokenBucket } from '../../workers/shared/rate-limit';

test('token bucket allows within capacity', () => {
  const now = Date.now();
  const result = consumeTokenBucket({ tokens: 5, updatedAtMs: now }, { capacity: 5, refillPerSecond: 1 }, now);
  assert.equal(result.allowed, true);
  assert.equal(Math.floor(result.state.tokens), 4);
});

test('token bucket rejects when depleted', () => {
  const now = Date.now();
  const result = consumeTokenBucket({ tokens: 0, updatedAtMs: now }, { capacity: 5, refillPerSecond: 1 }, now);
  assert.equal(result.allowed, false);
  assert.equal(result.retryAfterSec, 1);
});
