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

const router = express.Router();

router.post('/issue', authRequired, roleRequired('operator'), async (req, res) => {
  try {
    const { reportId, orgDid, dataCenterName = 'default-dc' } = req.body;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.status !== 'frozen') return res.status(400).json({ error: 'Report must be frozen' });

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
    report.status = 'certified';
    await report.save();
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

export default router;
