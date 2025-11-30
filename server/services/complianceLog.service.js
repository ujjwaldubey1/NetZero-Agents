/**
 * Compliance Log Population & Report Viewer Agent
 * 
 * Populates compliance logs table with accurate emissions data and provides
 * detailed JSON payloads for report viewing.
 */

import Report from '../models/Report.js';
import Certificate from '../models/Certificate.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Normalize period format
 * Converts "Q1 2025" -> "2025-Q1" or keeps "2025-Q1" as-is
 */
const normalizePeriod = (period) => {
  if (!period) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
  }

  if (/^\d{4}-Q[1-4]$/.test(period)) {
    return period;
  }

  const match = period.match(/(?:Q([1-4])\s*(\d{4})|(\d{4})\s*Q([1-4]))/i);
  if (match) {
    const quarter = match[1] || match[4];
    const year = match[2] || match[3];
    return `${year}-Q${quarter}`;
  }

  const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const year = parseInt(monthMatch[1], 10);
    const month = parseInt(monthMatch[2], 10);
    if (month >= 1 && month <= 12) {
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    }
  }

  console.warn(`Could not normalize period format: ${period}. Using as-is.`);
  return period;
};

/**
 * Format number to 2 decimal places
 * @param {number} value - Number to format
 * @returns {string} - Formatted string (e.g., "24.94")
 */
const formatToTwoDecimals = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  return parseFloat(value).toFixed(2);
};

/**
 * Map report status to compliance log status
 * @param {string} reportStatus - Report status from database
 * @param {boolean} hasCryptographicProofs - Whether cryptographic proofs exist
 * @param {boolean} hasCertificate - Whether certificate is minted
 * @returns {string} - Compliance log status (PENDING | ANALYZED | FROZEN | MINTED)
 */
const mapToComplianceStatus = (reportStatus, hasCryptographicProofs, hasCertificate) => {
  if (hasCertificate) {
    return 'MINTED';
  }
  if (hasCryptographicProofs) {
    return 'FROZEN';
  }
  if (reportStatus === 'validated' || reportStatus === 'pending') {
    // Check if we have orchestrator analysis (analyzed but not frozen)
    return 'ANALYZED';
  }
  return 'PENDING';
};

/**
 * Extract scope values from orchestrator result
 * @param {Object} orchestratorResult - Full orchestrator analysis result
 * @returns {Object} - { scope1, scope2, scope3 }
 */
const extractScopeValues = (orchestratorResult) => {
  const scope1 = parseFloat(orchestratorResult?.staff_summary?.staff?.scope1?.total_co2e) || 0;
  const scope2 = parseFloat(orchestratorResult?.staff_summary?.staff?.scope2?.total_co2e) || 0;
  const scope3 = parseFloat(orchestratorResult?.vendors_summary?.summary?.total_scope3) || 0;

  return {
    scope1: formatToTwoDecimals(scope1),
    scope2: formatToTwoDecimals(scope2),
    scope3: formatToTwoDecimals(scope3),
  };
};

/**
 * Extract scope values from Report model (legacy)
 * @param {Object} report - Report document
 * @returns {Object} - { scope1, scope2, scope3 }
 */
const extractScopeValuesFromReport = (report) => {
  // Try to extract from scope objects
  const scope1 = parseFloat(report.scope1?.total_co2e || report.scope1 || 0);
  const scope2 = parseFloat(report.scope2?.total_co2e || report.scope2 || 0);
  const scope3 = parseFloat(report.scope3?.total_co2e || report.scope3 || 0);

  return {
    scope1: formatToTwoDecimals(scope1),
    scope2: formatToTwoDecimals(scope2),
    scope3: formatToTwoDecimals(scope3),
  };
};

/**
 * Build view payload for a report
 * @param {Object} report - Report document
 * @param {Object} orchestratorResult - Full orchestrator result (if available)
 * @param {Object} certificate - Certificate document (if available)
 * @returns {Object} - Complete view payload
 */
