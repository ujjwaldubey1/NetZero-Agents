import express from 'express';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { mintReportNFT } from '../blockchain/mint/mintReportNFT.js';
import Report from '../models/Report.js';
import Certificate from '../models/Certificate.js';
import { hashReport } from '../services/hashing.service.js';

const router = express.Router();

/**
 * POST /api/blockchain/mint-report
 * Mint a report as a CIP-68 NFT
 */
router.post('/mint-report', authRequired, roleRequired('operator'), async (req, res) => {
  try {
    const { reportId, orgDid } = req.body;
    
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
    
    // Update certificate if exists or create new one
    await Certificate.findOneAndUpdate(
      { reportId: report._id },
      {
        reportId: report._id,
        txHash: result.txHash,
        policyId: result.policyId,
        assetName: result.assetName,
        fullAssetName: result.fullAssetName,
        mintedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      txHash: result.txHash,
      policyId: result.policyId,
      assetName: result.assetName,
      fullAssetName: result.fullAssetName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/blockchain/certificates
 * Get all certificates for current user
 */
router.get('/certificates', authRequired, async (req, res) => {
  try {
    const certificates = await Certificate.find({ ownerId: req.user.id }).sort({ mintedAt: -1 });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/blockchain/certificate/:certificateId
 * Get certificate details
 */
router.get('/certificate/:certificateId', authRequired, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId);
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
});

export default router;

