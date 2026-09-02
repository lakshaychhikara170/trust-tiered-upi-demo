import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize DB schema
export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password_hash TEXT,
          balance REAL DEFAULT 50000,
          freeze_threshold REAL DEFAULT 3000,
          is_admin BOOLEAN DEFAULT 0
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

export const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const createUser = (username, passwordHash) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username });
      }
    );
  });
};

export const updateUserConfig = (id, balance, freezeThreshold) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET balance = ?, freeze_threshold = ? WHERE id = ?',
      [balance, freezeThreshold, id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const setUpiPin = (id, pinHash) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET upi_pin = ? WHERE id = ?',
      [pinHash, id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export default db;
