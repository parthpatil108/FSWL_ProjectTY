/**
 * Centralized JWT Secret Configuration
 * Ensures production requires a strong, explicit JWT_SECRET.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Security Error] JWT_SECRET must be set in production environment.');
    }
    return 'daymark_jwt_secret_dev_key_2026_modern_secure';
  }
  return secret;
}

module.exports = { getJwtSecret };
