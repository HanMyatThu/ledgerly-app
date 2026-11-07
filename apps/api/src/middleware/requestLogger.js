// Logs one line per request once the response has finished,
// for example: "GET /api/transactions 200 3.1ms".
export function requestLogger({ log = console.log } = {}) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
    });
    next();
  };
}
