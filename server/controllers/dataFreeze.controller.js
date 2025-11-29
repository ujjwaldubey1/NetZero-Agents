/**
 * Data Freeze Controller
 * Handles requests for freezing data and generating cryptographic proofs
 */

import { freezeDataAndGenerateProofs, verifyReportHash, verifyEvidenceMerkleRoot } from '../services/dataFreeze.service.js';
import AuditLog from '../models/AuditLog.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

/**
 * Freeze data and generate cryptographic proofs
 * POST /api/data-freeze/freeze
 * Body: { data: Object } - The data to freeze
 */
export const freezeData = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Request body must contain a "data" field with the object to freeze',
      });
    }

    console.log('🔒 Freezing data and generating cryptographic proofs...');

    // Freeze data and generate proofs
    const proofs = freezeDataAndGenerateProofs(data);

    // Log audit event
    await AuditLog.logInfo({
      event: 'DATA_FREEZE_COMPLETED',
      details: {
        evidenceCount: proofs.evidence_hashes.length,
        reportHash: proofs.report_hash,
        merkleRoot: proofs.evidence_merkle_root,
      },
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
      entityId: null,
    }).catch((err) => console.error('Audit log error:', err));

    res.status(200).json({
      success: true,
      message: 'Data frozen and cryptographic proofs generated successfully',
      ...proofs,
    });
  } catch (error) {
    console.error('❌ Data freeze error:', error);

    // Log error
    await AuditLog.logError({
      event: 'DATA_FREEZE_FAILED',
      error: error.message,
      details: {
        errorStack: error.stack,
      },
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
    }).catch((err) => console.error('Audit log error:', err));

    res.status(500).json({
      error: 'Data freeze failed',
      message: error.message,
    });
  }
};

/**
 * Verify report hash
 * POST /api/data-freeze/verify-report
 * Body: { data: Object, expectedHash: string }
 */
export const verifyReport = async (req, res) => {
  try {
    const { data, expectedHash } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Request body must contain a "data" field',
      });
    }

    if (!expectedHash || typeof expectedHash !== 'string') {
      return res.status(400).json({
        error: 'Invalid hash',
        message: 'Request body must contain an "expectedHash" field',
      });
    }

    const isValid = verifyReportHash(data, expectedHash);

    res.status(200).json({
      success: true,
      verified: isValid,
      message: isValid
        ? 'Report hash verification successful - data integrity confirmed'
        : 'Report hash verification failed - data may have been tampered with',
    });
  } catch (error) {
    console.error('❌ Report verification error:', error);

    res.status(500).json({
      error: 'Verification failed',
      message: error.message,
    });
  }
};

/**
 * Verify evidence Merkle root
 * POST /api/data-freeze/verify-evidence
 * Body: { evidenceItems: Array<Object>, expectedMerkleRoot: string }
 */
export const verifyEvidence = async (req, res) => {
  try {
    const { evidenceItems, expectedMerkleRoot } = req.body;

    if (!evidenceItems || !Array.isArray(evidenceItems)) {
      return res.status(400).json({
        error: 'Invalid evidence items',
        message: 'Request body must contain an "evidenceItems" array',
      });
    }

    if (!expectedMerkleRoot || typeof expectedMerkleRoot !== 'string') {
      return res.status(400).json({
        error: 'Invalid Merkle root',
        message: 'Request body must contain an "expectedMerkleRoot" field',
      });
    }

    const isValid = verifyEvidenceMerkleRoot(evidenceItems, expectedMerkleRoot);

    res.status(200).json({
      success: true,
      verified: isValid,
      message: isValid
        ? 'Evidence Merkle root verification successful - all evidence items are intact'
        : 'Evidence Merkle root verification failed - evidence may have been tampered with',
    });
  } catch (error) {
    console.error('❌ Evidence verification error:', error);

    res.status(500).json({
      error: 'Verification failed',
      message: error.message,
    });
  }
};

