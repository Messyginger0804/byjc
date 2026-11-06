function normalizeError(error) {
  if (!error) return undefined;
  return {
    name: error.name,
    message: error.message,
    ...(error.code ? { code: error.code } : {}),
  };
}

/** Emit machine-readable, secret-safe application logs. */
export function log(level, event, fields = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  };
  if (payload.error instanceof Error) payload.error = normalizeError(payload.error);
  const message = JSON.stringify(payload);
  if (level === 'error') {
    console.error(message);
  } else if (level === 'warn') {
    console.warn(message);
  } else {
    // eslint-disable-next-line no-console -- structured operational event
    console.info(message);
  }
}
