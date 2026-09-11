let Sentry = null;

exports.initSentry = () => {
  if (!process.env.SENTRY_DSN) return null;
  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    });
    console.log('[sentry] backend reporting enabled');
    return Sentry;
  } catch (error) {
    console.warn('[sentry] init skipped:', error.message);
    return null;
  }
};

exports.captureError = (error) => {
  if (Sentry) Sentry.captureException(error);
};

exports.setupSentryErrorHandler = (app) => {
  if (Sentry && typeof Sentry.setupExpressErrorHandler === 'function') {
    Sentry.setupExpressErrorHandler(app);
  }
};
