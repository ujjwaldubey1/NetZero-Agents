import mongoose from 'mongoose';

const DataCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('DataCenter', DataCenterSchema);
