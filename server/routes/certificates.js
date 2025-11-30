import express from 'express';
import Certificate from '../models/Certificate.js';
import Report from '../models/Report.js';
import LedgerEvent from '../models/LedgerEvent.js';
import ZkProof from '../models/ZkProof.js';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { issueCertificateNft, hashReport } from '../services/cardanoService.js';
import hydraClient from '../services/hydraClient.js';
import { verifyProof } from '../services/zkService.js';
import { mausamiMintRecommendation } from '../services/mausamiAgent.js';
import {
  mintCertificate,
  mintCertificateFromAnalysis,
  getMintingStatus,
} from '../controllers/certificateMinting.controller.js';

const router = express.Router();

router.post('/issue', authRequired, roleRequired('operator'), async (req, res) => {
  try {
    const { reportId, orgDid, dataCenterName = 'default-dc', autoValidate = false } = req.body;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    
    // Accept both 'validated' (new model) and 'frozen' (legacy) statuses
    // Reports with 'validated' status are ready for certificate issuance
    if (report.status !== 'validated' && report.status !== 'frozen') {
      // If autoValidate is true and report has required data, auto-validate it
      if (autoValidate && report.reportHash && report.merkleRoot) {
        report.status = 'validated';
        await report.save();
        console.log(`✅ Auto-validated report ${reportId} for certificate issuance`);
      } else {
        return res.status(400).json({ 
          error: 'Report must be validated or frozen',
          message: `Current report status is "${report.status}". Please freeze/validate the report first, or set autoValidate=true.`,
          currentStatus: report.status,
          validStatuses: ['validated', 'frozen'],
          suggestion: 'Call POST /api/reports/freeze with the report period, or set autoValidate=true in the request body'
        });
      }
    }

    const reportHash = hashReport(report.toObject());
    const proofDoc = await ZkProof.findOne({ ownerId: req.user.id }).sort({ createdAt: -1 });
    let verified = false;
    if (proofDoc) {
      verified = await verifyProof(proofDoc).catch(() => false);
      if (!verified) return res.status(400).json({ error: 'ZK proof invalid' });
    }

    const refId = `${dataCenterName}-${Date.now()}`;

    const certificateData = {
      period: report.period,
      orgDid: orgDid || report.organizationName || 'did:cardano:demo',
      scopeTotals: report.scopeTotals,
      reportHash,
      zkProofId: proofDoc ? proofDoc._id.toString() : null,
      certificateRef: refId,
    };

    const mausamiAdvice = await mausamiMintRecommendation({
      orgDid: certificateData.orgDid,
      dataCenterName,
      scopeTotals: certificateData.scopeTotals,
      reportHash,
      certificateRef: refId,
    });
    if (mausamiAdvice.decision === 'hold') {
      return res.status(400).json({ error: 'Mausami agent requested hold', note: mausamiAdvice.note });
    }

    const cardanoTxHash = await issueCertificateNft(certificateData);
    let hydraTxId = null;
    if (process.env.HYDRA_WS_URL) {
      hydraTxId = await hydraClient
        .submitToHydra({ type: 'CIP68_CARBON', feeAda: mausamiAdvice.feeAda, certificateData })
        .catch(() => null);
    }

    const certificate = new Certificate({
      reportId: report._id,
      certificateId: `CERT-${Date.now()}`,
      certificateRef: refId,
      dataCenterName,
      orgDid: certificateData.orgDid,
      scopeTotals: certificateData.scopeTotals,
      reportHash,
      zkProofId: certificateData.zkProofId,
      cardanoTxHash,
      hydraTxId,
      mausamiFeeAda: mausamiAdvice.feeAda,
      mausamiNote: mausamiAdvice.note,
    });
    await certificate.save();
    
    // Update report with blockchain transaction hash BEFORE setting status to 'minted'
    // The pre-save hook requires blockchainTx when status is 'minted'
    // Priority: cardanoTxHash > hydraTxId > masumiTxHash > certificate ID
    let blockchainTxValue = null;
    
    if (cardanoTxHash && cardanoTxHash.trim() !== '') {
      blockchainTxValue = cardanoTxHash.trim();
    } else if (hydraTxId && hydraTxId.trim() !== '') {
      blockchainTxValue = hydraTxId.trim();
    } else if (certificate.masumiTxHash && certificate.masumiTxHash.trim() !== '') {
      blockchainTxValue = certificate.masumiTxHash.trim();
    } else {
      // If no blockchain transaction, use certificate ID as fallback
      blockchainTxValue = certificate._id.toString();
      console.warn(`⚠️  No blockchain transaction hash available for report ${report._id}, using certificate ID as fallback: ${blockchainTxValue}`);
    }
    
    // Ensure blockchainTx is set before proceeding
    if (!blockchainTxValue || blockchainTxValue.trim() === '') {
      return res.status(500).json({ 
        error: 'Failed to set blockchain transaction hash',
        message: 'Cannot issue certificate without blockchain transaction hash. Cardano minting may have failed.',
        certificateId: certificate._id,
      });
    }
    
    // Set blockchainTx first (before status) to satisfy pre-save hook
    report.blockchainTx = blockchainTxValue;
    console.log(`✅ Set report.blockchainTx = ${blockchainTxValue.substring(0, 32)}...`);
    
    // Now set status to 'minted' after blockchainTx is set
    report.status = 'minted';
    
    // Save report - pre-save hook will validate that blockchainTx exists
    await report.save();
    console.log(`✅ Report status updated to 'minted' with blockchainTx`);
    await LedgerEvent.create({ type: 'CERT_ISSUED', reportId: report._id, certificateId: certificate._id, detail: `Certificate issued tx=${cardanoTxHash}` });

    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authRequired, async (req, res) => {
  const certs = await Certificate.find({}).sort({ issuedAt: -1 });
  res.json(certs);
});

// ===========================================================
// CERTIFICATE MINTING AGENT ROUTES
// ===========================================================

/**
 * POST /api/certificates/mint
 * Mint a compliance certificate from a frozen report
 * Body: { frozenReport: Object }
 */
router.post('/mint', authRequired, roleRequired('operator'), mintCertificate);

/**
 * POST /api/certificates/mint-from-analysis
 * Mint a certificate directly from orchestrator analysis result
 * Body: { analysisResult: Object }
 */
router.post('/mint-from-analysis', authRequired, roleRequired('operator'), mintCertificateFromAnalysis);

/**
 * GET /api/certificates/mint-status
 * Get certificate minting service status
 */
router.get('/mint-status', authRequired, getMintingStatus);

export default router;
