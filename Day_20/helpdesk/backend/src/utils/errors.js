export function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export function idParam(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw httpError(400, 'Invalid id');
  return n;
}
