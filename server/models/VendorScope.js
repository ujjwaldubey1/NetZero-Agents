import mongoose from 'mongoose';

/**
 * VendorScope Schema for NetZero Agents
 * Tracks vendor Scope 3 emissions data submissions with IPFS storage and approval workflow
 */
const VendorScopeSchema = new mongoose.Schema(
  {
    vendorEmail: {
      type: String,
      required: [true, 'Vendor email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    facilityId: {
      type: String,
      required: [true, 'Facility ID is required'],
      trim: true,
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
      trim: true,
      match: [/^\d{4}-(Q[1-4]|\d{2})$/, 'Period must be in format YYYY-QN or YYYY-MM'],
    },
    data: {
      type: Object,
      default: {},
    },
    uploadedReportIpfs: {
      type: String,
      default: null,
      trim: true,
    },
    uploadedReportFilename: {
      type: String,
      default: null,
      trim: true,
    },
    attested: {
      type: Boolean,
      default: false,
    },
    attestedAt: {
      type: Date,
      default: null,
    },
    reviewedByAdmin: {
      type: Boolean,
      default: false,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'submitted', 'attested', 'approved', 'rejected'],
        message: 'Status must be one of: pending, submitted, attested, approved, rejected',
      },
      default: 'pending',
    },
    comments: {
      type: String,
      default: '',
      trim: true,
    },
    scope3Files: {
      type: [
        {
          filename: { type: String, required: true },
          storedPath: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
          type: { type: String, required: true }, // mimetype
          originalName: { type: String },
          size: { type: Number },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    strict: true, // Only fields defined in schema will be saved
    collection: 'vendorscopes', // Explicit collection name
  }
);

// Indexes for better query performance
VendorScopeSchema.index({ vendorEmail: 1, facilityId: 1, period: 1 }, { unique: true });
VendorScopeSchema.index({ facilityId: 1, period: 1 });
VendorScopeSchema.index({ vendorEmail: 1 });
VendorScopeSchema.index({ status: 1 });
VendorScopeSchema.index({ createdAt: -1 });
VendorScopeSchema.index({ uploadedReportIpfs: 1 });

// Virtual to check if report file is available
VendorScopeSchema.virtual('hasUploadedReport').get(function () {
  return !!(this.uploadedReportIpfs && this.uploadedReportFilename);
});

// Virtual for download URL (if IPFS gateway is configured)
VendorScopeSchema.virtual('downloadUrl').get(function () {
  if (!this.uploadedReportIpfs) return null;
  // Default IPFS gateway - can be configured via environment variable
  const gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  return `${gateway}${this.uploadedReportIpfs}`;
});

// Ensure virtuals are included in JSON output
VendorScopeSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

// Instance method: Mark as submitted when vendor uploads report
VendorScopeSchema.methods.markAsSubmitted = function (ipfsCid, filename) {
  this.uploadedReportIpfs = ipfsCid;
  this.uploadedReportFilename = filename;
  this.status = 'submitted';
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Vendor attests to the data
VendorScopeSchema.methods.attest = function () {
  this.attested = true;
  this.attestedAt = new Date();
  this.status = 'attested';
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Admin approves the submission
VendorScopeSchema.methods.approve = function (comments = '') {
  this.reviewedByAdmin = true;
  this.reviewedAt = new Date();
  this.status = 'approved';
  this.comments = comments;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Admin rejects the submission
VendorScopeSchema.methods.reject = function (comments = '') {
  this.reviewedByAdmin = true;
  this.reviewedAt = new Date();
  this.status = 'rejected';
  this.comments = comments;
  this.updatedAt = new Date();
  return this.save();
};

// Instance method: Get submission timeline
VendorScopeSchema.methods.getTimeline = function () {
  const timeline = [];
  
  if (this.createdAt) {
    timeline.push({
      event: 'Created',
      timestamp: this.createdAt,
      description: 'Vendor scope entry created',
    });
  }
  
  if (this.uploadedReportIpfs) {
    timeline.push({
      event: 'Report Uploaded',
      timestamp: this.updatedAt,
      description: `File uploaded: ${this.uploadedReportFilename}`,
    });
  }
  
  if (this.attested && this.attestedAt) {
    timeline.push({
      event: 'Attested',
      timestamp: this.attestedAt,
      description: 'Vendor attested to data accuracy',
    });
  }
  
  if (this.reviewedByAdmin && this.reviewedAt) {
    timeline.push({
      event: this.status === 'approved' ? 'Approved' : 'Rejected',
      timestamp: this.reviewedAt,
      description: this.comments || `Admin ${this.status} the submission`,
    });
  }
  
  return timeline.sort((a, b) => a.timestamp - b.timestamp);
};

// Instance method: Check if submission is complete
VendorScopeSchema.methods.isComplete = function () {
  return this.status === 'approved';
};

// Instance method: Check if can be reviewed
VendorScopeSchema.methods.canBeReviewed = function () {
  return ['submitted', 'attested'].includes(this.status);
};

// Static method: Find vendor submissions by facility and period
VendorScopeSchema.statics.findByFacilityAndPeriod = function (facilityId, period) {
  return this.find({ facilityId, period }).sort({ createdAt: -1 });
};

// Static method: Find all submissions for a vendor
VendorScopeSchema.statics.findByVendor = function (vendorEmail) {
  return this.find({ vendorEmail }).sort({ createdAt: -1 });
};

// Static method: Find submissions by status
VendorScopeSchema.statics.findByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method: Find pending admin reviews
VendorScopeSchema.statics.findPendingReviews = function () {
  return this.find({ status: { $in: ['submitted', 'attested'] } }).sort({ createdAt: -1 });
};

// Pre-save hook: Auto-update status based on actions
VendorScopeSchema.pre('save', function (next) {
  // If attested is true but attestedAt is not set, set it
  if (this.attested && !this.attestedAt) {
    this.attestedAt = new Date();
  }
  
  // If reviewedByAdmin is true but reviewedAt is not set, set it
  if (this.reviewedByAdmin && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  
  // Ensure uploadedReportIpfs and uploadedReportFilename are set together
  if (this.uploadedReportIpfs && !this.uploadedReportFilename) {
    this.uploadedReportFilename = 'report.pdf'; // Default filename
  }
  
  next();
});

const VendorScope = mongoose.model('VendorScope', VendorScopeSchema);

export default VendorScope;
