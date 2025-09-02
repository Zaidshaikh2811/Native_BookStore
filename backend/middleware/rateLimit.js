const rateLimitStore = new Map();

export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        try {
            const identifier = req.user ? req.user._id.toString() : req.ip;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Clean old entries
            if (rateLimitStore.has(identifier)) {
                const requests = rateLimitStore.get(identifier).filter(time => time > windowStart);
                rateLimitStore.set(identifier, requests);
            }

            // Get current requests in window
            const requests = rateLimitStore.get(identifier) || [];

            if (requests.length >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    error: "Rate limit exceeded",
                    message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000} seconds`,
                    retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
                });
            }

            // Add current request
            requests.push(now);
            rateLimitStore.set(identifier, requests);

            // Add rate limit headers
            res.set({
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': maxRequests - requests.length,
                'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
            });

            next();

        } catch (error) {
            console.error("Rate limiting error:", error);
            next(); // Don't block request if rate limiting fails
        }
    };
};