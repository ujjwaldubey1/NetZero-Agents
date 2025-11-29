import mongoose from 'mongoose';

const VendorScopeSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dataCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataCenter' },
  scope3Data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  period: { type: String, required: true },
  status: { type: String, enum: ['pending', 'submitted', 'verified'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('VendorScope', VendorScopeSchema);

