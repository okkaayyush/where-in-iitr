# WhereInIITR 📍

A daily location guessing game for IIT Roorkee. Five photos from around campus drop every day — your job is to pin where each one was taken on the map. Points are based on how close you get.

Inspired by GeoGuessr, built for IITR.

---

## How it works

- Log in with your `iitr.ac.in` email — OTP is sent to verify you're from campus
- You get 5 photos per day, each taken somewhere on or around IITR
- Click the map to drop your pin, submit your guess
- See how far off you were, and how many points you scored
- Daily and weekly leaderboards track who knows the campus best

**Scoring**

| Distance | Points |
|----------|--------|
| Within 50m | 1000 |
| Within 100m | 800 |
| Within 200m | 600 |
| Within 400m | 400 |
| Within 800m | 200 |
| Further | 100 |

Max score per day: **5000 points**

---

## Stack

**Backend** — Node.js, Express, better-sqlite3, JWT, Nodemailer, Cloudinary, exifr  
**Frontend** — React, Vite, Tailwind CSS, Leaflet

---

## Running locally

**Backend**
```bash
cd backend
npm install
# create .env (see .env.example)
node server.js
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment variables

**backend/.env**
```
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
MOCK_EMAIL=true
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_PASSWORD=
PORT=3001
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3001
```

---

## Adding a daily challenge

Navigate to `/#admin` (password protected). Upload 5 iPhone photos taken on campus — GPS coordinates are extracted automatically from the image EXIF data. No manual coordinate entry needed.

Photos must have been taken with Location Services enabled.

---

## Deployment

Backend is on [Render](https://whereiniitr-backend.onrender.com).  
Frontend is on Vercel.(https://where-in-iitr.vercel.app/)

> Free tier on Render spins down after inactivity — first request of the day may take ~30 seconds.
