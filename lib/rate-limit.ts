interface RateLimitContext {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitContext>();

/**
 * Basic in-memory rate limiter.
 * In a serverless edge environment with multiple instances, this is per-instance.
 * For production, consider using Redis (e.g., Upstash).
 * 
 * @param ip The IP address or user ID to rate limit
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const context = rateLimits.get(ip);

  if (!context || now > context.resetTime) {
    rateLimits.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (context.count >= limit) {
    return { success: false, limit, remaining: 0, reset: context.resetTime };
  }

  context.count++;
  rateLimits.set(ip, context);
  
  return { success: true, limit, remaining: limit - context.count, reset: context.resetTime };
}

// Periodically clean up expired entries to prevent memory leaks in long-running processes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimits.forEach((value, key) => {
      if (now > value.resetTime) {
        rateLimits.delete(key);
      }
    });
  }, 60000); // Cleanup every minute
}
