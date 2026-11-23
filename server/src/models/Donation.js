import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000 },
  quantity: { type: String, required: true, trim: true },
  foodType: { type: String, default: 'Prepared food' },
  pickupAddress: { type: String, required: true, trim: true },
  pickupTime: { type: Date, required: true },
  status: { type: String, enum: ['AVAILABLE', 'CLAIMED', 'COMPLETED'], default: 'AVAILABLE' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

export default mongoose.model('Donation', donationSchema);
