const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./db');
const { setEncryptionAlgo, ALGO_KEY_LENGTHS } = require('./utils');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vault', require('./routes/vault'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/system', require('./routes/system'));

async function init() {
  await db.initConfig();

  const config = await db.getConfig();
  if (config.encryption_algo && ALGO_KEY_LENGTHS[config.encryption_algo]) {
    setEncryptionAlgo(config.encryption_algo);
  }

  const hash = bcrypt.hashSync('admin123', 10);
  await db.seedAdmin('admin', hash);
  console.log('Default account: admin / admin123');

  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
    console.log('5 API modules: auth, vault, profile, admin, system');
  });
}

init().catch(err => {
  console.error('Init error:', err);
  process.exit(1);
});
