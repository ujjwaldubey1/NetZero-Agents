/**
 * Compliance Log Controller
 * Handles API requests for compliance log population and report viewing
 */

import {
  getComplianceLogs,
  getPeriodDetails,
  getPeriodNarrative,
} from '../services/complianceLog.service.js';

/**
 * Get compliance log table rows for a datacenter
 * GET /api/reports?datacenter=<dc>
 */
export const getComplianceTable = async (req, res) => {
  try {
    const { datacenter } = req.query;

    if (!datacenter) {
      return res.status(400).json({
        error: 'Datacenter required',
        message: 'Please provide a datacenter parameter: ?datacenter=<datacenter-name>',
      });
    }

    console.log(`📊 [Compliance Log] Fetching compliance logs for datacenter: ${datacenter}`);

    const result = await getComplianceLogs(datacenter);

    res.json({
      success: true,
      datacenter: datacenter,
      tableRows: result.tableRows,
      viewPayloads: result.viewPayloads,
    });
  } catch (error) {
    console.error('❌ Compliance log fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch compliance logs',
      message: error.message,
    });
  }
};

/**
 * Get detailed view payload for a specific period
 * GET /api/reports/:period/details?datacenter=<dc>
 */
export const getPeriodDetailsView = async (req, res) => {
  try {
    const { period } = req.params;
    const { datacenter } = req.query;

    if (!datacenter) {
      return res.status(400).json({
        error: 'Datacenter required',
        message: 'Please provide a datacenter parameter: ?datacenter=<datacenter-name>',
      });
    }

    if (!period) {
      return res.status(400).json({
        error: 'Period required',
        message: 'Please provide a period in the URL: /api/reports/:period/details',
      });
    }

    console.log(`📄 [Compliance Log] Fetching details for period: ${period}, datacenter: ${datacenter}`);

    const details = await getPeriodDetails(datacenter, period);

    res.json({
      success: true,
      datacenter: datacenter,
      period: period,
      ...details,
    });
  } catch (error) {
    console.error('❌ Period details fetch error:', error);
    res.status(404).json({
      error: 'Period details not found',
      message: error.message,
    });
  }
};

/**
 * Get narrative for a specific period
 * GET /api/reports/:period/narrative?datacenter=<dc>
 */
export const getPeriodNarrativeView = async (req, res) => {
  try {
    const { period } = req.params;
    const { datacenter } = req.query;

    if (!datacenter) {
      return res.status(400).json({
        error: 'Datacenter required',
        message: 'Please provide a datacenter parameter: ?datacenter=<datacenter-name>',
      });
    }

    if (!period) {
      return res.status(400).json({
        error: 'Period required',
        message: 'Please provide a period in the URL: /api/reports/:period/narrative',
      });
    }

    console.log(`📝 [Compliance Log] Fetching narrative for period: ${period}, datacenter: ${datacenter}`);

    const narrative = await getPeriodNarrative(datacenter, period);

    res.json({
      success: true,
      datacenter: datacenter,
      period: period,
      narrative: narrative,
    });
  } catch (error) {
    console.error('❌ Narrative fetch error:', error);
    res.status(404).json({
      error: 'Narrative not found',
      message: error.message,
    });
  }
};


