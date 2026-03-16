const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'manoshaanti-dev-secret-change-in-production';
}

function getTokenFromRequest(req) {
  const authHeader = (req.headers.authorization || '').toString();
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return '';
}

function authenticateToken(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.authUser = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    req.authUser = null;
    return next();
  }

  try {
    req.authUser = jwt.verify(token, getJwtSecret());
  } catch {
    req.authUser = null;
  }

  return next();
}

function parsePositiveInt(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}

function getUserIdFromRequest(req, location, key = 'userId') {
  if (location === 'params') {
    return parsePositiveInt(req.params?.[key]);
  }
  if (location === 'query') {
    return parsePositiveInt(req.query?.[key]);
  }
  return parsePositiveInt(req.body?.[key]);
}

function requireUserScope(location, key = 'userId') {
  return function userScopeMiddleware(req, res, next) {
    const requestUserId = getUserIdFromRequest(req, location, key);

    if (requestUserId === null) {
      return next();
    }

    const authUserId = Number(req.authUser?.sub);
    if (!Number.isInteger(authUserId)) {
      return res.status(401).json({ error: 'Authentication token is required.' });
    }

    if (requestUserId !== authUserId) {
      return res.status(403).json({ error: 'You can only access your own data.' });
    }

    return next();
  };
}

function requireAuthWhenUserIdPresent(location, key = 'userId') {
  return function authWhenUserIdPresent(req, res, next) {
    const requestUserId = getUserIdFromRequest(req, location, key);

    if (requestUserId === null) {
      return next();
    }

    const authUserId = Number(req.authUser?.sub);
    if (!Number.isInteger(authUserId)) {
      return res.status(401).json({ error: 'Authentication token is required for personal data.' });
    }

    if (requestUserId !== authUserId) {
      return res.status(403).json({ error: 'You can only access your own data.' });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireUserScope,
  requireAuthWhenUserIdPresent,
};
