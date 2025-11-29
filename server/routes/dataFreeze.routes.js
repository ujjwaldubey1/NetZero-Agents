/**
 * Data Freeze Routes
 * Routes for freezing data and generating cryptographic proofs
 */

import express from 'express';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { freezeData, verifyReport, verifyEvidence } from '../controllers/dataFreeze.controller.js';

const router = express.Router();

/**
 * POST /api/data-freeze/freeze
 * Freeze data and generate cryptographic proofs
 * Requires authentication and operator role
 */
router.post('/freeze', authRequired, roleRequired('operator'), freezeData);

/**
 * POST /api/data-freeze/verify-report
 * Verify report hash integrity
 * Requires authentication
 */
router.post('/verify-report', authRequired, verifyReport);

/**
 * POST /api/data-freeze/verify-evidence
 * Verify evidence Merkle root integrity
 * Requires authentication
 */
router.post('/verify-evidence', authRequired, verifyEvidence);

export default router;

