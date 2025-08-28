export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key-for-development-only',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
