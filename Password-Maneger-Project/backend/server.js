const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// In-memory token store (token -> userId)
const tokens = new Map();

// Database setup with migration
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Database connection error:', err);
});

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS config`);
    db.run(`DROP TABLE IF EXISTS passwords`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        is_admin INTEGER DEFAULT 0
    )`);
    db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`, () => {});
    db.run(`CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT,
        encrypted_login TEXT,
        encrypted_password TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO config (key, value) VALUES ('encryption_algo', 'aes-256-cbc')`);

    // Load encryption algo from config on startup
    db.get(`SELECT value FROM config WHERE key = 'encryption_algo'`, [], (err, row) => {
        if (row && (ALGO_KEY_LENGTHS[row.value] || row.value === 'md5' || row.value === 'sha256')) encryptionAlgo = row.value;
    });
});

// Encryption setup (AES-256-CBC + hash support)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
let encryptionAlgo = 'aes-256-cbc';

const ALGO_KEY_LENGTHS = {
    'aes-128-cbc': 16,
    'aes-128-gcm': 16,
    'aes-192-cbc': 24,
    'aes-192-gcm': 24,
    'aes-256-cbc': 32,
    'aes-256-gcm': 32,
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
    if (algo === 'md5') return 'hash:md5:' + crypto.createHash('md5').update(text).digest('hex');
    if (algo === 'sha256') return 'hash:sha256:' + crypto.createHash('sha256').update(text).digest('hex');
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
    if (text.startsWith('hash:')) return '[hash only - cannot decrypt]';
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

// Auto-save helpers
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

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Auth middleware
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });
    const token = header.replace('Bearer ', '');
    const userId = tokens.get(token);
    if (!userId) return res.status(401).json({ error: 'Invalid token' });
    req.userId = userId;
    next();
}

// --- Endpoints ---

// Get total user count (for first-access flow)
app.get('/api/users/count', (req, res) => {
    db.get(`SELECT COUNT(*) as count FROM users`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ count: row.count });
    });
});

// Register new user
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const hash = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, hash], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username already exists' });
            return res.status(500).json({ error: err.message });
        }
        saveAccountsFile(username);
        const token = generateToken();
        tokens.set(token, this.lastID);
        res.json({ success: true, token, user: { id: this.lastID, username, is_admin: false } });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Invalid username or password' });

        const token = generateToken();
        tokens.set(token, user.id);
        res.json({ success: true, token, user: { id: user.id, username: user.username, is_admin: !!user.is_admin } });
    });
});

// Logout
app.post('/api/logout', authenticate, (req, res) => {
    const header = req.headers.authorization;
    const token = header.replace('Bearer ', '');
    tokens.delete(token);
    res.json({ success: true });
});

// Get current user info
app.get('/api/me', authenticate, (req, res) => {
    db.get(`SELECT id, username, avatar, is_admin FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ user: { ...user, is_admin: !!user.is_admin } });
    });
});

// Update profile (username)
app.post('/api/update-profile', authenticate, (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    db.run(`UPDATE users SET username = ? WHERE id = ?`, [username, req.userId], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username already taken' });
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, user: { id: req.userId, username } });
    });
});

