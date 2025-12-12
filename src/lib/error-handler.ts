/**
 * Global Error Handler for Frontend
 * Catches and logs all errors
 */

import { logger } from './logger';

// Client-side error handler
if (typeof window !== 'undefined') {
  // Global error handler
  window.addEventListener('error', (event) => {
    const errorInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.message || String(event.error),
      stack: event.error?.stack,
    };
    logger.error('Uncaught Error', JSON.stringify(errorInfo, null, 2), 'CLIENT_ERROR');
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error 
      ? event.reason.stack || event.reason.message 
      : String(event.reason);
    logger.error(
      'Unhandled Promise Rejection',
      reason,
      'UNHANDLED_REJECTION',
    );
  });
}

// Server-side error handler (Next.js)
export function handleServerError(error: Error, context?: string) {
  logger.error(
    `Server Error${context ? ` in ${context}` : ''}`,
    error,
    'SERVER_ERROR',
  );
}

// API route error handler
export function handleApiError(error: unknown, req?: any): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorInfo = {
    message: errorObj.message,
    stack: errorObj.stack,
    url: req?.url,
    method: req?.method,
    body: req?.body,
    query: req?.query,
  };
  logger.error('API Error', JSON.stringify(errorInfo, null, 2), 'API_ERROR');
}

