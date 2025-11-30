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