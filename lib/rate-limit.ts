import { createHmac, randomBytes } from 'node:crypto'

/*
  Rate limiting for the contact form, the same design as SecureScan's.

  With Upstash Redis connected (Vercel → Storage → Upstash for Redis sets the env vars),
  counts live in Redis, so every serverless instance sees the same numbers: a fixed window
  per key. Without it, or if Redis doesn't answer, each instance falls back to an in-memory
  sliding window, which still slows down a single abusive client.

  Keys are HMAC hashes of the IP, never the IP itself.
*/

function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

// The hash key must be secret, or anyone holding the hashes could hash all four billion IPv4
// addresses and match them. With Redis, every instance needs the same key: the Redis token is
// a secret they all share. Without Redis, counts stay in this instance's memory, so a random
// key made at startup is enough.
const secret = process.env.RATE_LIMIT_SECRET || redisConfig()?.token || randomBytes(32).toString('hex')

/** A keyed SHA-256 hash of the IP: stable for counting, useless for finding the address. */
export function hashIp(ip: string) {
  return createHmac('sha256', secret).update(ip).digest('base64url').slice(0, 32)
}

const hits = new Map<string, number[]>()
const MAX_KEYS = 5000

function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  // Keep memory bounded if many addresses hit the form: drop the ones whose window has passed.
  if (hits.size > MAX_KEYS) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k)
  }
  return recent.length <= limit
}

async function redisLimit(url: string, token: string, key: string, limit: number, windowMs: number) {
  // INCR, then EXPIRE NX sets the window only on the first hit: a fixed window per key.
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, Math.ceil(windowMs / 1000), 'NX'],
    ]),
    cache: 'no-store',
    signal: AbortSignal.timeout(2000),
  })
  const data = (await res.json()) as { result?: unknown; error?: string }[]
  if (!res.ok || !Array.isArray(data) || data.some((r) => r.error)) throw new Error(`Redis error ${res.status}`)
  return Number(data[0].result) <= limit
}

/** True while the caller is within `limit` requests per `windowMs`. Pass hashIp(ip) as the key. */
export async function allow(key: string, limit: number, windowMs: number) {
  const redis = redisConfig()
  if (redis) {
    try {
      return await redisLimit(redis.url, redis.token, `portfolio:contact:${key}`, limit, windowMs)
    } catch (err) {
      console.error('[rate-limit] Redis unavailable, counting in memory', err)
    }
  }
  return memoryLimit(key, limit, windowMs)
}
