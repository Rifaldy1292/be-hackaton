export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const secure = process.env.NODE_ENV === 'production';

export const cookieBase = {
  httpOnly: true as const,
  secure,
  sameSite: 'lax' as const, // jika subdomain berbeda dan perlu cross-site, atur 'none' + wajib HTTPS
  domain: process.env.COOKIE_DOMAIN || 'localhost',
  path: '/',
};

export const accessCookieOptions = {
  ...cookieBase,
  // opsional: maxAge sinkron dengan TTL access token (ms)
  // maxAge: 24 * 60 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...cookieBase,
  // maxAge: 7 * 24 * 60 * 60 * 1000,
};
