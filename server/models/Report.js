import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  period: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scopeTotals: {
    scope1: { type: mongoose.Schema.Types.Mixed, default: {} },
    scope2: { type: mongoose.Schema.Types.Mixed, default: {} },
    scope3: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  aiNarrative: String,
  status: { type: String, enum: ['draft', 'frozen', 'certified'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Report', ReportSchema);
