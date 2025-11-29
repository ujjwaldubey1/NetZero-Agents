import express from 'express';
import { generateProof, verifyProofHandler } from '../controllers/zk.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/prove', authRequired, generateProof);
router.post('/verify', authRequired, verifyProofHandler);

export default router;

