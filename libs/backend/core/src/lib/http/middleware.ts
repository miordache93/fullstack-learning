// WHAT: Import only Express middleware types and Zod's public error type.
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors.js';

// WHAT: Turn an unmatched route into the same stable problem envelope.
export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    code: 'ROUTE_NOT_FOUND',
    message: `No route for ${request.method} ${request.path}`,
  });
};

// BOUNDARY: This must have four arguments so Express recognizes error middleware.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  // WHAT: Validation errors are safe, expected client failures.
  if (error instanceof ZodError) {
    response.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues,
    });
    return;
  }

  // WHAT: Intentional domain/HTTP errors keep their stable public policy.
  if (error instanceof HttpError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return;
  }

  // SECURITY: Do not serialize an unknown stack, SQL text, credentials, or driver object.
  console.error('[unexpected-request-error]', error);
  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
};