const buildViewPayload = (report, orchestratorResult, certificate) => {
  const normalizedPeriod = normalizePeriod(report.period || orchestratorResult?.period);
  const datacenter = report.facilityId || orchestratorResult?.datacenter;

  // Determine status
  const hasCryptographicProofs = !!(report.merkleRoot || orchestratorResult?.cryptographic_proofs);
  const hasCertificate = !!certificate;
  const status = mapToComplianceStatus(report.status, hasCryptographicProofs, hasCertificate);

  // Extract scope values (prefer orchestrator, fallback to report)
  const scopeValues = orchestratorResult
    ? extractScopeValues(orchestratorResult)
    : extractScopeValuesFromReport(report);

  // Extract cryptographic proofs
  const reportHash = report.reportHash || orchestratorResult?.cryptographic_proofs?.report_hash || null;
  const merkleRoot = report.merkleRoot || orchestratorResult?.cryptographic_proofs?.evidence_merkle_root || null;
  const evidenceHashes = orchestratorResult?.cryptographic_proofs?.evidence_hashes || [];

  // Extract evidence from orchestrator
  const evidence = [];
  if (orchestratorResult) {
    // Vendor evidence
    if (orchestratorResult.vendors_summary?.vendors) {
      orchestratorResult.vendors_summary.vendors.forEach((vendor) => {
        evidence.push({
          type: 'vendor_scope3',
          vendor: vendor.name || vendor.email,
          scope3_comparison: vendor.scope3_comparison,
          anomalies: vendor.anomalies || [],
        });
      });
    }

    // Staff scope1 evidence
    if (orchestratorResult.staff_summary?.staff?.scope1) {
      evidence.push({
        type: 'staff_scope1',
        ...orchestratorResult.staff_summary.staff.scope1,
      });
    }

    // Staff scope2 evidence
    if (orchestratorResult.staff_summary?.staff?.scope2) {
      evidence.push({
        type: 'staff_scope2',
        ...orchestratorResult.staff_summary.staff.scope2,
      });
    }

    // Carbon credits evidence
    if (orchestratorResult.carbon_credit_summary?.carbon_credits) {
      evidence.push({
        type: 'carbon_credits',
        ...orchestratorResult.carbon_credit_summary.carbon_credits,
      });
    }
  }

  // Extract narrative
  const narrative = orchestratorResult?.final_report || report.narrative || null;

  // Extract job ID
  const jobId = orchestratorResult?.jobId || report.jobId || `job_${report._id || Date.now()}`;

  // Extract IPFS bundle
  const ipfsBundle = certificate?.ipfsBundle || 
                     orchestratorResult?.ipfs_links?.report_bundle?.replace('ipfs://', '') ||
                     report.ipfsLinks?.report_bundle?.replace('ipfs://', '') ||
                     null;

  // Extract certificate transaction hash
  const certificateTxHash = certificate?.masumiTxHash || 
                            certificate?.cardanoTxHash || 
                            report.blockchainTx ||
                            null;

  // Extract Masumi transaction count
  const masumiTxCount = orchestratorResult?.masumi_transactions?.length || 
                        certificate?.masumiTransactionCount ||
                        0;

  // Extract timestamp
  const timestamp = orchestratorResult?.generatedAt || 
                   report.createdAt?.toISOString() || 
                   new Date().toISOString();

  return {
    period: normalizedPeriod,
    datacenter: datacenter,
    status: status,
    scope1: parseFloat(scopeValues.scope1),
    scope2: parseFloat(scopeValues.scope2),
    scope3: parseFloat(scopeValues.scope3),
    reportHash: reportHash,
    merkleRoot: merkleRoot,
    evidenceHashes: evidenceHashes,
    evidence: evidence,
    narrative: narrative,
    timestamp: timestamp,
    jobId: jobId,
    masumiTxCount: masumiTxCount,
    certificateTxHash: certificateTxHash || undefined, // Only include if exists
    ipfs_bundle: ipfsBundle || undefined, // Only include if exists
  };
};

/**
 * Get compliance log table rows for a datacenter
 * @param {string} datacenter - Datacenter name or ID
 * @returns {Promise<Object>} - { tableRows, viewPayloads }
 */
