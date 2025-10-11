import { Request, Response, NextFunction } from "express";

// Simple in-memory rate limiter
// In production, use Redis-based rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests", keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate key for rate limiting (IP + user agent by default)
    const key = keyGenerator ? keyGenerator(req) : `${req.ip}-${req.get('User-Agent')}`;
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, v] of requestCounts.entries()) {
      if (now > v.resetTime) {
        requestCounts.delete(k);
      }
    }

    const current = requestCounts.get(key);
    
    if (!current) {
      // First request in this window
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > current.resetTime) {
      // Window has expired, reset
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      // Rate limit exceeded
      const remainingTime = Math.ceil((current.resetTime - now) / 1000);
      return res.status(429).json({
        error: message,
        retryAfter: remainingTime,
        limit: max,
        remaining: 0,
        resetTime: new Date(current.resetTime).toISOString()
      });
    }

    // Increment counter
    current.count++;
    requestCounts.set(key, current);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': (max - current.count).toString(),
      'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
    });

    next();
  };
}

// Pre-configured rate limiters for different endpoints
export const postCreationLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 posts per minute per user
  message: "Too many posts created. Please wait before creating another post.",
  keyGenerator: (req) => {
    // Rate limit by author address if available, otherwise by IP
    const authorAddress = req.body?.authorAddress;
    return authorAddress ? `post-${authorAddress}` : `post-${req.ip}`;
  }
});

export const likeLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 likes per minute per user
  message: "Too many likes. Please wait before liking more posts.",
  keyGenerator: (req) => {
    const profileAddress = req.body?.profileAddress;
    return profileAddress ? `like-${profileAddress}` : `like-${req.ip}`;
  }
});

export const commentLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 comments per minute per user
  message: "Too many comments. Please wait before commenting more.",
  keyGenerator: (req) => {
    const authorAddress = req.body?.authorAddress;
    return authorAddress ? `comment-${authorAddress}` : `comment-${req.ip}`;
  }
});

export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: "Too many requests. Please slow down."
});
