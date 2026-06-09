import Database from 'better-sqlite3';

const db = new Database('whereiniitr.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    image1_url TEXT, image2_url TEXT, image3_url TEXT, image4_url TEXT, image5_url TEXT,
    location1_lat REAL, location1_lng REAL,
    location2_lat REAL, location2_lng REAL,
    location3_lat REAL, location3_lng REAL,
    location4_lat REAL, location4_lng REAL,
    location5_lat REAL, location5_lng REAL
  );

  CREATE TABLE IF NOT EXISTS guesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    image_number INTEGER NOT NULL,
    guessed_lat REAL, guessed_lng REAL,
    distance REAL,
    points INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id, image_number)
  );

  CREATE TABLE IF NOT EXISTS daily_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
  );
`);

export function saveVerificationCode(email, code) {
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  db.prepare(`INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)`)
    .run(email, code, expires);
}

export function verifyCode(email, code) {
  const row = db.prepare(`
    SELECT * FROM verification_codes
    WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
    ORDER BY id DESC LIMIT 1
  `).get(email, code);
  if (!row) return false;
  db.prepare(`UPDATE verification_codes SET used = 1 WHERE id = ?`).run(row.id);
  return true;
}

export function getUser(email) {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

export function createUser(email, name) {
  db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`).run(email, name);
}

export function getTodayChallenge() {
  const today = new Date().toISOString().split('T')[0];
  return db.prepare(`SELECT * FROM daily_challenges WHERE date = ?`).get(today);
}

export function saveGuess(userId, challengeId, imageNumber, lat, lng, distance, points) {
  db.prepare(`
    INSERT OR REPLACE INTO guesses (user_id, challenge_id, image_number, guessed_lat, guessed_lng, distance, points)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, challengeId, imageNumber, lat, lng, distance, points);
}

export function getUserGuesses(userId, challengeId) {
  return db.prepare(`SELECT * FROM guesses WHERE user_id = ? AND challenge_id = ?`).all(userId, challengeId);
}

export function saveDailyScore(userId, challengeId, totalPoints) {
  db.prepare(`
    INSERT OR REPLACE INTO daily_scores (user_id, challenge_id, total_points)
    VALUES (?, ?, ?)
  `).run(userId, challengeId, totalPoints);
}

export function getDailyLeaderboard(date) {
  return db.prepare(`
    SELECT u.name, u.email, ds.total_points
    FROM daily_scores ds
    JOIN users u ON u.id = ds.user_id
    JOIN daily_challenges dc ON dc.id = ds.challenge_id
    WHERE dc.date = ?
    ORDER BY ds.total_points DESC
    LIMIT 20
  `).all(date);
}

export function getWeeklyLeaderboard() {
  return db.prepare(`
    SELECT u.name, u.email, SUM(ds.total_points) as total_points
    FROM daily_scores ds
    JOIN users u ON u.id = ds.user_id
    JOIN daily_challenges dc ON dc.id = ds.challenge_id
    WHERE dc.date >= date('now', '-7 days')
    GROUP BY ds.user_id
    ORDER BY total_points DESC
    LIMIT 20
  `).all();
}

export default db;