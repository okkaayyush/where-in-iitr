import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import exifr from 'exifr';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import cors from 'cors';
import db, {
  saveVerificationCode, verifyCode, getUser, createUser,
  getTodayChallenge, saveGuess, getUserGuesses,
  saveDailyScore, getDailyLeaderboard, getWeeklyLeaderboard
} from './database.js';
import * as auth from './auth.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calculatePoints(distance) {
  if (distance <= 50) return 1000;
  if (distance <= 100) return 800;
  if (distance <= 200) return 600;
  if (distance <= 400) return 400;
  if (distance <= 800) return 200;
  return 100;
}

// AUTH
app.post('/api/auth/request-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.endsWith('iitr.ac.in')) {
      return res.status(400).json({ error: 'Must use an iitr.ac.in email' });
    }
    const code = auth.generateVerificationCode();
    saveVerificationCode(email, code);
    await auth.sendVerificationEmail(email, code);
    res.json({ message: 'Verification code sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-code', (req, res) => {
  try {
    const { email, code, name } = req.body;
    if (!verifyCode(email, code)) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    let user = getUser(email);
    if (!user) {
      createUser(email, name || email.split('@')[0]);
      user = getUser(email);
    }
    const token = auth.generateToken(user.id, user.email);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GAME
app.get('/api/challenge/today', auth.authMiddleware, (req, res) => {
  try {
    const challenge = getTodayChallenge();
    if (!challenge) return res.status(404).json({ error: 'No challenge for today' });
    const userGuesses = getUserGuesses(req.user.userId, challenge.id);
    res.json({
      id: challenge.id,
      date: challenge.date,
      images: [challenge.image1_url, challenge.image2_url, challenge.image3_url, challenge.image4_url, challenge.image5_url],
      guesses: userGuesses,
      completed: userGuesses.length === 5
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/challenge/guess', auth.authMiddleware, (req, res) => {
  try {
    const { challengeId, imageNumber, lat, lng } = req.body;
    const challenge = getTodayChallenge();
    if (!challenge || challenge.id !== challengeId) {
      return res.status(400).json({ error: 'Invalid challenge' });
    }
    const actualLat = challenge[`location${imageNumber}_lat`];
    const actualLng = challenge[`location${imageNumber}_lng`];
    const distance = calculateDistance(lat, lng, actualLat, actualLng);
    const points = calculatePoints(distance);
    saveGuess(req.user.userId, challengeId, imageNumber, lat, lng, distance, points);
    const allGuesses = getUserGuesses(req.user.userId, challengeId);
    if (allGuesses.length === 5) {
      const totalPoints = allGuesses.reduce((sum, g) => sum + g.points, 0);
      saveDailyScore(req.user.userId, challengeId, totalPoints);
    }
    res.json({ distance: Math.round(distance), points, actualLocation: { lat: actualLat, lng: actualLng } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LEADERBOARD
app.get('/api/leaderboard/daily', auth.authMiddleware, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    res.json(getDailyLeaderboard(today));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard/weekly', auth.authMiddleware, (req, res) => {
  try {
    res.json(getWeeklyLeaderboard());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: password middleware
function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ADMIN: upload images + auto extract GPS
app.post('/api/admin/upload-challenge', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length !== 5) {
      return res.status(400).json({ error: 'Upload exactly 5 images' });
    }

    const results = await Promise.all(files.map(async (file) => {
      const gps = await exifr.gps(file.buffer);
      if (!gps) throw new Error(`No GPS data in ${file.originalname}. Make sure Location Services was on.`);

      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'whereiniitr', format: 'jpg' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        Readable.from(file.buffer).pipe(stream);
      });

      return { url, lat: gps.latitude, lng: gps.longitude };
    }));

    const today = new Date().toISOString().split('T')[0];
    db.prepare(`DELETE FROM daily_challenges WHERE date = ?`).run(today);
    db.prepare(`
      INSERT INTO daily_challenges (
        date,
        image1_url, image2_url, image3_url, image4_url, image5_url,
        location1_lat, location1_lng,
        location2_lat, location2_lng,
        location3_lat, location3_lng,
        location4_lat, location4_lng,
        location5_lat, location5_lng
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      today,
      results[0].url, results[1].url, results[2].url, results[3].url, results[4].url,
      results[0].lat, results[0].lng,
      results[1].lat, results[1].lng,
      results[2].lat, results[2].lng,
      results[3].lat, results[3].lng,
      results[4].lat, results[4].lng
    );

    res.json({
      message: 'Challenge created for today',
      locations: results.map(r => ({ lat: r.lat, lng: r.lng }))
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
