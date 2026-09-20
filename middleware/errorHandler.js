// Centralized Error Handling Middleware

const notFoundHandler = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: '404 - Page Not Found',
    path: req.originalUrl,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('[Application Error]:', err);

  const statusCode = err.status || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).render('error', {
    pageTitle: `${statusCode} - Server Error`,
    statusCode,
    message: err.message || 'Something went wrong on our servers. Please try again later.',
    error: isDev ? err : {},
    path: req.originalUrl,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
