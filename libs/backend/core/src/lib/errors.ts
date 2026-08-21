// BOUNDARY: Carry intentional public HTTP policy without leaking driver errors.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    // WHAT: Initialize the built-in Error message and stack.
    super(message);
    // WHY: Preserve the useful concrete subclass name in logs and tests.
    this.name = new.target.name;
  }
}

// WHAT: Give ordinary absence a stable status and machine-readable code.
export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

// WHAT: Represent a stale optimistic-concurrency token intentionally.
export class ConflictError extends HttpError {
  constructor(message = 'The resource changed; fetch it and retry') {
    super(409, message, 'VERSION_CONFLICT');
  }
}