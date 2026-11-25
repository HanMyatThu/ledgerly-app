// Express error handler: turns thrown errors into JSON responses.
// Errors may carry a `status` (or `statusCode`) and a `details` object.
// Express spots error handlers by their four arguments, so `_next` must stay.
export function errorHandler(err, req, res, _next) {
  // Malformed JSON bodies come from express.json() as a 400 with type entity.parse.failed.
  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) {
    console.error(err);
    res.status(status).json({ error: 'Something went wrong' });
    return;
  }

  const body = { error: err.expose === false ? 'Bad request' : err.message };
  if (err.details) body.errors = err.details;
  res.status(status).json(body);
}
