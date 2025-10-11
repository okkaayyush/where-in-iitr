import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = 'your-secret-key-change-in-production';

// For development - in production use real SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com', 
    pass: 'your-app-password' 
  }
});

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (email, code) => {
  // For development/demo, just log the code
  console.log(`Verification code for ${email}: ${code}`);
  
  // Uncomment in production with real SMTP:
  /*
  try {
    await transporter.sendMail({
      from: '"WhereInIITR" <noreply@whereiniitr.com>',
      to: email,
      subject: 'Your WhereInIITR Verification Code',
      html: `
        <h2>Welcome to WhereInIITR!</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
  */
  
  return true; // For demo purposes
};

export const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = decoded;
  next();
};