const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    error: true,
    message: 'Internal Server Error',
    statusCode: 500
  };

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    error = {
      error: true,
      message: err.message,
      statusCode: 400
    };
  } else if (err.name === 'CastError') {
    error = {
      error: true,
      message: 'Invalid ID format',
      statusCode: 400
    };
  } else if (err.code === 'ENOENT') {
    error = {
      error: true,
      message: 'File not found',
      statusCode: 500
    };
  } else if (err.message) {
    error.message = err.message;
  }

  // Handle specific HTTP status codes
  if (err.statusCode) {
    error.statusCode = err.statusCode;
  }

  res.status(error.statusCode).json(error);
};

// 404 handler for routes that don't exist
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: true,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};