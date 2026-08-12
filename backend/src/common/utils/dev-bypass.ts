/**
 * Shared gate for the temporary no-database admin-login bypass (AUTH_DEV_BYPASS).
 * NODE_ENV is checked here too — defense-in-depth so the bypass can never activate
 * in a production deployment even if AUTH_DEV_BYPASS=true is left in a .env by
 * mistake. Remove this whole mechanism (and every caller of this function) once a
 * real DATABASE_URL is connected and a seeded super_admin account exists.
 */
export function isDevBypassActive(): boolean {
  return process.env.AUTH_DEV_BYPASS === 'true' && process.env.NODE_ENV !== 'production';
}
