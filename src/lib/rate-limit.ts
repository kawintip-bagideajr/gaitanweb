// Best-effort in-memory rate limiter, scoped to a single warm serverless
// instance — not a perfect distributed limiter, but it stops naive
// scripted brute-forcing without needing extra infra (Redis, etc.) for a
// project this size. Revisit with a shared store (e.g. Upstash) if real
// abuse shows up.
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function getClientIp(req: Request): string {
  // x-forwarded-for is a comma-separated hop chain that a client can seed
  // with any values it wants; only the LAST entry — appended by Vercel's own
  // edge from the actual TCP connection — is trustworthy. Using the first
  // entry (as before) let anyone bypass IP-based rate limiting by sending a
  // fake header value.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
