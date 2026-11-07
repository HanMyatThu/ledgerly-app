// Small helpers for building HTTP errors that errorHandler understands.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (details) this.details = details;
  }
}

export function notFound(what = 'Resource') {
  return new HttpError(404, `${what} not found`);
}

// Wraps a route handler so thrown errors and rejected promises
// reach the error handler instead of crashing or hanging the request.
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
  };
}
