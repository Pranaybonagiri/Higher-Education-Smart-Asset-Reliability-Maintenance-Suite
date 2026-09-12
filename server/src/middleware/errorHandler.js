export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message,
      details: err.details || null,
      timestamp: new Date().toISOString(),
    },
  });
};

