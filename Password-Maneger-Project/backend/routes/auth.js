const { Router } = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { tokens, generateToken, saveAccountsFile } = require('../utils');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
  const existing = await db.getUserByUsername(username);
  if (existing) return res.status(400).json({ error: 'Username already exists' });
  const hash = bcrypt.hashSync(password, 10);
  const user = await db.createUser(username, hash);
  saveAccountsFile(username);
  const token = generateToken();
  tokens.set(token, user.id);
  res.json({ success: true, token, user: { id: user.id, username, is_admin: false } });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const user = await db.getUserByUsername(username);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });
  if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid username or password' });
  const token = generateToken();
  const userId = parseInt(user._id.split(':')[1]);
  tokens.set(token, userId);
  res.json({ success: true, token, user: { id: userId, username: user.username, is_admin: !!user.is_admin } });
});

router.post('/logout', authenticate, (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  tokens.delete(token);
  res.json({ success: true });
});

router.get('/me', authenticate, async (req, res) => {
  const user = await db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: req.userId, username: user.username, avatar: user.avatar, is_admin: !!user.is_admin } });
});

module.exports = router;
