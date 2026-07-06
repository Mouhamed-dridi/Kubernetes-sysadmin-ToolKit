const PouchDB = require('pouchdb-node');
const path = require('path');

const db = new PouchDB(path.join(__dirname, 'data', 'pouch'));

// --- Counter helpers (auto-increment IDs) ---
async function getNextId(counterName) {
  try {
    const doc = await db.get('_local/counters');
    doc[counterName] = (doc[counterName] || 0) + 1;
    await db.put(doc);
    return doc[counterName];
  } catch {
    const doc = { _id: '_local/counters' };
    doc[counterName] = 1;
    await db.put(doc);
    return 1;
  }
}

// --- User helpers ---
async function createUser(username, passwordHash, isAdmin = false) {
  const id = await getNextId('user_id');
  const doc = {
    _id: 'user:' + id,
    type: 'user',
    username,
    password_hash: passwordHash,
    avatar: null,
    is_admin: isAdmin,
  };
  await db.put(doc);
  return { id, username, is_admin: isAdmin };
}

async function getUserByUsername(username) {
  const result = await db.allDocs({ startkey: 'user:', endkey: 'user:\uffff', include_docs: true });
  for (const row of result.rows) {
    if (row.doc.username === username) return row.doc;
  }
  return null;
}

async function getUserById(id) {
  try {
    const doc = await db.get('user:' + id);
    return doc;
  } catch {
    return null;
  }
}

async function getUsers() {
  const result = await db.allDocs({ startkey: 'user:', endkey: 'user:\uffff', include_docs: true });
  return result.rows.map(r => r.doc);
}

async function deleteUser(id) {
  const doc = await db.get('user:' + id);
  await db.remove(doc);
}

async function userCount() {
  const result = await db.allDocs({ startkey: 'user:', endkey: 'user:\uffff' });
  return result.rows.length;
}

// --- Password helpers ---
async function createPassword(userId, title, encryptedLogin, encryptedPassword) {
  const id = await getNextId('password_id');
  const doc = {
    _id: 'password:' + userId + ':' + id,
    type: 'password',
    user_id: 'user:' + userId,
    title: title || 'Untitled',
    encrypted_login: encryptedLogin || '',
    encrypted_password: encryptedPassword || '',
  };
  await db.put(doc);
  return { ...doc, id: 'password:' + userId + ':' + id };
}

async function getPasswordsByUser(userId) {
  const prefix = 'password:' + userId + ':';
  const result = await db.allDocs({ startkey: prefix, endkey: prefix + '\uffff', include_docs: true });
  return result.rows.map(r => {
    const doc = r.doc;
    const idPart = doc._id.split(':').pop();
    return { id: parseInt(idPart), user_id: parseInt(userId), title: doc.title, encrypted_login: doc.encrypted_login, encrypted_password: doc.encrypted_password };
  });
}

async function deletePassword(userId, passId) {
  try {
    const doc = await db.get('password:' + userId + ':' + passId);
    await db.remove(doc);
  } catch {}
}

async function deletePasswordsByUser(userId) {
  const prefix = 'password:' + userId + ':';
  const result = await db.allDocs({ startkey: prefix, endkey: prefix + '\uffff', include_docs: true });
  const docs = result.rows.map(r => ({ _id: r.doc._id, _rev: r.doc._rev, _deleted: true }));
  if (docs.length > 0) await db.bulkDocs(docs);
}

// --- Config helpers ---
async function getConfig() {
  const result = await db.allDocs({ startkey: 'config:', endkey: 'config:\uffff', include_docs: true });
  const config = {};
  result.rows.forEach(r => {
    const key = r.doc._id.replace('config:', '');
    config[key] = r.doc.value;
  });
  return config;
}

async function setConfig(key, value) {
  const id = 'config:' + key;
  try {
    const doc = await db.get(id);
    doc.value = value;
    await db.put(doc);
  } catch {
    await db.put({ _id: id, type: 'config', value });
  }
}

// --- Seed ---
async function seedAdmin(username, passwordHash) {
  const existing = await getUserByUsername(username);
  if (existing) {
    existing.is_admin = true;
    existing.password_hash = passwordHash;
    await db.put(existing);
    return;
  }
  await createUser(username, passwordHash, true);
}

// --- Init config defaults ---
async function initConfig() {
  try {
    await db.get('config:encryption_algo');
  } catch {
    await db.put({ _id: 'config:encryption_algo', type: 'config', value: 'aes-256-cbc' });
  }
}

// --- Update user helpers ---
async function updateUserProfile(id, username) {
  const doc = await db.get('user:' + id);
  doc.username = username;
  await db.put(doc);
}

async function updateUserPassword(id, passwordHash) {
  const doc = await db.get('user:' + id);
  doc.password_hash = passwordHash;
  await db.put(doc);
}

async function updateUserAvatar(id, avatar) {
  const doc = await db.get('user:' + id);
  doc.avatar = avatar;
  await db.put(doc);
}

// --- Reset user's own data ---
async function resetUser(userId) {
  await deletePasswordsByUser(userId);
  await deleteUser(userId);
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  getUsers,
  deleteUser,
  userCount,
  createPassword,
  getPasswordsByUser,
  deletePassword,
  deletePasswordsByUser,
  getConfig,
  setConfig,
  seedAdmin,
  initConfig,
  resetUser,
  updateUserProfile,
  updateUserPassword,
  updateUserAvatar,
};
