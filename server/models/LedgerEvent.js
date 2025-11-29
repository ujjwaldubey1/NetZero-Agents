import mongoose from 'mongoose';

const LedgerEventSchema = new mongoose.Schema({
  type: { type: String, enum: ['UPLOAD', 'VALIDATION', 'REPORT_FROZEN', 'CERT_ISSUED', 'ZK_PROOF_VERIFIED'], required: true },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  detail: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('LedgerEvent', LedgerEventSchema);
