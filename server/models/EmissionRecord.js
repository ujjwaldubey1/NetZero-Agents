import mongoose from 'mongoose';

const EmissionRecordSchema = new mongoose.Schema({
  ownerType: { type: String, enum: ['operator', 'vendor'], required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scope: { type: Number, enum: [1, 2, 3], required: true },
  dataCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataCenter' },
  dataCenterName: String,
  folderRef: String,
  sectionRef: String,
  rawFilePath: String,
  extractedData: { type: mongoose.Schema.Types.Mixed },
  aiSummary: String,
  aiAnomalies: [String],
  period: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('EmissionRecord', EmissionRecordSchema);
