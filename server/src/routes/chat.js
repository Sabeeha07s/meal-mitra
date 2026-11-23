import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

router.post('/', async (req, res) => {
  const message = String(req.body.message || '').trim();
  if (!message) return res.status(400).json({ message: 'Message is required' });
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: 'The Meal Mitra assistant is not configured yet. Please contact the platform team for help.' });
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`You are a helpful assistant for a food donation platform. Give concise, safe guidance. User: ${message}`);
    res.json({ reply: result.response.text() });
  } catch {
    res.status(502).json({ message: 'Assistant is temporarily unavailable' });
  }
});

export default router;
