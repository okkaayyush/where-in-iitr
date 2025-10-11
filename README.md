// ============ README.md ============
/*
# WhereInIITR 🎯

A daily location guessing game for IIT Roorkee students!

## Features
- 5 daily images from IIT Roorkee campus
- Interactive map for guessing locations
- Points based on accuracy
- Daily and weekly leaderboards
- @iitr.ac.in email authentication

## Tech Stack
- **Frontend**: React, Leaflet (maps), vanilla CSS
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + Email verification

## Quick Start

### Backend Setup
```bash
cd backend
npm install
node server.js
```
Server runs on http://localhost:3001

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
App runs on http://localhost:3000

## Project Structure
```
WhereInIITR/
├── backend/
│   ├── server.js          # Main server
│   ├── database.js        # SQLite database
│   ├── auth.js            # Authentication
│   ├── package.json
│   └── whereiniitr.db     # Auto-created
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── images/        # Add challenge images here
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Map.jsx
│   │   │   ├── ImageChallenge.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## Adding Daily Challenges

Use the admin endpoint to create challenges:

```bash
curl -X POST http://localhost:3001/api/admin/create-challenge \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-12",
    "images": [
      "/images/daily-challenges/img1.jpg",
      "/images/daily-challenges/img2.jpg",
      "/images/daily-challenges/img3.jpg",
      "/images/daily-challenges/img4.jpg",
      "/images/daily-challenges/img5.jpg"
    ],
    "locations": [
      {"lat": 29.8667, "lng": 77.8950},
      {"lat": 29.8670, "lng": 77.8960},
      {"lat": 29.8665, "lng": 77.8940},
      {"lat": 29.8680, "lng": 77.8955},
      {"lat": 29.8660, "lng": 77.8945}
    ]
  }'
```

## How to Get Images
1. Take photos around IIT Roorkee campus
2. Save them in `frontend/public/images/daily-challenges/`
3. Use relative URLs like `/images/daily-challenges/main-gate.jpg`

## Key Locations in IIT Roorkee (for reference)
- Main Building: 29.8667, 77.8950
- LBS Stadium: 29.8671, 77.8943
- Central Library: 29.8655, 77.8935
- MAC Auditorium: 29.8695, 77.8965
- Convocation Hall: 29.8710, 77.8920

## Scoring System
- ≤ 50m: 1000 points
- ≤ 100m: 800 points
- ≤ 200m: 600 points
- ≤ 400m: 400 points
- ≤ 800m: 200 points
- > 800m: 100 points

## Development Notes

### Email Verification
In development mode, verification codes are:
1. Logged to console
2. Shown in alert (for demo)

For production:
1. Configure Gmail SMTP in `auth.js`
2. Use app-specific password
3. Remove alert() calls

### Security Notes for Production
1. Change JWT_SECRET in `auth.js`
2. Add rate limiting
3. Enable HTTPS
4. Add CORS whitelist
5. Use environment variables
6. Enable real email service

## Deployment Checklist
- [ ] Add real SMTP credentials
- [ ] Change JWT secret
- [ ] Update API_URL in frontend
- [ ] Add .env files
- [ ] Set up proper hosting
- [ ] Add backup system for database
- [ ] Test on mobile devices

## Common Issues

### CORS Error
Make sure backend is running on port 3001

### Map not loading
Check internet connection (Leaflet loads from CDN)

### Email not sending
In development, codes appear in console/alert

## Contributing
This is a student project for IIT Roorkee. Feel free to fork and customize!

## License
MIT
*/