import { timingSafeEqual } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { HttpError } from '../errors.js';

export function requireApiKey(expected?: string): RequestHandler {
  return (request, _response, next) => {
    if (!expected) return next();
    const actual = request.header('x-api-key') ?? '';
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);
    if (
      expectedBuffer.length !== actualBuffer.length ||
      !timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      return next(new HttpError(401, 'Invalid API key', 'UNAUTHORIZED'));
    }
    return next();
  };
}

export const notFound: RequestHandler = (request, _response, next) => {
  next(
    new HttpError(
      404,
      `No route for ${request.method} ${request.path}`,
      'NOT_FOUND',
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  next,
) => {
  // BOUNDARY: Once headers are sent, our JSON envelope can no longer replace the response.
  if (response.headersSent) {
    // WHY: Delegate so Express's default handler can terminate a failed partial/streamed response.
    return next(error);
  }
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

  request.log.error({ err: error }, 'Unhandled request error');
  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Unexpected server error',
    requestId: request.id,
  });
};
