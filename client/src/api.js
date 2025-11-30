import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Convenience helpers
export const fetchDataCenters = () => api.get('/api/datacenters');
export const triggerInviteBot = (datacenter, period) => api.post('/api/orchestrator/invite-bot', { datacenter, period });
export const triggerReminderBot = (datacenter, period) => api.post('/api/orchestrator/reminder-bot', { datacenter, period });
export const fetchStaff = () => api.get('/api/admin/staff');

// ===========================================================
// ORCHESTRATOR API FUNCTIONS
// ===========================================================

/**
 * Get orchestrator service status
 * GET /api/orchestrator/status
 */
export const getOrchestratorStatus = () => api.get('/api/orchestrator/status');

/**
 * Analyze emissions using the orchestrator
 * POST /api/orchestrator/analyze
 * Body: { datacenterName: string, period: string }
 */
export const analyzeEmissions = (datacenterName, period) => 
  api.post('/api/orchestrator/analyze', { datacenterName, period });

/**
 * Verify report hash integrity
 * POST /api/data-freeze/verify-report
 * Body: { data: Object, expectedHash: string }
 */
export const verifyReportHash = (data, expectedHash) => 
  api.post('/api/data-freeze/verify-report', { data, expectedHash });

/**
 * Verify evidence Merkle root integrity
 * POST /api/data-freeze/verify-evidence
 * Body: { evidenceItems: Array, expectedMerkleRoot: string }
 */
export const verifyEvidenceMerkleRoot = (evidenceItems, expectedMerkleRoot) => 
  api.post('/api/data-freeze/verify-evidence', { evidenceItems, expectedMerkleRoot });

// ===========================================================
// CERTIFICATE MINTING API FUNCTIONS
// ===========================================================

/**
 * Mint a compliance certificate from a frozen report
 * POST /api/certificates/mint
 * Body: { frozenReport: Object }
 */
export const mintCertificate = (frozenReport) => 
  api.post('/api/certificates/mint', { frozenReport });

/**
 * Mint certificate from orchestrator analysis result
 * POST /api/certificates/mint-from-analysis
 * Body: { analysisResult: Object }
 */
export const mintCertificateFromAnalysis = (analysisResult) => 
  api.post('/api/certificates/mint-from-analysis', { analysisResult });

/**
 * Get certificate minting status
 * GET /api/certificates/mint-status
 */
export const getCertificateMintingStatus = () => 
  api.get('/api/certificates/mint-status');

/**
 * Get recent orchestrator analysis results
 * GET /api/orchestrator/results
 */
export const getOrchestratorResults = () => 
  api.get('/api/orchestrator/results');

// ===========================================================
// COMPLIANCE LOG API FUNCTIONS
// ===========================================================

/**
 * Get compliance log table rows and view payloads for a datacenter
 * GET /api/reports?datacenter=<dc>
 * Returns: { tableRows: [...], viewPayloads: {...} }
 */
export const getComplianceLogs = (datacenter) => 
  api.get('/api/reports', { params: { datacenter } });

/**
 * Get detailed view payload for a specific period
 * GET /api/reports/:period/details?datacenter=<dc>
 */
export const getPeriodDetails = (period, datacenter) => 
  api.get(`/api/reports/${period}/details`, { params: { datacenter } });

/**
 * Get narrative for a specific period
 * GET /api/reports/:period/narrative?datacenter=<dc>
 */
export const getPeriodNarrative = (period, datacenter) => 
  api.get(`/api/reports/${period}/narrative`, { params: { datacenter } });