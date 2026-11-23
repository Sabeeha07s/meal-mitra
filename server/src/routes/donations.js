import { Router } from 'express';
import Donation from '../models/Donation.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const donations = await Donation.find({ status: 'AVAILABLE', pickupTime: { $gte: new Date() } })
    .populate('donor', 'name role').sort({ pickupTime: 1 }).limit(100);
  res.json(donations);
});

router.get('/mine', requireAuth, async (req, res) => {
  const filter = req.user.role === 'REQUESTER'
    ? { claimedBy: req.user.id }
    : { donor: req.user.id };
  res.json(await Donation.find(filter).sort({ createdAt: -1 }));
});

router.post('/', requireAuth, allowRoles('DONOR', 'NGO'), async (req, res) => {
  const { title, description, quantity, foodType, pickupAddress, pickupTime } = req.body;
  if (!title || !quantity || !pickupAddress || !pickupTime) {
    return res.status(400).json({ message: 'Title, quantity, pickup address and pickup time are required' });
  }
  const donation = await Donation.create({
    title, description, quantity, foodType, pickupAddress, pickupTime, donor: req.user.id
  });
  res.status(201).json(donation);
});

router.patch('/:id/claim', requireAuth, allowRoles('REQUESTER', 'NGO'), async (req, res) => {
  const donation = await Donation.findOneAndUpdate(
    { _id: req.params.id, status: 'AVAILABLE' },
    { $set: { status: 'CLAIMED', claimedBy: req.user.id } },
    { new: true, runValidators: true }
  );
  if (!donation) return res.status(404).json({ message: 'Donation is unavailable or already claimed' });
  res.json(donation);
});

router.patch('/:id/complete', requireAuth, async (req, res) => {
  const donation = await Donation.findOne({ _id: req.params.id, donor: req.user.id });
  if (!donation) return res.status(404).json({ message: 'Donation not found' });
  if (donation.status !== 'CLAIMED') return res.status(400).json({ message: 'Only claimed donations can be completed' });
  donation.status = 'COMPLETED';
  await donation.save();
  res.json(donation);
});

export default router;
