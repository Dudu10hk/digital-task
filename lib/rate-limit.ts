import { NextRequest } from "next/server"

// Simple in-memory rate limiter
// For production, use Redis (Upstash) or similar
class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }>

  constructor() {
    this.requests = new Map()
  }

  check(identifier: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const record = this.requests.get(identifier)

    // Clean up old records
    if (record && record.resetAt < now) {
      this.requests.delete(identifier)
    }

    if (!record || record.resetAt < now) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      })
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: now + windowMs,
      }
    }

    // Check if limit exceeded
    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      }
    }

    // Increment counter
    record.count++
    this.requests.set(identifier, record)

    return {
      allowed: true,
      remaining: limit - record.count,
      resetAt: record.resetAt,
    }
  }

  reset(identifier: string) {
    this.requests.delete(identifier)
  }

  // Clean up expired records (call periodically)
  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (record.resetAt < now) {
        this.requests.delete(key)
      }
    }
  }
}

// Rate limiters for different endpoints
export const loginRateLimiter = new RateLimiter()
export const otpRateLimiter = new RateLimiter()
export const apiRateLimiter = new RateLimiter()
export const uploadRateLimiter = new RateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  LOGIN: {
    limit: 5, // 5 attempts
    window: 15 * 60 * 1000, // 15 minutes
  },
  OTP: {
    limit: 3, // 3 OTP requests
    window: 5 * 60 * 1000, // 5 minutes
  },
  API: {
    limit: 100, // 100 requests
    window: 60 * 1000, // 1 minute
  },
  UPLOAD: {
    limit: 10, // 10 uploads
    window: 60 * 1000, // 1 minute
  },
}

/**
 * Get identifier from request (IP or user ID)
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`
  
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"
  
  return `ip:${ip}`
}

/**
 * Apply rate limit middleware
 */
export function applyRateLimit(
  identifier: string,
  limiter: RateLimiter,
  config: { limit: number; window: number }
) {
  const result = limiter.check(identifier, config.limit, config.window)
  
  return {
    ...result,
    headers: {
      "X-RateLimit-Limit": config.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
    },
  }
}

/**
 * Generate rate limit response
 */
export function rateLimitResponse(resetAt: number) {
  const resetTime = new Date(resetAt)
  const waitSeconds = Math.ceil((resetAt - Date.now()) / 1000)
  
  return new Response(
    JSON.stringify({
      error: "יותר מדי בקשות",
      message: `נסה שוב בעוד ${waitSeconds} שניות`,
      resetAt: resetTime.toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": waitSeconds.toString(),
        "X-RateLimit-Reset": resetTime.toISOString(),
      },
    }
  )
}

// Cleanup expired records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    loginRateLimiter.cleanup()
    otpRateLimiter.cleanup()
    apiRateLimiter.cleanup()
    uploadRateLimiter.cleanup()
  }, 5 * 60 * 1000)
}
