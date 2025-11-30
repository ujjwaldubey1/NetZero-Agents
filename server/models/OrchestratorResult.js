import mongoose from 'mongoose';

/**
 * OrchestratorResult Schema
 * Stores complete orchestrator analysis results for compliance log viewing
 */
const OrchestratorResultSchema = new mongoose.Schema(
  {
    datacenter: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    // Full orchestrator result data
    vendors_summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    carbon_credit_summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    staff_summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    anomalies: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    cryptographic_proofs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipfs_links: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    masumi_transactions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    final_report: {
      type: String, // Narrative text
      default: null,
    },
    ui_payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Compound index for efficient queries
OrchestratorResultSchema.index({ datacenter: 1, period: 1 }, { unique: true });
OrchestratorResultSchema.index({ generatedAt: -1 });

export default mongoose.model('OrchestratorResult', OrchestratorResultSchema);

