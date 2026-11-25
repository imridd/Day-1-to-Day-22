export const env = (key, fallback) => {
  return process.env[key] ?? fallback;
};

export const JWT_SECRET = env(
  'JWT_SECRET',
  'dev-only-change-this-secret'
);