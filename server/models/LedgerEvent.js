import mongoose from 'mongoose';

const LedgerEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'EMISSIONS_UPLOADED',
      'REPORT_FROZEN',
      'CERTIFICATE_ISSUED',
      'ZK_PROOF_VERIFIED',
      'ORCHESTRATOR_COMPLETED',
      'ORCHESTRATOR_TX',
    ],
    required: true,
  },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  datacenter: { type: String },
  period: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agentId: { type: String },
  txId: { type: String },
  detail: String,
  payload: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('LedgerEvent', LedgerEventSchema);
