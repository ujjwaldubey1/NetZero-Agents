import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  certificateId: { type: String, required: true },
  certificateRef: String,
  dataCenterName: String,
  orgDid: String,
  scopeTotals: { type: mongoose.Schema.Types.Mixed },
  reportHash: String,
  zkProofId: String,
  cardanoTxHash: String,
  hydraTxId: String,
  mausamiFeeAda: Number,
  mausamiNote: String,
  issuedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Certificate', CertificateSchema);
