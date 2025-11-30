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

router.post('/invite-bot', async (req, res) => {
  try {
    const { datacenter, period } = req.body;
    const { inviteBot } = await import('../services/agents/inviteBot.js');
    const result = await inviteBot(datacenter, period);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reminder-bot', async (req, res) => {
  try {
    const { datacenter, period } = req.body;
    const { reminderBot } = await import('../services/agents/reminderBot.js');
    const result = await reminderBot(datacenter, period);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

