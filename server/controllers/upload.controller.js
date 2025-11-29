import { uploadStaffFile, uploadVendorFile } from '../services/upload.service.js';
import Report from '../models/Report.js';
import VendorScope from '../models/VendorScope.js';
import AuditLog from '../models/AuditLog.js';
import DataCenter from '../models/DataCenter.js';

/**
 * Upload file for staff (scope1 or scope2)
 * POST /api/upload/staff
 */
export const uploadStaffFileHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { scope, period, datacenterId } = req.body;

    // Validate scope
    if (!scope || !['scope1', 'scope2'].includes(scope.toLowerCase().trim())) {
      return res.status(400).json({
        error: 'Invalid scope',
        message: 'Staff can only upload scope1 or scope2 files.',
      });
    }

    // Upload file and get metadata
    const fileMetadata = await uploadStaffFile({
      user: req.user,
      file: req.file,
      scope: scope.toLowerCase().trim(),
      period,
      datacenterId,
    });

    // Get facility ID (datacenter ID is the facility ID)
    const facilityId = fileMetadata.datacenterId;
    const normalizedPeriod = fileMetadata.period;

    // Find or create report
    let report = await Report.findOne({
      facilityId,
      period: normalizedPeriod,
    });

    if (!report) {
      // Create a basic report if it doesn't exist
      // Note: This will require minimum fields, so we'll use defaults
      const crypto = await import('crypto');
      const defaultReportData = {
        facilityId,
        period: normalizedPeriod,
        scope1: {},
        scope2: {},
        scope3: {},
        totalCO2e: 0,
        reportHash: crypto.createHash('sha256').update(`${facilityId}-${normalizedPeriod}`).digest('hex'),
        merkleRoot: crypto.createHash('sha256').update('empty').digest('hex'),
        status: 'pending',
      };

      report = new Report(defaultReportData);
    }

    // Add file to appropriate scope array
    const fileEntry = {
      filename: fileMetadata.filename,
      storedPath: fileMetadata.storedPath,
      uploadedAt: fileMetadata.uploadedAt,
      type: fileMetadata.mimetype,
      originalName: fileMetadata.originalName,
      size: fileMetadata.size,
    };

    if (fileMetadata.scope === 'scope1') {
      report.scope1Files.push(fileEntry);
    } else if (fileMetadata.scope === 'scope2') {
      report.scope2Files.push(fileEntry);
    }

    await report.save();

    // Log audit event
    await AuditLog.logIPFSUpload({
      entityId: report._id.toString(),
      ipfsCid: null, // Will be set if uploaded to IPFS later
      filename: fileMetadata.originalName,
      details: {
        scope: fileMetadata.scope,
        storedPath: fileMetadata.storedPath,
        size: fileMetadata.size,
      },
      user: req.user.email || req.user.id.toString(),
    }).catch((err) => console.error('Audit log error:', err));

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileMetadata,
      report: {
        id: report._id,
        facilityId: report.facilityId,
        period: report.period,
        scope: fileMetadata.scope,
        fileCount: fileMetadata.scope === 'scope1' ? report.scope1Files.length : report.scope2Files.length,
      },
    });
  } catch (error) {
    console.error('Staff upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
};

/**
 * Upload file for vendor (scope3 only)
 * POST /api/upload/vendor
 */
export const uploadVendorFileHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { period, datacenterId } = req.body;

    // Upload file and get metadata
    const fileMetadata = await uploadVendorFile({
      user: req.user,
      file: req.file,
      period,
      datacenterId,
    });

    // Get facility ID (datacenter ID is the facility ID)
    const facilityId = fileMetadata.datacenterId.toString();
    const normalizedPeriod = fileMetadata.period;
    const vendorEmail = req.user.email || req.user.id.toString();

    // Find or create vendor scope entry
    let vendorScope = await VendorScope.findOne({
      vendorEmail,
      facilityId,
      period: normalizedPeriod,
    });

    if (!vendorScope) {
      vendorScope = new VendorScope({
        vendorEmail,
        facilityId,
        period: normalizedPeriod,
        data: {},
        status: 'pending',
      });
    }

    // Add file to scope3Files array
    const fileEntry = {
      filename: fileMetadata.filename,
      storedPath: fileMetadata.storedPath,
      uploadedAt: fileMetadata.uploadedAt,
      type: fileMetadata.mimetype,
      originalName: fileMetadata.originalName,
      size: fileMetadata.size,
    };

    vendorScope.scope3Files.push(fileEntry);

    // Update status to submitted if not already attested/approved
    if (vendorScope.status === 'pending') {
      vendorScope.status = 'submitted';
    }

    await vendorScope.save();

    // Log audit event
    await AuditLog.logVendorSubmission({
      vendorEmail,
      facilityId,
      period: normalizedPeriod,
      ipfsCid: null, // Will be set if uploaded to IPFS later
      details: {
        filename: fileMetadata.originalName,
        storedPath: fileMetadata.storedPath,
        size: fileMetadata.size,
        fileCount: vendorScope.scope3Files.length,
      },
    }).catch((err) => console.error('Audit log error:', err));

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileMetadata,
      vendorScope: {
        id: vendorScope._id,
        facilityId: vendorScope.facilityId,
        period: vendorScope.period,
        status: vendorScope.status,
        fileCount: vendorScope.scope3Files.length,
      },
    });
  } catch (error) {
    console.error('Vendor upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
};
