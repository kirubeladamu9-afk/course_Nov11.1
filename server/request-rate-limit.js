export const createRequestRateLimiter = ({ limit, windowMs, maxKeys = 10000, now = Date.now }) => {
  const clients = new Map()

  return (request, response, next) => {
    const key = request.ip ?? request.socket.remoteAddress ?? 'unknown'
    const timestamp = now()
    let entry = clients.get(key)

    if (!entry || entry.resetAt <= timestamp) {
      if (entry) clients.delete(key)
      if (clients.size >= maxKeys) clients.delete(clients.keys().next().value)
      entry = { count: 0, resetAt: timestamp + windowMs }
      clients.set(key, entry)
    }

    entry.count += 1
    if (entry.count > limit) {
      response.set('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - timestamp) / 1000))))
      return response.status(429).json({ message: 'Too many requests. Please try again later.' })
    }
    return next()
  }
}
