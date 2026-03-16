const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;
const JWT_TTL = process.env.JWT_EXPIRES_IN || '7d';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'manoshaanti-dev-secret-change-in-production';
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createJwtToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: JWT_TTL }
  );
}

async function signup(req, res) {
  const username = clean(req.body?.username || req.body?.name);
  const email = clean(req.body?.email).toLowerCase();
  const password = clean(req.body?.password);

  if (!username) {
    return res.status(400).json({ error: 'username is required.' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters.' });
  }

  const existingByEmail = User.findByEmail(email);
  if (existingByEmail) {
    return res.status(409).json({ error: 'Email already registered. Please login.' });
  }

  const existingByUsername = User.findByUsername(username);
  if (existingByUsername) {
    return res.status(409).json({ error: 'Username already in use.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = User.createUser({ username, email, passwordHash });

  const token = createJwtToken(user);

  return res.status(201).json({
    message: 'Signup successful.',
    user,
    token,
    tokenType: 'Bearer',
  });
}

async function login(req, res) {
  const email = clean(req.body?.email).toLowerCase();
  const password = clean(req.body?.password);

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const user = User.findByEmail(email);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = createJwtToken(user);

  return res.json({
    message: 'Login successful.',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
    tokenType: 'Bearer',
  });
}

function me(req, res) {
  if (!req.authUser) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  return res.json({
    user: {
      id: req.authUser.sub,
      username: req.authUser.username,
      email: req.authUser.email,
    },
  });
}

module.exports = {
  signup,
  login,
  me,
};
