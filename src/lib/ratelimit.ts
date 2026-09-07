/**
 * An in-memory token bucket. It resets when the process restarts, which is
 * fine, because so do I, and nobody has ever complained about that either.
 *
 * If this ever runs on more than one instance, move it to the database. It will
 * not ever run on more than one instance.
 */

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterMs: number };

export function rateLimit(key: string, limit = 20, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const refillRate = limit / windowMs;

  if (buckets.size > MAX_KEYS) {
    // Evict anything that has been quiet for a full window. Ruthless, but the
    // alternative is a memory leak, and I refuse to die of something so ordinary.
    for (const [k, v] of buckets) {
      if (now - v.updatedAt > windowMs) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillRate);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    const retryAfterMs = Math.ceil((1 - bucket.tokens) / refillRate);
    buckets.set(key, bucket);
    return { ok: false, remaining: 0, retryAfterMs };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
}
