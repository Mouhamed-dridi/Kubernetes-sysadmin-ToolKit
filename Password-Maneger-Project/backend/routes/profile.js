const { Router } = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const user = await db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: req.userId, username: user.username, avatar: user.avatar, is_admin: !!user.is_admin } });
});

router.put('/', authenticate, async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  const user = await db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await db.updateUserProfile(req.userId, username);
  res.json({ success: true, user: { id: req.userId, username } });
});

router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
  if (newPassword.length < 4) return res.status(400).json({ error: 'New password must be at least 4 characters' });
  const user = await db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) return res.status(400).json({ error: 'Current password is incorrect' });
  await db.updateUserPassword(req.userId, bcrypt.hashSync(newPassword, 10));
  res.json({ success: true });
});

router.put('/avatar', authenticate, async (req, res) => {
  const { avatar } = req.body;
  if (!avatar) return res.status(400).json({ error: 'Avatar data required' });
  await db.updateUserAvatar(req.userId, avatar);
  res.json({ success: true, avatar });
});

module.exports = router;
