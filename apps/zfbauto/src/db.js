/**
 * Lightweight in-memory + JSON-file persistence layer for zfbauto.
 * Stores scheduled posts, post queue, and settings.
 */
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/** @returns {Object} The current in-memory database */
const loadDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load db.json, resetting:', e.message);
  }
  return {
    queue: [],
    schedules: [],
    postHistory: [],
    settings: {
      defaultCron: '0 * * * *',
      schedulerEnabled: true,
      autoPostTemplate: 'Automated post at {TIME} 🤖✨',
      maxQueueSize: 100,
    },
  };
};

const saveDb = (db) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save db.json:', e.message);
  }
};

// In-memory state (loaded once on startup)
let _db = loadDb();

module.exports = {
  randomUUID,

  /** Queue operations */
  queue: {
    getAll: () => _db.queue,
    add: (item) => {
      const entry = { id: randomUUID(), createdAt: new Date().toISOString(), status: 'pending', ...item };
      _db.queue.unshift(entry);
      if (_db.queue.length > (_db.settings.maxQueueSize || 100)) {
        _db.queue = _db.queue.slice(0, _db.settings.maxQueueSize || 100);
      }
      saveDb(_db);
      return entry;
    },
    remove: (id) => {
      const idx = _db.queue.findIndex(q => q.id === id);
      if (idx === -1) return null;
      const removed = _db.queue.splice(idx, 1)[0];
      saveDb(_db);
      return removed;
    },
    updateStatus: (id, status, meta = {}) => {
      const item = _db.queue.find(q => q.id === id);
      if (!item) return null;
      item.status = status;
      item.updatedAt = new Date().toISOString();
      Object.assign(item, meta);
      saveDb(_db);
      return item;
    },
    getPending: () => _db.queue.filter(q => q.status === 'pending'),
    clear: () => {
      _db.queue = [];
      saveDb(_db);
    },
  },

  /** Post history */
  history: {
    getAll: (limit = 50) => _db.postHistory.slice(0, limit),
    add: (entry) => {
      _db.postHistory.unshift({ id: randomUUID(), createdAt: new Date().toISOString(), ...entry });
      if (_db.postHistory.length > 500) _db.postHistory = _db.postHistory.slice(0, 500);
      saveDb(_db);
    },
  },

  /** Schedule rules */
  schedules: {
    getAll: () => _db.schedules,
    add: (item) => {
      const entry = { id: randomUUID(), createdAt: new Date().toISOString(), enabled: true, ...item };
      _db.schedules.push(entry);
      saveDb(_db);
      return entry;
    },
    update: (id, updates) => {
      const item = _db.schedules.find(s => s.id === id);
      if (!item) return null;
      Object.assign(item, updates, { updatedAt: new Date().toISOString() });
      saveDb(_db);
      return item;
    },
    remove: (id) => {
      const idx = _db.schedules.findIndex(s => s.id === id);
      if (idx === -1) return null;
      const removed = _db.schedules.splice(idx, 1)[0];
      saveDb(_db);
      return removed;
    },
  },

  /** Settings */
  settings: {
    get: () => _db.settings,
    update: (updates) => {
      Object.assign(_db.settings, updates);
      saveDb(_db);
      return _db.settings;
    },
  },

  /** Reload from disk (if external edits) */
  reload: () => {
    _db = loadDb();
    return _db;
  },
};
