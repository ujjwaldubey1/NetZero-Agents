import mongoose from 'mongoose';

const ZkProofSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  valueCommitment: String,
  threshold: Number,
  publicSignals: [String],
  proof: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ZkProof', ZkProofSchema);
