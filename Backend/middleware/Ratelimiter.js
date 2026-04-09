const rateLimit = require('express-rate-limit');

const limitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000),
  });
};

const isProduction = process.env.NODE_ENV === 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isProduction ? 10 : 50,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,  
  legacyHeaders: false,   
  handler: limitHandler,
  skipSuccessfulRequests: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isProduction ? 3 : 10, // 3 attempts per minute in production
  message: 'Too many password reset requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  skip: (req) => req.method !== 'POST',
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: isProduction ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  skip: (req) => {

    return req.path === '/api/health';
  },
});

const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: isProduction ? 60 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  skip: (req) => req.method === 'GET', 
});

const statsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: isProduction ? 50 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});

module.exports = { authLimiter, forgotPasswordLimiter, generalLimiter, writeLimiter, statsLimiter };