export const getComplianceLogs = async (datacenter) => {
  try {
    // 1. Fetch reports for the datacenter
    const reports = await Report.find({
      facilityId: datacenter,
    })
      .sort({ period: 1 }) // Sort chronologically
      .lean();

    // 2. Fetch full orchestrator results from OrchestratorResult collection
    const OrchestratorResult = (await import('../models/OrchestratorResult.js')).default;
    const orchestratorResults = await OrchestratorResult.find({
      datacenter: datacenter,
    })
      .sort({ period: 1 })
      .lean();

    // 3. Also fetch from audit logs as fallback (for older data)
    const auditLogs = await AuditLog.find({
      event: 'ORCHESTRATOR_ANALYSIS_COMPLETED',
      $or: [
        { 'details.datacenterName': datacenter },
        { entityId: datacenter },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Fetch certificates for the datacenter
    const certificates = await Certificate.find({
      dataCenterName: datacenter,
    })
      .lean();

    // 5. Create a map of orchestrator results by period (prioritize OrchestratorResult collection)
    const orchestratorMap = new Map();
    
    // First, add full results from OrchestratorResult collection
    orchestratorResults.forEach((result) => {
      if (result.period) {
        orchestratorMap.set(result.period, result);
      }
    });

    // Then, add from audit logs for periods not in OrchestratorResult
    auditLogs.forEach((log) => {
      const period = log.details?.period;
      if (period && !orchestratorMap.has(period)) {
        // Construct minimal result from audit log
        orchestratorMap.set(period, {
          period: period,
          datacenter: log.details?.datacenterName || log.entityId,
          jobId: `job_${log._id}`,
          cryptographic_proofs: {
            report_hash: log.details?.reportHash,
            evidence_merkle_root: log.details?.merkleRoot,
            evidence_hashes: [],
          },
          masumi_transactions: [],
          masumiTransactionCount: log.details?.masumiTransactionCount || 0,
          vendors_summary: {},
          carbon_credit_summary: {},
          staff_summary: {},
          anomalies: [],
          final_report: null,
        });
      }
    });

    // 5. Create a map of certificates by period
    const certificateMap = new Map();
    certificates.forEach((cert) => {
      if (cert.period) {
        certificateMap.set(cert.period, cert);
      }
    });

    // 6. Build table rows and view payloads
    const tableRows = [];
    const viewPayloads = {};

    // Process each report
    for (const report of reports) {
      const normalizedPeriod = normalizePeriod(report.period);
      const orchestratorResult = orchestratorMap.get(normalizedPeriod);
      const certificate = certificateMap.get(normalizedPeriod);

      // Determine status
      const hasCryptographicProofs = !!(report.merkleRoot || orchestratorResult?.cryptographic_proofs);
      const hasCertificate = !!certificate;
      const status = mapToComplianceStatus(report.status, hasCryptographicProofs, hasCertificate);

      // Extract scope values
      const scopeValues = orchestratorResult
        ? extractScopeValues(orchestratorResult)
        : extractScopeValuesFromReport(report);

      // Build table row
      tableRows.push({
        period: normalizedPeriod,
        status: status,
        scope1: scopeValues.scope1,
        scope2: scopeValues.scope2,
        scope3: scopeValues.scope3,
      });

      // Build view payload
      viewPayloads[normalizedPeriod] = buildViewPayload(report, orchestratorResult, certificate);
    }

    // 7. Also include orchestrator results that don't have reports yet
    for (const [period, orchestratorResult] of orchestratorMap.entries()) {
      if (!viewPayloads[period]) {
        const certificate = certificateMap.get(period);
        const status = mapToComplianceStatus('pending', true, !!certificate);

        const scopeValues = extractScopeValues(orchestratorResult);

        tableRows.push({
          period: period,
          status: status,
          scope1: scopeValues.scope1,
          scope2: scopeValues.scope2,
          scope3: scopeValues.scope3,
        });

        // Create a minimal report object for building payload
        const minimalReport = {
          period: period,
          facilityId: orchestratorResult.datacenter,
          status: 'pending',
        };

        viewPayloads[period] = buildViewPayload(minimalReport, orchestratorResult, certificate);
      }
    }

    // 8. Sort table rows chronologically by period
    tableRows.sort((a, b) => {
      const periodA = a.period;
      const periodB = b.period;
      // Compare periods (e.g., "2025-Q1" vs "2025-Q4")
      if (periodA < periodB) return -1;
      if (periodA > periodB) return 1;
      return 0;
    });

    return {
      tableRows,
      viewPayloads,
    };
  } catch (error) {
    console.error('❌ Error fetching compliance logs:', error);
    throw new Error(`Failed to fetch compliance logs: ${error.message}`);
  }
};

/**
 * Get detailed view payload for a specific period
 * @param {string} datacenter - Datacenter name or ID
 * @param {string} period - Period (e.g., "2025-Q4")
 * @returns {Promise<Object>} - Complete view payload
 */
export const getPeriodDetails = async (datacenter, period) => {
  try {
    const normalizedPeriod = normalizePeriod(period);

    // Fetch report
    const report = await Report.findOne({
      facilityId: datacenter,
      period: normalizedPeriod,
    }).lean();

    // Fetch full orchestrator result from OrchestratorResult collection
    const OrchestratorResult = (await import('../models/OrchestratorResult.js')).default;
    let orchestratorResult = await OrchestratorResult.findOne({
      datacenter: datacenter,
      period: normalizedPeriod,
    }).lean();

    // Fallback to audit log if not found in OrchestratorResult
    if (!orchestratorResult) {
      const auditLog = await AuditLog.findOne({
        event: 'ORCHESTRATOR_ANALYSIS_COMPLETED',
        'details.period': normalizedPeriod,
        $or: [
          { 'details.datacenterName': datacenter },
          { entityId: datacenter },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      if (auditLog) {
        orchestratorResult = {
          period: normalizedPeriod,
          datacenter: auditLog.details?.datacenterName || auditLog.entityId,
          jobId: `job_${auditLog._id}`,
          cryptographic_proofs: {
            report_hash: auditLog.details?.reportHash,
            evidence_merkle_root: auditLog.details?.merkleRoot,
            evidence_hashes: [],
          },
          masumi_transactions: [],
          masumiTransactionCount: auditLog.details?.masumiTransactionCount || 0,
          vendors_summary: {},
          carbon_credit_summary: {},
          staff_summary: {},
          anomalies: [],
          final_report: null,
        };
      }
    }

    // Fetch certificate
    const certificate = await Certificate.findOne({
      dataCenterName: datacenter,
      period: normalizedPeriod,
    }).lean();

    // Build view payload
    if (!report && !orchestratorResult) {
      throw new Error(`No report or analysis found for period ${normalizedPeriod}`);
    }

    const minimalReport = report || {
      period: normalizedPeriod,
      facilityId: datacenter,
      status: 'pending',
    };

    return buildViewPayload(minimalReport, orchestratorResult, certificate);
  } catch (error) {
    console.error('❌ Error fetching period details:', error);
    throw new Error(`Failed to fetch period details: ${error.message}`);
  }
};

/**
 * Get narrative for a specific period
 * @param {string} datacenter - Datacenter name or ID
 * @param {string} period - Period (e.g., "2025-Q4")
 * @returns {Promise<string>} - Narrative text
 */
export const getPeriodNarrative = async (datacenter, period) => {
  try {
    const normalizedPeriod = normalizePeriod(period);

    // Fetch full orchestrator result from OrchestratorResult collection
    const OrchestratorResult = (await import('../models/OrchestratorResult.js')).default;
    const orchestratorResult = await OrchestratorResult.findOne({
      datacenter: datacenter,
      period: normalizedPeriod,
    }).lean();

    if (orchestratorResult?.final_report) {
      return orchestratorResult.final_report;
    }

    // Fallback to audit log
    const auditLog = await AuditLog.findOne({
      event: 'ORCHESTRATOR_ANALYSIS_COMPLETED',
      'details.period': normalizedPeriod,
      $or: [
        { 'details.datacenterName': datacenter },
        { entityId: datacenter },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (auditLog?.details?.narrative) {
      return auditLog.details.narrative;
    }

    // Return a default narrative if not found
    return `Analysis completed for ${datacenter} - ${normalizedPeriod}. Full narrative available in detailed view.`;
  } catch (error) {
    console.error('❌ Error fetching narrative:', error);
    throw new Error(`Failed to fetch narrative: ${error.message}`);
  }
};

