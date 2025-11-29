import express from 'express';
import {
  getCurrentReport,
  freezeReportHandler,
  generateNarrative,
  getAllReports,
  getReport,
} from '../controllers/report.controller.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/current', authRequired, roleRequired('operator'), getCurrentReport);
router.post('/freeze', authRequired, roleRequired('operator'), freezeReportHandler);
router.post('/generate-narrative', authRequired, roleRequired('operator'), generateNarrative);
router.get('/', authRequired, roleRequired('operator'), getAllReports);
router.get('/:reportId', authRequired, roleRequired('operator'), getReport);

export default router;

