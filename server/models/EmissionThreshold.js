import mongoose from 'mongoose';

const EmissionThresholdSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('EmissionThreshold', EmissionThresholdSchema);
