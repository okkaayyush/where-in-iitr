import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email, code) {
  // MOCK MODE — prints to terminal instead of sending email
  if (process.env.MOCK_EMAIL === 'true') {
    console.log(`\n=============================`);
    console.log(`OTP for ${email}: ${code}`);
    console.log(`=============================\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"WhereInIITR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your WhereInIITR verification code',
    text: `Your verification code is: ${code}\n\nExpires in 10 minutes.`,
  });
}

export function generateToken(userId, email) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}