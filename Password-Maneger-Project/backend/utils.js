const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const tokens = new Map();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
let encryptionAlgo = 'aes-256-cbc';

const ALGO_KEY_LENGTHS = {
  'aes-128-cbc': 16, 'aes-128-gcm': 16,
  'aes-192-cbc': 24, 'aes-192-gcm': 24,
  'aes-256-cbc': 32, 'aes-256-gcm': 32,
};

function getAlgoKey(algo) {
  const len = ALGO_KEY_LENGTHS[algo] || 32;
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (key.length === len) return key;
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest().subarray(0, len);
}

function encrypt(text) {
  if (!text) return text;
  const algo = encryptionAlgo;
  const key = getAlgoKey(algo);
  const isGCM = algo.endsWith('-gcm');
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algo, key, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  if (isGCM) {
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
  }
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  const algo = encryptionAlgo;
  const key = getAlgoKey(algo);
  const isGCM = algo.endsWith('-gcm');
  if (isGCM) {
    let parts = text.split(':');
    let iv = Buffer.from(parts.shift(), 'hex');
    let authTag = Buffer.from(parts.shift(), 'hex');
    let encryptedText = Buffer.from(parts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algo, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(algo, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function saveAccountsFile(username) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), username }) + '\n';
  fs.appendFileSync(path.join(DATA_DIR, 'accounts.json'), line, 'utf8');
}

function saveUploadSnapshot(userId, username, items) {
  const timestamp = Date.now();
  const filename = `upload_${timestamp}_user${userId}.json`;
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify({ timestamp, userId, username, items }, null, 2), 'utf8');
}

function savePasswordsBackup(userId, username, passwords) {
  const timestamp = Date.now();
  const filename = `passwords_backup_${timestamp}.json`;
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify({ timestamp, userId, username, count: passwords.length, passwords }, null, 2), 'utf8');
}

function setEncryptionAlgo(algo) {
  encryptionAlgo = algo;
}

function getEncryptionAlgo() {
  return encryptionAlgo;
}

module.exports = {
  tokens,
  ALGO_KEY_LENGTHS,
  encrypt,
  decrypt,
  generateToken,
  saveAccountsFile,
  saveUploadSnapshot,
  savePasswordsBackup,
  setEncryptionAlgo,
  getEncryptionAlgo,
  DATA_DIR,
};
