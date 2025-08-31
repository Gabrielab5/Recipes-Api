const rateLimit = require('express-rate-limit');

// Configure rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-7', // Draft standard for HTTP rate limit headers
    legacyHeaders: false, 
    message: {
        error: true,
        message: 'Too many requests from this IP, please try again after 15 minutes',
        statusCode: 429
    },
});

module.exports = apiLimiter;
