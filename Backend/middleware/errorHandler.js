
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Log all errors for debugging
    console.error('Error Details:', {
      name: err.name,
      message: err.message,
      statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    if (err.name === 'CastError') {
      statusCode = 404;
      message = `Resource not found with id: ${err.value}`;
    }

    if (err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors)
        .map((e) => e.message)
        .join(', ');
    }

    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };

  module.exports = errorHandler;

