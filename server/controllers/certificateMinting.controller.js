/**
 * Certificate Minting Controller
 * Handles API requests for minting compliance certificates from frozen reports
 */

import { mintComplianceCertificate } from '../services/certificateMinting.service.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Mint a compliance certificate from a frozen orchestrator report
 * POST /api/certificates/mint
 * Body: { frozenReport: Object }
 */
export const mintCertificate = async (req, res) => {
  try {
    const { frozenReport } = req.body;

    if (!frozenReport) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must contain a "frozenReport" object',
      });
    }

    // Validate required fields
    if (!frozenReport.reportHash || !frozenReport.evidenceMerkleRoot) {
      return res.status(400).json({
        error: 'Invalid frozen report',
        message: 'frozenReport must contain reportHash and evidenceMerkleRoot',
      });
    }

    console.log('🔐 [Certificate Controller] Certificate minting requested');
    console.log(`   Datacenter: ${frozenReport.datacenter || 'N/A'}`);
    console.log(`   Period: ${frozenReport.period || 'N/A'}`);

    // Mint the certificate
    const result = await mintComplianceCertificate(frozenReport, {
      userId: req.user?.email || req.user?.id?.toString() || 'anonymous',
      issuedBy: req.user?.email || req.user?.id?.toString() || 'system',
    });

    // Log audit event
    await AuditLog.logInfo({
      event: 'CERTIFICATE_MINT_REQUEST',
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
      entityId: result.certificateId,
      details: {
        certificateId: result.certificateId,
        txHash: result.txHash,
        datacenter: frozenReport.datacenter,
        period: frozenReport.period,
      },
      blockchainTx: result.txHash,
    }).catch((err) => console.error('Audit log error:', err));

    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Certificate minting error:', error);

    // Log error
    await AuditLog.logError({
      event: 'CERTIFICATE_MINT_FAILED',
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
      error: error.message,
      details: {
        frozenReport: req.body.frozenReport ? {
          datacenter: req.body.frozenReport.datacenter,
          period: req.body.frozenReport.period,
          hasReportHash: !!req.body.frozenReport.reportHash,
          hasMerkleRoot: !!req.body.frozenReport.evidenceMerkleRoot,
        } : null,
      },
    }).catch((err) => console.error('Audit log error:', err));

    res.status(500).json({
      error: 'Certificate minting failed',
      message: error.message,
    });
  }
};

/**
 * Mint certificate from orchestrator analysis result
 * POST /api/certificates/mint-from-analysis
 * Body: { analysisResult: Object }
 */
export const mintCertificateFromAnalysis = async (req, res) => {
  try {
    const { analysisResult } = req.body;

    if (!analysisResult) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must contain an "analysisResult" object from the orchestrator',
      });
    }

    // Extract frozen report data from orchestrator result
    if (!analysisResult.cryptographic_proofs) {
      return res.status(400).json({
        error: 'Invalid analysis result',
        message: 'analysisResult must contain cryptographic_proofs from the orchestrator',
      });
    }

    const frozenReport = {
      reportHash: analysisResult.cryptographic_proofs.report_hash,
      evidenceMerkleRoot: analysisResult.cryptographic_proofs.evidence_merkle_root,
      evidenceHashes: analysisResult.cryptographic_proofs.evidence_hashes || [],
      datacenter: analysisResult.datacenter,
      period: analysisResult.period,
      jobId: analysisResult.jobId || `job_${Date.now()}_${analysisResult.datacenter}_${analysisResult.period}`,
      masumiTransactions: analysisResult.masumi_transactions || [],
      ipfsBundle: analysisResult.ipfs_links?.report_bundle?.replace('ipfs://', '') || null,
      timestamp: analysisResult.generatedAt || new Date().toISOString(),
    };

    console.log('🔐 [Certificate Controller] Minting certificate from orchestrator analysis');
    console.log(`   Datacenter: ${frozenReport.datacenter}`);
    console.log(`   Period: ${frozenReport.period}`);

    // Mint the certificate
    const result = await mintComplianceCertificate(frozenReport, {
      userId: req.user?.email || req.user?.id?.toString() || 'anonymous',
      issuedBy: req.user?.email || req.user?.id?.toString() || 'system',
    });

    // Log audit event
    await AuditLog.logInfo({
      event: 'CERTIFICATE_MINT_FROM_ANALYSIS',
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
      entityId: result.certificateId,
      details: {
        certificateId: result.certificateId,
        txHash: result.txHash,
        datacenter: frozenReport.datacenter,
        period: frozenReport.period,
        source: 'orchestrator_analysis',
      },
      blockchainTx: result.txHash,
    }).catch((err) => console.error('Audit log error:', err));

    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Certificate minting from analysis error:', error);

    // Log error
    await AuditLog.logError({
      event: 'CERTIFICATE_MINT_FROM_ANALYSIS_FAILED',
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
      error: error.message,
      details: {
        hasAnalysisResult: !!req.body.analysisResult,
        hasCryptographicProofs: !!req.body.analysisResult?.cryptographic_proofs,
      },
    }).catch((err) => console.error('Audit log error:', err));

    res.status(500).json({
      error: 'Certificate minting failed',
      message: error.message,
    });
  }
};

/**
 * Get certificate minting status
 * GET /api/certificates/mint-status
 */
export const getMintingStatus = async (req, res) => {
  try {
    const { isMasumiEnabled, getMasumiConfig } = await import('../services/masumi.service.js');
    
    const masumiEnabled = isMasumiEnabled();
    const config = getMasumiConfig();

    res.json({
      success: true,
      masumi: {
        enabled: masumiEnabled,
        apiUrl: config.apiUrl,
        network: config.networkId,
        masterWallet: config.masterWallet ? `${config.masterWallet.substring(0, 10)}...` : 'Not configured',
      },
      certificateMinting: {
        available: true,
        version: '1.0',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Status check failed',
      message: error.message,
    });
  }
};


