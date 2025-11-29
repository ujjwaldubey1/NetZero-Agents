import { mintReportNFT } from '../blockchain/mint/mintReportNFT.js';
import Report from '../models/Report.js';
import Certificate from '../models/Certificate.js';
import { hashReport } from '../services/hashing.service.js';
import { logAction } from '../services/audit.service.js';

/**
 * Mint a report as NFT
 */
export const mintReport = async (req, res) => {
  try {
    const { reportId, orgDid } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ error: 'Report ID required' });
    }
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (report.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (report.status !== 'frozen') {
      return res.status(400).json({ error: 'Report must be frozen before minting' });
    }
    
    const reportHash = hashReport(report.toObject());
    
    const result = await mintReportNFT({
      reportData: report.toObject(),
      reportHash,
      period: report.period,
      orgDid: orgDid || report.organizationName || 'did:cardano:demo',
    });
    
    // Update or create certificate
    const certificate = await Certificate.findOneAndUpdate(
      { reportId: report._id },
      {
        reportId: report._id,
        ownerId: req.user.id,
        txHash: result.txHash,
        policyId: result.policyId,
        assetName: result.assetName,
        fullAssetName: result.fullAssetName,
        mintedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    
    await logAction(req, 'CREATE', 'CERTIFICATE', certificate._id.toString(), {
      txHash: result.txHash,
      reportId: report._id.toString(),
    });
    
    res.json({
      success: true,
      txHash: result.txHash,
      policyId: result.policyId,
      assetName: result.assetName,
      fullAssetName: result.fullAssetName,
      certificateId: certificate._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get certificates
 */
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ ownerId: req.user.id }).sort({ mintedAt: -1 });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get certificate by ID
 */
export const getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findById(certificateId);
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    if (certificate.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

