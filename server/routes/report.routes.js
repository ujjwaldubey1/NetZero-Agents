import express from 'express';
import {
  getCurrentReport,
  freezeReportHandler,
  generateNarrative,
  getAllReports,
  getReport,
} from '../controllers/report.controller.js';
import { authRequired, roleRequired } from '../middleware/auth.js';
import Report from '../models/Report.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/current', authRequired, roleRequired('operator'), getCurrentReport);
router.post('/freeze', authRequired, roleRequired('operator'), freezeReportHandler);
router.post('/generate-narrative', authRequired, roleRequired('operator'), generateNarrative);
router.get('/', authRequired, roleRequired('operator'), getAllReports);
router.get('/:reportId', authRequired, roleRequired('operator'), getReport);

/**
 * POST /api/reports/create
 * Create a new report using the new Report model
 */
router.post('/create', authRequired, roleRequired('operator'), async (req, res) => {
  try {
    const { facilityId, period, scope1, scope2, scope3, totalCO2e, reportHash, merkleRoot, ...otherFields } = req.body;
    
    // Validate required fields
    if (!facilityId || !period) {
      return res.status(400).json({ error: 'facilityId and period are required' });
    }
    
    // Ensure scope objects exist
    const finalScope1 = scope1 || {};
    const finalScope2 = scope2 || {};
    const finalScope3 = scope3 || {};
    const finalTotalCO2e = totalCO2e !== undefined ? Number(totalCO2e) : 0;
    
    // Prepare report data for hashing
    const reportData = {
      facilityId,
      period,
      scope1: finalScope1,
      scope2: finalScope2,
      scope3: finalScope3,
      totalCO2e: finalTotalCO2e,
    };
    
    // Generate report hash if not provided or invalid
    let finalReportHash = reportHash;
    const hashRegex = /^[a-f0-9]{64}$/i;
    if (!finalReportHash || !hashRegex.test(finalReportHash.trim())) {
      const canonical = JSON.stringify(reportData, Object.keys(reportData).sort());
      finalReportHash = crypto.createHash('sha256').update(canonical).digest('hex');
    } else {
      finalReportHash = finalReportHash.trim();
    }
    
    // Generate merkle root if not provided or invalid
    let finalMerkleRoot = merkleRoot;
    if (!finalMerkleRoot || !hashRegex.test(finalMerkleRoot.trim())) {
      // Generate a default merkle root from report data
      const merkleData = JSON.stringify(reportData);
      finalMerkleRoot = crypto.createHash('sha256').update(merkleData).digest('hex');
    } else {
      finalMerkleRoot = finalMerkleRoot.trim();
    }
    
    // Create report with validated/generated hashes
    const report = new Report({
      facilityId,
      period,
      scope1: finalScope1,
      scope2: finalScope2,
      scope3: finalScope3,
      totalCO2e: finalTotalCO2e,
      reportHash: finalReportHash,
      merkleRoot: finalMerkleRoot,
      status: otherFields.status || 'pending',
      ipfsLinks: otherFields.ipfsLinks || {},
      blockchainTx: otherFields.blockchainTx || null,
    });
    
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    // Provide more detailed error information
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(400).json({ error: err.message });
  }
});

export default router;

