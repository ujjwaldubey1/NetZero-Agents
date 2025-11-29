import mongoose from 'mongoose';

/**
 * AuditLog Schema for NetZero Agents
 * Tracks all system events including vendor submissions, AI operations, ZK proofs, IPFS uploads, and blockchain transactions
 */
const AuditLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: [true, 'Event label is required'],
      trim: true,
      index: true,
    },
    details: {
      type: Object,
      default: {},
    },
    user: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    entityId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    ipfsCid: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    blockchainTx: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    severity: {
      type: String,
      enum: {
        values: ['info', 'warning', 'error'],
        message: 'Severity must be one of: info, warning, error',
      },
      default: 'info',
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema will be saved
    collection: 'audit_logs', // Explicit collection name
  }
);

// Compound indexes for common query patterns
AuditLogSchema.index({ entityId: 1, timestamp: -1 }); // Timeline queries for specific entity
AuditLogSchema.index({ user: 1, timestamp: -1 }); // User activity history
AuditLogSchema.index({ event: 1, timestamp: -1 }); // Event type queries
AuditLogSchema.index({ severity: 1, timestamp: -1 }); // Error tracking
AuditLogSchema.index({ blockchainTx: 1 }); // Blockchain transaction lookups
AuditLogSchema.index({ ipfsCid: 1 }); // IPFS CID lookups

// Ensure virtuals are included in JSON output
AuditLogSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

// Static method to log vendor submission events
AuditLogSchema.statics.logVendorSubmission = function ({ vendorEmail, facilityId, period, ipfsCid, details = {} }) {
  return this.create({
    event: 'vendor_submission',
    user: vendorEmail || 'vendor',
    entityId: facilityId,
    details: {
      period,
      ...details,
    },
    ipfsCid,
    severity: 'info',
  });
};

// Static method to log AI extraction steps
AuditLogSchema.statics.logAIExtraction = function ({ entityId, step, details = {}, user = 'AI' }) {
  return this.create({
    event: `ai_extraction_${step}`,
    user,
    entityId,
    details,
    severity: 'info',
  });
};

// Static method to log ZK proof generation
AuditLogSchema.statics.logZKProofGeneration = function ({ entityId, proofHash, details = {}, user = 'system' }) {
  return this.create({
    event: 'zk_proof_generated',
    user,
    entityId,
    details: {
      proofHash,
      ...details,
    },
    severity: 'info',
  });
};

// Static method to log ZK proof verification
AuditLogSchema.statics.logZKProofVerification = function ({ entityId, verified, proofHash, details = {}, user = 'system' }) {
  return this.create({
    event: 'zk_proof_verified',
    user,
    entityId,
    details: {
      verified,
      proofHash,
      ...details,
    },
    severity: verified ? 'info' : 'warning',
  });
};

// Static method to log IPFS uploads
AuditLogSchema.statics.logIPFSUpload = function ({ entityId, ipfsCid, filename, details = {}, user = 'system' }) {
  return this.create({
    event: 'ipfs_upload',
    user,
    entityId,
    ipfsCid,
    details: {
      filename,
      ...details,
    },
    severity: 'info',
  });
};

// Static method to log Cardano minting (CIP-68)
AuditLogSchema.statics.logCardanoMinting = function ({ entityId, blockchainTx, tokenId, metadata, details = {}, user = 'system' }) {
  return this.create({
    event: 'cardano_minted',
    user,
    entityId,
    blockchainTx,
    details: {
      tokenId,
      metadata,
      standard: 'CIP-68',
      ...details,
    },
    severity: 'info',
  });
};

// Static method to log info events (generic logging)
AuditLogSchema.statics.logInfo = function ({ event, user, entityId, details = {} }) {
  return this.create({
    event: event || 'info',
    user: user || 'system',
    entityId,
    details,
    severity: 'info',
  });
};

// Static method to log errors
AuditLogSchema.statics.logError = function ({ event, user, entityId, error, details = {} }) {
  return this.create({
    event: event || 'error',
    user: user || 'system',
    entityId,
    details: {
      error: error?.message || error,
      stack: error?.stack,
      ...details,
    },
    severity: 'error',
  });
};

// Static method to get audit timeline for an entity
AuditLogSchema.statics.getTimeline = function (entityId, options = {}) {
  const { limit = 100, startDate, endDate, event } = options;
  const query = { entityId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  if (event) {
    query.event = event;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get all errors
AuditLogSchema.statics.getErrors = function (options = {}) {
  const { limit = 50, startDate, endDate } = options;
  const query = { severity: 'error' };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get audit logs by user
AuditLogSchema.statics.getByUser = function (user, options = {}) {
  const { limit = 100, startDate, endDate } = options;
  const query = { user };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get audit logs by blockchain transaction
AuditLogSchema.statics.getByBlockchainTx = function (blockchainTx) {
  return this.find({ blockchainTx }).sort({ timestamp: -1 });
};

// Static method to get audit logs by IPFS CID
AuditLogSchema.statics.getByIPFSCid = function (ipfsCid) {
  return this.find({ ipfsCid }).sort({ timestamp: -1 });
};

// Instance method to check if this is an error log
AuditLogSchema.methods.isError = function () {
  return this.severity === 'error';
};

// Instance method to check if this is a warning log
AuditLogSchema.methods.isWarning = function () {
  return this.severity === 'warning';
};

// Instance method to get formatted timestamp for display
AuditLogSchema.methods.getFormattedTimestamp = function () {
  return this.timestamp.toISOString();
};

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
