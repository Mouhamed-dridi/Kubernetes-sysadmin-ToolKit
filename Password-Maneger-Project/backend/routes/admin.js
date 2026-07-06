const { Router } = require('express');
const db = require('../db');
const { tokens, ALGO_KEY_LENGTHS, setEncryptionAlgo } = require('../utils');
const { authenticate, adminAuth } = require('../middleware/auth');

const router = Router();

router.get('/users', authenticate, adminAuth, async (req, res) => {
  const users = await db.getUsers();
  const result = [];
  for (const u of users) {
    const userId = parseInt(u._id.split(':')[1]);
    const passwords = await db.getPasswordsByUser(userId);
    result.push({ id: userId, username: u.username, avatar: u.avatar, is_admin: !!u.is_admin, password_count: passwords.length });
  }
  res.json(result);
});

router.delete('/users/:id', authenticate, adminAuth, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.userId) return res.status(400).json({ error: 'Cannot delete your own account' });
  await db.deletePasswordsByUser(targetId);
  await db.deleteUser(targetId);
  for (const [token, uid] of tokens.entries()) {
    if (uid === targetId) tokens.delete(token);
  }
  res.json({ success: true });
});

router.get('/config', authenticate, adminAuth, async (req, res) => {
  const config = await db.getConfig();
  res.json(config);
});

router.put('/config', authenticate, adminAuth, async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) return res.status(400).json({ error: 'Key and value required' });
  if (key === 'encryption_algo') {
    if (!ALGO_KEY_LENGTHS[value]) return res.status(400).json({ error: 'Invalid algorithm' });
    setEncryptionAlgo(value);
  }
  await db.setConfig(key, value);
  res.json({ success: true });
});

module.exports = router;
