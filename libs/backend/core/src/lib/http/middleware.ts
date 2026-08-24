// WHAT: Use constant-time comparison for equal-length secret byte sequences.
import { timingSafeEqual } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { HttpError } from '../errors.js';

// BOUNDARY: Apply a small teaching authentication policy after public health routes.
export function requireApiKey(expected?: string): RequestHandler {
  return (request, _response, next) => {
    // WHY: Local development remains usable until the environment configures a key.
    if (!expected) return next();
    const actual = request.header('x-api-key') ?? '';
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);
    // SECURITY: Check length first because timingSafeEqual requires equal-sized buffers.
    if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
      return next(new HttpError(401, 'Invalid API key', 'UNAUTHORIZED'));
    }
    return next();
  };
}

// WHAT: Forward unmatched routes into the one error-translation boundary.
export const notFound: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, `No route for ${request.method} ${request.path}`, 'ROUTE_NOT_FOUND'));
};

// BOUNDARY: Four arguments make this Express error-handling middleware.
export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  // WHY: Once bytes were sent, only Express's default handler can fail the stream safely.
  if (response.headersSent) return next(error);

  if (error instanceof ZodError) {
    response.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      requestId: request.id,
      details: error.issues,
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    // WHAT: Distinguish an oversized payload from another malformed multipart request.
    response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      code: error.code,
      message: error.message,
      requestId: request.id,
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
      requestId: request.id,
      details: error.details,
    });
    return;
  }

  // SECURITY: Log the unknown error internally but return no stack or driver detail.
  request.log.error({ err: error }, 'Unhandled request error');
  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Unexpected server error',
    requestId: request.id,
  });
};