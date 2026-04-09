const winston = require('winston');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0 && meta.stack) {
      metaStr = `\n${meta.stack}`;
    }
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: logLevel,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat
  }),
];

const logger = winston.createLogger({
  level: logLevel,
  format: fileFormat,
  transports,
  exitOnError: false,
});

const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

const middleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      user: req.user?._id?.toString() || 'guest',
    };

    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, logData);
    } else {
      logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, logData);
    }
  });

  next();
};

module.exports = { logger, middleware, stream };