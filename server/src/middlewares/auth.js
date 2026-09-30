const crypto = require('crypto');

const SESSION_COOKIE = 'tool_face_session';
const OAUTH_STATE_COOKIE = 'tool_face_oauth_state';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return cookies;
    const key = part.slice(0, separator).trim();
    try {
      cookies[key] = decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      cookies[key] = '';
    }
    return cookies;
  }, {});
}

function appendCookie(res, cookie) {
  const current = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', current ? [...[].concat(current), cookie] : cookie);
}

function cookieOptions(req, maxAge) {
  const forwardedProtocol = req.get('x-forwarded-proto');
  const secure = process.env.COOKIE_SECURE === 'true'
    || (process.env.COOKIE_SECURE !== 'false' && (req.secure || forwardedProtocol === 'https'));
  return `Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

function setCookie(req, res, name, value, maxAge) {
  appendCookie(res, `${name}=${encodeURIComponent(value)}; ${cookieOptions(req, maxAge)}`);
}

function clearCookie(req, res, name) {
  setCookie(req, res, name, '', 0);
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  return typeof secret === 'string' && secret.length >= 32 ? secret : null;
}

function authConfiguration() {
  const missing = [];
  if (!process.env.FACEBOOK_APP_ID) missing.push('FACEBOOK_APP_ID');
  if (!process.env.FACEBOOK_APP_SECRET) missing.push('FACEBOOK_APP_SECRET');
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) missing.push('SESSION_SECRET (tối thiểu 32 ký tự)');
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_ID === process.env.FACEBOOK_PAGE_ID) {
    missing.push('FACEBOOK_APP_ID phải là Meta App ID, không phải FACEBOOK_PAGE_ID');
  }
  return { configured: missing.length === 0, missing, adminConfigured: adminIds().size > 0 };
}

function facebookRedirectUri() {
  return process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback';
}

function clientOrigin() {
  return (process.env.CLIENT_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
}

function adminIds() {
  return new Set((process.env.FACEBOOK_ADMIN_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean));
}

function signSession(user) {
  const secret = getSessionSecret();
  if (!secret) throw new Error('SESSION_SECRET must contain at least 32 characters.');

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: String(user.id),
    name: String(user.name || 'Facebook user').slice(0, 120),
    role: adminIds().has(String(user.id)) ? 'admin' : 'user',
    iat: now,
    exp: now + SESSION_TTL_SECONDS
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySession(token) {
  const secret = getSessionSecret();
  if (!secret || typeof token !== 'string') return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;

  const payload = token.slice(0, separator);
  const providedSignature = Buffer.from(token.slice(separator + 1));
  const expectedSignature = Buffer.from(crypto.createHmac('sha256', secret).update(payload).digest('base64url'));
  if (providedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(providedSignature, expectedSignature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.sub || !session.exp || session.exp <= Math.floor(Date.now() / 1000)) return null;
    session.role = adminIds().has(String(session.sub)) ? 'admin' : 'user';
    return session;
  } catch {
    return null;
  }
}

function loadSession(req, _res, next) {
  const cookies = parseCookies(req.headers.cookie);
  req.user = verifySession(cookies[SESSION_COOKIE]);
  next();
}

function originIsAllowed(req) {
  const origin = req.get('origin');
  return !origin || origin === clientOrigin();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập bằng Facebook.' });
  }
  if (!originIsAllowed(req)) {
    return res.status(403).json({ success: false, message: 'Origin không được phép.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập bằng Facebook.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Thao tác này chỉ dành cho admin.' });
  }
  if (!originIsAllowed(req)) {
    return res.status(403).json({ success: false, message: 'Origin không được phép.' });
  }
  next();
}

module.exports = {
  SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  SESSION_TTL_SECONDS,
  adminIds,
  appendCookie,
  authConfiguration,
  clearCookie,
  clientOrigin,
  facebookRedirectUri,
  loadSession,
  parseCookies,
  requireAdmin,
  requireAuth,
  setCookie,
  signSession,
  verifySession
};
