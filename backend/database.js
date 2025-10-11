import Database from 'better-sqlite3';

const db = new Database('whereiniitr.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    total_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    image1_url TEXT NOT NULL,
    image2_url TEXT NOT NULL,
    image3_url TEXT NOT NULL,
    image4_url TEXT NOT NULL,
    image5_url TEXT NOT NULL,
    location1_lat REAL NOT NULL,
    location1_lng REAL NOT NULL,
    location2_lat REAL NOT NULL,
    location2_lng REAL NOT NULL,
    location3_lat REAL NOT NULL,
    location3_lng REAL NOT NULL,
    location4_lat REAL NOT NULL,
    location4_lng REAL NOT NULL,
    location5_lat REAL NOT NULL,
    location5_lng REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    image_number INTEGER NOT NULL,
    guess_lat REAL NOT NULL,
    guess_lng REAL NOT NULL,
    distance REAL NOT NULL,
    points INTEGER NOT NULL,
    guessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id),
    UNIQUE(user_id, challenge_id, image_number)
  );

  CREATE TABLE IF NOT EXISTS daily_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id),
    UNIQUE(user_id, challenge_id)
  );

  CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export const getUser = (email) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const createUser = (email, name) => {
  return db.prepare('INSERT INTO users (email, name) VALUES (?, ?)').run(email, name);
};

export const getTodayChallenge = () => {
  const today = new Date().toISOString().split('T')[0];
  return db.prepare('SELECT * FROM daily_challenges WHERE date = ?').get(today);
};

export const saveGuess = (userId, challengeId, imageNumber, guessLat, guessLng, distance, points) => {
  return db.prepare(`
    INSERT OR REPLACE INTO guesses (user_id, challenge_id, image_number, guess_lat, guess_lng, distance, points)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, challengeId, imageNumber, guessLat, guessLng, distance, points);
};

export const getUserGuesses = (userId, challengeId) => {
  return db.prepare('SELECT * FROM guesses WHERE user_id = ? AND challenge_id = ?').all(userId, challengeId);
};

export const saveDailyScore = (userId, challengeId, totalPoints) => {
  return db.prepare(`
    INSERT OR REPLACE INTO daily_scores (user_id, challenge_id, total_points)
    VALUES (?, ?, ?)
  `).run(userId, challengeId, totalPoints);
};

export const getDailyLeaderboard = (date) => {
  return db.prepare(`
    SELECT u.name, u.email, ds.total_points
    FROM daily_scores ds
    JOIN users u ON ds.user_id = u.id
    JOIN daily_challenges dc ON ds.challenge_id = dc.id
    WHERE dc.date = ?
    ORDER BY ds.total_points DESC
    LIMIT 50
  `).all(date);
};

export const getWeeklyLeaderboard = () => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  
  return db.prepare(`
    SELECT u.name, u.email, SUM(ds.total_points) as total_points
    FROM daily_scores ds
    JOIN users u ON ds.user_id = u.id
    JOIN daily_challenges dc ON ds.challenge_id = dc.id
    WHERE dc.date >= ?
    GROUP BY u.id
    ORDER BY total_points DESC
    LIMIT 50
  `).all(weekAgoStr);
};

export const saveVerificationCode = (email, code) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  return db.prepare('INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)').run(email, code, expiresAt);
};

export const verifyCode = (email, code) => {
  const result = db.prepare(`
    SELECT * FROM verification_codes 
    WHERE email = ? AND code = ? AND expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 1
  `).get(email, code);
  
  if (result) {
    db.prepare('DELETE FROM verification_codes WHERE email = ?').run(email);
  }
  
  return result;
};
db.saveVerificationCode = saveVerificationCode;
db.verifyCode = verifyCode;
export default db;

