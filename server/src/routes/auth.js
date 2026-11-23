import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    if (!['DONOR', 'REQUESTER', 'NGO'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email is already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role });
    return res.status(201).json({ message: 'Account created', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ message: 'Could not register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    return res.status(500).json({ message: 'Could not sign in' });
  }
});

export default router;
