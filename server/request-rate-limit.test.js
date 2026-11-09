import { describe, expect, it, vi } from 'vitest'
import { createRequestRateLimiter } from './request-rate-limit.js'

const runMiddleware = (middleware, ip) => {
  const response = {
    headers: {},
    statusCode: 200,
    body: null,
    set(name, value) { this.headers[name] = value; return this },
    status(value) { this.statusCode = value; return this },
    json(value) { this.body = value; return this },
  }
  const next = vi.fn()
  middleware({ ip }, response, next)
  return { response, next }
}

describe('createRequestRateLimiter', () => {
  it('limits requests per IP during the configured window', () => {
    const limiter = createRequestRateLimiter({ limit: 2, windowMs: 60000 })

    expect(runMiddleware(limiter, '192.0.2.1').next).toHaveBeenCalledOnce()
    expect(runMiddleware(limiter, '192.0.2.1').next).toHaveBeenCalledOnce()
    const limited = runMiddleware(limiter, '192.0.2.1')

    expect(limited.next).not.toHaveBeenCalled()
    expect(limited.response.statusCode).toBe(429)
    expect(limited.response.headers['Retry-After']).toBe('60')
    expect(runMiddleware(limiter, '192.0.2.2').next).toHaveBeenCalledOnce()
  })

  it('allows requests again when the window expires', () => {
    let timestamp = 1000
    const limiter = createRequestRateLimiter({ limit: 1, windowMs: 1000, now: () => timestamp })

    runMiddleware(limiter, '192.0.2.1')
    expect(runMiddleware(limiter, '192.0.2.1').response.statusCode).toBe(429)
    timestamp += 1000

    expect(runMiddleware(limiter, '192.0.2.1').next).toHaveBeenCalledOnce()
  })

  it('bounds stored client keys', () => {
    const limiter = createRequestRateLimiter({ limit: 1, windowMs: 60000, maxKeys: 1 })

    runMiddleware(limiter, '192.0.2.1')
    const secondClient = runMiddleware(limiter, '192.0.2.2')

    expect(secondClient.next).toHaveBeenCalledOnce()
    expect(runMiddleware(limiter, '192.0.2.1').next).toHaveBeenCalledOnce()
  })
})
