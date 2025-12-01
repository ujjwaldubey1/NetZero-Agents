import { proveLessThan, verifyProof } from '../services/zkService.js';
import ZkProof from '../models/ZkProof.js';
import LedgerEvent from '../models/LedgerEvent.js';
import { logAction } from '../services/audit.service.js';

/**
 * Generate a ZK proof
 */
export const generateProof = async (req, res) => {
  try {
    const { value, threshold } = req.body;
    
    if (value === undefined || threshold === undefined) {
      return res.status(400).json({ error: 'Value and threshold required' });
    }
    
    const proof = await proveLessThan({
      ownerId: req.user.id,
      value,
      threshold,
    });
    
    await logAction(req, 'CREATE', 'ZK_PROOF', proof._id.toString(), { value, threshold });
    
    res.json({ proofId: proof._id, publicSignals: proof.publicSignals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Verify a ZK proof
 */
export const verifyProofHandler = async (req, res) => {
  try {
    const { proofId } = req.body;
    
    if (!proofId) {
      return res.status(400).json({ error: 'Proof ID required' });
    }
    
    const proofDoc = await ZkProof.findById(proofId);
    if (!proofDoc) {
      return res.status(404).json({ error: 'Proof not found' });
    }
    
    const ok = await verifyProof(proofDoc);
    
    if (ok) {
      await LedgerEvent.create({
        type: 'ZK_PROOF_VERIFIED',
        detail: `Proof ${proofId} verified`,
      });
      
      await logAction(req, 'VERIFY', 'ZK_PROOF', proofId, { verified: true });
    }
    
    res.json({ verified: ok });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


