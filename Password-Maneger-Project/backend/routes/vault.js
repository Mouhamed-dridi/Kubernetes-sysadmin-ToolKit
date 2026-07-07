const { Router } = require('express');
const db = require('../db');
const { encrypt, decrypt, saveUploadSnapshot, savePasswordsBackup } = require('../utils');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const rows = await db.getPasswordsByUser(req.userId);
  res.json(rows);
});

router.post('/', authenticate, async (req, res) => {
  const { title, url, login, password } = req.body;
  if (!title || !login || !password) return res.status(400).json({ error: 'title, login, password required' });
  const encUrl = encrypt(url || '');
  const encLogin = encrypt(login);
  const encPass = encrypt(password);
  const item = await db.createPassword(req.userId, title, encUrl, encLogin, encPass);
  res.json({ success: true, item });
});

router.delete('/:id', authenticate, async (req, res) => {
  const passId = parseInt(req.params.id);
  await db.deletePassword(req.userId, passId);
  res.json({ success: true });
});

router.post('/upload', authenticate, async (req, res) => {
  const items = req.body.items;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid items' });
  for (const item of items) {
    const encUrl = encrypt(item.url || '');
    const encLogin = encrypt(item.login || '');
    const encPass = encrypt(item.password || '');
    await db.createPassword(req.userId, item.title || 'Untitled', encUrl, encLogin, encPass);
  }
  const user = await db.getUserById(req.userId);
  const username = user ? user.username : 'unknown';
  saveUploadSnapshot(req.userId, username, items);
  const allPasswords = await db.getPasswordsByUser(req.userId);
  savePasswordsBackup(req.userId, username, allPasswords);
  res.json({ success: true, count: items.length });
});

router.post('/decrypt', (req, res) => {
  const { encryptedText } = req.body;
  if (!encryptedText) return res.status(400).json({ error: 'Missing encrypted text' });
  if (encryptedText.startsWith('hash:')) return res.json({ decrypted: null, hashMode: true });
  try {
    const decrypted = decrypt(encryptedText);
    res.json({ decrypted });
  } catch {
    res.status(400).json({ error: 'Decryption failed' });
  }
});

module.exports = router;
