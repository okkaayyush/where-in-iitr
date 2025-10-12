import express from 'express';
import cors from 'cors';
import db, {
  saveVerificationCode,
  verifyCode,
  getUser,
  createUser,
  getTodayChallenge,
  saveGuess,
  getUserGuesses,
  saveDailyScore,
  getDailyLeaderboard,
  getWeeklyLeaderboard
} from './database.js';

import * as auth from './auth.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Calculate points based on distance
function calculatePoints(distance) {
  if (distance <= 50) return 1000;
  if (distance <= 100) return 800;
  if (distance <= 200) return 600;
  if (distance <= 400) return 400;
  if (distance <= 800) return 200;
  return 100;
}

// AUTH ROUTES
app.post('/api/auth/request-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.endsWith('iitr.ac.in')) {
      return res.status(400).json({ error: 'Must use iitr.ac.in email' });
    }
    
    const code = auth.generateVerificationCode();
    console.log(`Generated code for ${email}: ${code}`);

    saveVerificationCode(email, code);
    
    await auth.sendVerificationEmail(email, code);
    
    res.json({ message: 'Verification code sent', code }); // Remove code in production
  } catch (error) {
    console.error('Error in request-code:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-code', (req, res) => {
  try {
    const { email, code, name } = req.body;
    
    const verified = verifyCode(email, code);
    
    if (!verified) {
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
    console.error('Error in verify-code:', error);
    res.status(500).json({ error: error.message });
  }
});

// GAME ROUTES
app.get('/api/challenge/today', auth.authMiddleware, (req, res) => {
  try {
    const challenge = getTodayChallenge();
    
    if (!challenge) {
      return res.status(404).json({ error: 'No challenge available today' });
    }
    
    const userGuesses = getUserGuesses(req.user.userId, challenge.id);
    
    // Return challenge without actual locations
    res.json({
      id: challenge.id,
      date: challenge.date,
      images: [
        challenge.image1_url,
        challenge.image2_url,
        challenge.image3_url,
        challenge.image4_url,
        challenge.image5_url
      ],
      guesses: userGuesses,
      completed: userGuesses.length === 5
    });
  } catch (error) {
    console.error('Error in challenge/today:', error);
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
    
    // Get actual location
    const actualLat = challenge[`location${imageNumber}_lat`];
    const actualLng = challenge[`location${imageNumber}_lng`];
    
    const distance = calculateDistance(lat, lng, actualLat, actualLng);
    const points = calculatePoints(distance);
    
    saveGuess(req.user.userId, challengeId, imageNumber, lat, lng, distance, points);
    
    // Check if all 5 guesses are done
    const allGuesses = getUserGuesses(req.user.userId, challengeId);
    
    if (allGuesses.length === 5) {
      const totalPoints = allGuesses.reduce((sum, g) => sum + g.points, 0);
      saveDailyScore(req.user.userId, challengeId, totalPoints);
    }
    
    res.json({
      distance: Math.round(distance),
      points,
      actualLocation: { lat: actualLat, lng: actualLng }
    });
  } catch (error) {
    console.error('Error in challenge/guess:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard/daily', auth.authMiddleware, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const leaderboard = getDailyLeaderboard(today);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard/daily:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard/weekly', auth.authMiddleware, (req, res) => {
  try {
    const leaderboard = getWeeklyLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard/weekly:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Create daily challenge (for demo purposes)
app.post('/api/admin/create-challenge', (req, res) => {
  const { date, images, locations } = req.body;
  
  try {
    const stmt = db.prepare(`
      INSERT INTO daily_challenges (
        date, 
        image1_url, image2_url, image3_url, image4_url, image5_url,
        location1_lat, location1_lng,
        location2_lat, location2_lng,
        location3_lat, location3_lng,
        location4_lat, location4_lng,
        location5_lat, location5_lng
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      date,
      images[0], images[1], images[2], images[3], images[4],
      locations[0].lat, locations[0].lng,
      locations[1].lat, locations[1].lng,
      locations[2].lat, locations[2].lng,
      locations[3].lat, locations[3].lng,
      locations[4].lat, locations[4].lng
    );
    
    res.json({ message: 'Challenge created' });
  } catch (error) {
    console.error('Error in admin/create-challenge:', error);
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});