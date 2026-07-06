const { tokens } = require('../utils');
const db = require('../db');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  const token = header.replace('Bearer ', '');
  const userId = tokens.get(token);
  if (!userId) return res.status(401).json({ error: 'Invalid token' });
  req.userId = userId;
  next();
}

function adminAuth(req, res, next) {
  db.getUserById(req.userId).then(user => {
    if (!user || !user.is_admin) return res.status(403).json({ error: 'Admin access required' });
    next();
  }).catch(err => res.status(500).json({ error: err.message }));
}

module.exports = { authenticate, adminAuth };
