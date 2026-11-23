import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import chatRoutes from './routes/chat.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/chat', chatRoutes);

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`Meal Mitra API running on ${port}`)))
  .catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
