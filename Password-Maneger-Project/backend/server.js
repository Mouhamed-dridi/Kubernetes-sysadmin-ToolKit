const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory token store (token -> userId)
const tokens = new Map();

// Database setup with migration
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Database connection error:', err);
    else {
        // Drop old single-user tables, recreate with new schema
        db.run(`DROP TABLE IF EXISTS config`);
        db.run(`DROP TABLE IF EXISTS passwords`);
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            avatar TEXT
        )`);
        // Add avatar column if missing (for existing databases)
        db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`, () => {});
        db.run(`CREATE TABLE IF NOT EXISTS passwords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT,
            encrypted_login TEXT,
            encrypted_password TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
    }
});

// Encryption setup (AES-256-CBC)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text) {
    if (!text) return text;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text) return text;
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
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
        const token = generateToken();
        tokens.set(token, this.lastID);
        res.json({ success: true, token, user: { id: this.lastID, username } });
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
        res.json({ success: true, token, user: { id: user.id, username: user.username } });
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
    db.get(`SELECT id, username, avatar FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ user });
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
    res.json({ success: true, count: items.length });
});

// Decrypt field
app.post('/api/decrypt', (req, res) => {
    const { encryptedText } = req.body;
    if (!encryptedText) return res.status(400).json({ error: 'Missing encrypted text' });
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

// Seed default admin account
function seedDefault() {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`, ['admin', hash]);
    console.log('Default account: admin / admin123');
}

setTimeout(seedDefault, 200);

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
    console.log('Multi-user mode with token auth');
});
