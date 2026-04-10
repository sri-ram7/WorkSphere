const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const Sentry = require('@sentry/node');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { logger, middleware } = require('./middleware/Logger.js');
const { authLimiter, generalLimiter, writeLimiter, statsLimiter } = require('./middleware/Ratelimiter.js');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error(`\n❌ FATAL: Missing required environment variables:`);
  console.error(missingEnvVars.join(', '));
  console.error(`\nPlease set these variables in your .env file\n`);
  process.exit(1);
}

const CLIENT_URL = process.env.CLIENT_URL;

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
  });
  logger.info('✅ Sentry error tracking initialized');
} else {
  logger.warn("⚠️ Sentry DSN not configured - errors won't be tracked remotely");
}

connectDB()
  .then(async () => {
    try {
      require('./models/User');
      require('./models/Expense');
      require('./models/Event');
      require('./models/Task');
      require('./models/Attendance');
      logger.info('✅ Database models loaded and indexes initialized');
    } catch (err) {
      logger.error(`❌ Error loading models: ${err.message}`);
    }
  })
  .catch((err) => {
    logger.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

const app = express();

if (Sentry.Handlers?.requestHandler) app.use(Sentry.Handlers.requestHandler());
if (Sentry.Handlers?.tracingHandler) app.use(Sentry.Handlers.tracingHandler());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", CLIENT_URL],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 365 * 24 * 60 * 60, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

app.use(middleware);

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

const allowedOrigins = [
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(/^http:\/\/localhost(:\d+)?$/);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') return allowed === origin;
        if (allowed instanceof RegExp) return allowed.test(origin);
        return false;
      });

      if (isAllowed || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

app.use((req, res, next) => {
  const contentType = req.headers['content-type'];
  if (
    req.method !== 'GET' &&
    req.method !== 'HEAD' &&
    !contentType?.startsWith('application/json')
  ) {
    return res
      .status(415)
      .json({ success: false, message: 'Content-Type must be application/json' });
  }
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

const csrfProtection = csrf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
  },
});

app.use(csrfProtection);

app.get('/api/csrf-token', (req, res) => {
  res.status(200).json({
    success: true,
    csrfToken: req.csrfToken(),
  });
});

app.use('/api', generalLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WorkSphere API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/expenses/stats', statsLimiter);
app.use('/api/expenses', writeLimiter, require('./routes/expenses'));
app.use('/api/tasks', writeLimiter, require('./routes/tasks'));
app.use('/api/events', writeLimiter, require('./routes/events'));
app.use('/api/attendance', writeLimiter, require('./routes/attendance'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

if (Sentry.Handlers?.errorHandler) app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  logger.info(`\n WorkSphere API\n http://localhost:${PORT}\n Environment : ${env}\n Helmet      : active\n`);
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);

  server.close(async (err) => {
    if (err) {
      logger.error('Error closing server:', err);
      process.exit(1);
    }

    try {
      await mongoose.connection.close();
      logger.info('✅ MongoDB connection closed');
    } catch (err) {
      logger.error('Error closing MongoDB:', err);
    }

    logger.info('✅ Server shut down gracefully');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('❌ Forced shutdown after 30 seconds');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