// Change password
app.post('/api/change-password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'New password must be at least 4 characters' });

    db.get(`SELECT password_hash FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const hash = bcrypt.hashSync(newPassword, 10);
        db.run(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.userId], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ success: true });
        });
    });
});

// Upload avatar (base64)
app.post('/api/upload-avatar', authenticate, (req, res) => {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ error: 'Avatar data required' });

    db.run(`UPDATE users SET avatar = ? WHERE id = ?`, [avatar, req.userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, avatar });
    });
});

// Get passwords for authenticated user
app.get('/api/passwords', authenticate, (req, res) => {
    db.all(`SELECT * FROM passwords WHERE user_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Upload CSV
app.post('/api/upload', authenticate, (req, res) => {
    const items = req.body.items;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid items' });

    const stmt = db.prepare(`INSERT INTO passwords (user_id, title, encrypted_login, encrypted_password) VALUES (?, ?, ?, ?)`);
    items.forEach(item => {
        const encLogin = encrypt(item.login || '');
        const encPass = encrypt(item.password || '');
        stmt.run(req.userId, item.title || 'Untitled', encLogin, encPass);
    });
    stmt.finalize();

    // Auto-save uploaded items and backup
    db.get(`SELECT username FROM users WHERE id = ?`, [req.userId], (err, user) => {
        const username = user ? user.username : 'unknown';
        saveUploadSnapshot(req.userId, username, items);
        db.all(`SELECT * FROM passwords WHERE user_id = ?`, [req.userId], (err2, rows) => {
            if (!err2) savePasswordsBackup(req.userId, username, rows);
        });
    });

    res.json({ success: true, count: items.length });
});

// Decrypt field
app.post('/api/decrypt', (req, res) => {
    const { encryptedText } = req.body;
    if (!encryptedText) return res.status(400).json({ error: 'Missing encrypted text' });
    if (encryptedText.startsWith('hash:')) return res.json({ decrypted: null, hashMode: true });
    try {
        const decrypted = decrypt(encryptedText);
        res.json({ decrypted });
    } catch (e) {
        res.status(400).json({ error: 'Decryption failed' });
    }
});

// Reset user's data
app.post('/api/reset', authenticate, (req, res) => {
    db.run(`DELETE FROM passwords WHERE user_id = ?`, [req.userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`DELETE FROM users WHERE id = ?`, [req.userId], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const header = req.headers.authorization;
            const token = header.replace('Bearer ', '');
            tokens.delete(token);
            res.json({ success: true });
        });
    });
});

// Admin middleware
function adminAuth(req, res, next) {
    db.get(`SELECT is_admin FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user || !user.is_admin) return res.status(403).json({ error: 'Admin access required' });
        next();
    });
}

// Admin: list all users with password count
app.get('/api/admin/users', authenticate, adminAuth, (req, res) => {
    db.all(`SELECT u.id, u.username, u.avatar, u.is_admin,
            (SELECT COUNT(*) FROM passwords WHERE user_id = u.id) as password_count
            FROM users u ORDER BY u.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(u => ({ ...u, is_admin: !!u.is_admin })));
    });
});

// Admin: delete a user and their passwords
app.delete('/api/admin/users/:id', authenticate, adminAuth, (req, res) => {
    const targetId = parseInt(req.params.id);
    if (targetId === req.userId) return res.status(400).json({ error: 'Cannot delete your own account' });

    db.run(`DELETE FROM passwords WHERE user_id = ?`, [targetId], () => {
        db.run(`DELETE FROM users WHERE id = ?`, [targetId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
            // Remove any active tokens for the deleted user
            for (const [token, uid] of tokens.entries()) {
                if (uid === targetId) tokens.delete(token);
            }
            res.json({ success: true });
        });
    });
});

// Admin: get configuration
app.get('/api/admin/config', authenticate, adminAuth, (req, res) => {
    db.all(`SELECT key, value FROM config`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const config = {};
        rows.forEach(r => config[r.key] = r.value);
        res.json(config);
    });
});

// Admin: update configuration
app.post('/api/admin/config', authenticate, adminAuth, (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'Key and value required' });

    if (key === 'encryption_algo') {
        const valid = ALGO_KEY_LENGTHS[value] || value === 'md5' || value === 'sha256';
        if (!valid) return res.status(400).json({ error: 'Invalid algorithm' });
        encryptionAlgo = value;
    }

    db.run(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`, [key, value], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Seed default admin account
function seedDefault() {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)`, ['admin', hash]);
    db.run(`UPDATE users SET is_admin = 1, password_hash = ? WHERE username = 'admin'`, [hash]);
    console.log('Default account: admin / admin123');
}

setTimeout(seedDefault, 200);

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
    console.log('Multi-user mode with token auth');
});
