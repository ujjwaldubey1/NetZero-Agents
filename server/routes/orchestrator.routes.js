/**
 * Orchestrator Routes
 * API endpoints for the master AI orchestrator
 */

import express from 'express';
import { analyzeEmissions, getOrchestratorStatus } from '../controllers/orchestrator.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/orchestrator/status
 * Get orchestrator service status
 */
router.get('/status', getOrchestratorStatus);

/**
 * POST /api/orchestrator/analyze
 * Trigger comprehensive emissions analysis
 * 
 * Body (JSON):
 * {
 *   "datacenterName": "India_northEast",
 *   "period": "Q1 2025"  // or "2025-Q1"
 * }
 */
router.post('/analyze', authRequired, analyzeEmissions);

export default router;

