import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByUsername, createUser, getUserById, updateUserConfig, setUpiPin } from '../database.js';

const router = express.Router();
const JWT_SECRET = 'hackathon-super-secret-key-123'; // In prod, use environment variables

// Middleware to verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const user = await createUser(username, hash);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username,
        balance: 50000,
        freezeThreshold: 3000,
        isAdmin: false,
        hasUpiPin: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        freezeThreshold: user.freeze_threshold,
        isAdmin: Boolean(user.is_admin),
        hasUpiPin: !!user.upi_pin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        freezeThreshold: user.freeze_threshold,
        isAdmin: Boolean(user.is_admin),
        hasUpiPin: !!user.upi_pin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/update', verifyToken, async (req, res) => {
  try {
    const { balance, freezeThreshold } = req.body;
    await updateUserConfig(req.userId, balance, freezeThreshold);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/set-pin', verifyToken, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4) return res.status(400).json({ error: 'Invalid PIN' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin, salt);

    await setUpiPin(req.userId, hash);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/verify-pin', verifyToken, async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await getUserById(req.userId);
    
    if (!user || !user.upi_pin) {
      return res.status(400).json({ error: 'PIN not set' });
    }

    const isMatch = await bcrypt.compare(pin, user.upi_pin);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect PIN' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
