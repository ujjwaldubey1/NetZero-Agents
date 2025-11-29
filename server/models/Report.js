import mongoose from 'mongoose';

/**
 * Report Schema for NetZero Agents
 * Tracks emissions reports with blockchain integration and IPFS storage
 */
const ReportSchema = new mongoose.Schema(
  {
    facilityId: {
      type: String,
      required: [true, 'Facility ID is required'],
      trim: true,
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
      trim: true,
    },
    scope1: {
      type: Object,
      required: [true, 'Scope 1 emissions data is required'],
      default: {},
    },
    scope2: {
      type: Object,
      required: [true, 'Scope 2 emissions data is required'],
      default: {},
    },
    scope3: {
      type: Object,
      required: [true, 'Scope 3 emissions data is required'],
      default: {},
    },
    totalCO2e: {
      type: Number,
      required: [true, 'Total CO2e is required'],
      min: [0, 'Total CO2e must be a positive number'],
    },
    reportHash: {
      type: String,
      required: [true, 'Report hash is required'],
      trim: true,
      match: [/^[a-f0-9]{64}$/i, 'Report hash must be a valid SHA-256 hash (64 hex characters)'],
    },
    merkleRoot: {
      type: String,
      required: [true, 'Merkle root is required'],
      trim: true,
      match: [/^[a-f0-9]{64}$/i, 'Merkle root must be a valid SHA-256 hash (64 hex characters)'],
    },
    ipfsLinks: {
      type: Object,
      default: {},
    },
    blockchainTx: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'validated', 'minted', 'failed'],
        message: 'Status must be one of: pending, validated, minted, failed',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema will be saved
    collection: 'reports', // Explicit collection name
  }
);

// Indexes for better query performance
ReportSchema.index({ facilityId: 1, period: 1 }, { unique: true });
ReportSchema.index({ status: 1 });
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ reportHash: 1 });

// Virtual for formatted period display (optional)
ReportSchema.virtual('periodFormatted').get(function () {
  return this.period;
});

// Ensure virtuals are included in JSON output
ReportSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

// Instance method to check if report is ready for minting
ReportSchema.methods.isReadyForMinting = function () {
  return this.status === 'validated' && this.reportHash && this.merkleRoot;
};

// Instance method to get total emissions summary
ReportSchema.methods.getEmissionsSummary = function () {
  return {
    scope1: this.scope1,
    scope2: this.scope2,
    scope3: this.scope3,
    totalCO2e: this.totalCO2e,
  };
};

// Static method to find reports by facility
ReportSchema.statics.findByFacility = function (facilityId) {
  return this.find({ facilityId }).sort({ createdAt: -1 });
};

// Static method to find reports by status
ReportSchema.statics.findByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Pre-save hook to validate data consistency
ReportSchema.pre('save', function (next) {
  // Ensure status progression is logical
  if (this.status === 'minted' && !this.blockchainTx) {
    return next(new Error('Cannot set status to minted without blockchain transaction hash'));
  }
  next();
});

const Report = mongoose.model('Report', ReportSchema);

export default Report;
