import {
  getOrCreateCurrentReport,
  freezeReport,
  generateReportNarrative,
  getReportsByOwner,
  getReportById,
} from '../services/report.service.js';
import LedgerEvent from '../models/LedgerEvent.js';
import { logAction } from '../services/audit.service.js';

/**
 * Get or create current report
 */
export const getCurrentReport = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) {
      return res.status(400).json({ error: 'Period required' });
    }
    
    const report = await getOrCreateCurrentReport({
      ownerId: req.user.id,
      period,
    });
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Freeze a report
 */
export const freezeReportHandler = async (req, res) => {
  try {
    const { period } = req.body;
    if (!period) {
      return res.status(400).json({ error: 'Period required' });
    }
    
    const report = await getOrCreateCurrentReport({
      ownerId: req.user.id,
      period,
    });
    
    const frozen = await freezeReport({
      reportId: report._id,
      ownerId: req.user.id,
    });
    
    await LedgerEvent.create({
      type: 'REPORT_FROZEN',
      reportId: frozen._id,
      detail: `Report frozen ${period}`,
    });
    
    await logAction(req, 'UPDATE', 'REPORT', frozen._id.toString(), { action: 'freeze', period });
    
    res.json(frozen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Generate AI narrative for report
 */
export const generateNarrative = async (req, res) => {
  try {
    const { reportId } = req.body;
    if (!reportId) {
      return res.status(400).json({ error: 'Report ID required' });
    }
    
    const narrative = await generateReportNarrative({ reportId });
    
    res.json({ narrative });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all reports
 */
export const getAllReports = async (req, res) => {
  try {
    const reports = await getReportsByOwner(req.user.id);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get report by ID
 */
export const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await getReportById(reportId, req.user.id);
    res.json(report);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

