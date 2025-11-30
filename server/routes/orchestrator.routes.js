import express from 'express';
import { getOrchestratorStatus, analyzeEmissions } from '../controllers/orchestrator.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/orchestrator/status
 * Get orchestrator service status
 */
router.get('/status', authRequired, getOrchestratorStatus);

/**
 * POST /api/orchestrator/analyze
 * Run comprehensive emissions analysis
 * Body: { datacenterName: string, period: string }
 */
router.post('/analyze', authRequired, analyzeEmissions);

/**
 * GET /api/orchestrator/results
 * Get recent orchestrator analysis results (for certificate minting)
 */
router.get('/results', authRequired, async (req, res) => {
  try {
    // For now, return results from audit logs
    // In production, you might want to store orchestrator results in a separate collection
    const AuditLog = (await import('../models/AuditLog.js')).default;
    
    const results = await AuditLog.find({
      event: 'ORCHESTRATOR_ANALYSIS_COMPLETED',
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Extract relevant data from audit logs and construct cryptographic_proofs
    const formattedResults = results.map(log => {
      const reportHash = log.details?.reportHash;
      const merkleRoot = log.details?.merkleRoot;
      
      // Construct cryptographic_proofs structure if we have the required data
      const cryptographic_proofs = (reportHash && merkleRoot) ? {
        report_hash: reportHash,
        evidence_merkle_root: merkleRoot,
        evidence_hashes: [], // Will be empty for audit log results
      } : null;
      
      return {
        datacenter: log.details?.datacenterName || log.entityId,
        period: log.details?.period,
        reportHash: reportHash,
        merkleRoot: merkleRoot,
        cryptographic_proofs: cryptographic_proofs,
        generatedAt: log.createdAt || log.created_at,
        masumiTransactionCount: log.details?.masumiTransactionCount || 0,
        vendorCount: log.details?.vendorCount || 0,
        totalAnomalies: log.details?.totalAnomalies || 0,
      };
    });

    res.json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    console.error('Error fetching orchestrator results:', error);
    res.status(500).json({
      error: 'Failed to fetch orchestrator results',
      message: error.message,
    });
  }
});

export default router;
