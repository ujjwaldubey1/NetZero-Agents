import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { proveLessThan, verifyProof } from '../services/zkService.js';
import LedgerEvent from '../models/LedgerEvent.js';
import ZkProof from '../models/ZkProof.js';

const router = express.Router();

router.post('/prove', authRequired, async (req, res) => {
  try {
    const { value, threshold } = req.body;
    const proof = await proveLessThan({ ownerId: req.user.id, value, threshold });
    res.json({ proofId: proof._id, publicSignals: proof.publicSignals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', authRequired, async (req, res) => {
  try {
    const { proofId } = req.body;
    const proofDoc = await ZkProof.findById(proofId);
    if (!proofDoc) return res.status(404).json({ error: 'Proof not found' });
    const ok = await verifyProof(proofDoc);
    if (ok) {
      await LedgerEvent.create({ type: 'ZK_PROOF_VERIFIED', detail: `Proof ${proofId} verified` });
    }
    res.json({ verified: ok });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
