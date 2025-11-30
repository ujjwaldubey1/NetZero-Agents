import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  certificateId: { type: String, required: true },
  certificateRef: String,
  dataCenterName: String,
  period: String,
  jobId: String,
  orgDid: String,
  scopeTotals: { type: mongoose.Schema.Types.Mixed },
  reportHash: String,
  merkleRoot: String,
  evidenceHashes: [String],
  zkProofId: String,
  cardanoTxHash: String,
  hydraTxId: String,
  masumiTxHash: String,
  masumiCertificateId: String,
  masumiNetwork: String,
  masumiTransactionCount: Number,
  masumiBlockNumber: Number,
  masumiBlockHash: String,
  masumiBlockTimestamp: Date,
  ipfsBundle: String,
  mausamiFeeAda: Number,
  mausamiNote: String,
  metadata: { type: mongoose.Schema.Types.Mixed },
  freezeProof: { type: mongoose.Schema.Types.Mixed },
  issuedAt: { type: Date, default: Date.now },
  issuedBy: String,
}, {
  timestamps: true,
  strict: true,
});

export default mongoose.model('Certificate', CertificateSchema);
