import mongoose from 'mongoose';

const VendorInviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  vendorName: { type: String, required: true },
  token: { type: String, required: true },
  dataCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'DataCenter' },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: Date,
});

export default mongoose.model('VendorInvite', VendorInviteSchema);
