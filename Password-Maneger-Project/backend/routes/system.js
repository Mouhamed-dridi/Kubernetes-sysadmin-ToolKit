const { Router } = require('express');
const db = require('../db');
const { tokens } = require('../utils');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/count', async (req, res) => {
  const count = await db.userCount();
  res.json({ count });
});

router.post('/export', authenticate, async (req, res) => {
  const passwords = await db.getPasswordsByUser(req.userId);
  res.json(passwords);
});

router.post('/reset', authenticate, async (req, res) => {
  await db.deletePasswordsByUser(req.userId);
  await db.deleteUser(req.userId);
  const token = req.headers.authorization.replace('Bearer ', '');
  tokens.delete(token);
  res.json({ success: true });
});

module.exports = router;
