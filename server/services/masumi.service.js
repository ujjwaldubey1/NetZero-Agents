/**
 * Masumi Blockchain Service
 * Integrates with Masumi decentralized AI protocol for:
 * - On-chain identity registration
 * - Decision logging
 * - Micropayments / token-reward flow
 */

import crypto from 'crypto';

/**
 * Masumi Agent Identity Registry
 * Each agent must be registered with a unique identity
 */
const AGENT_IDENTITIES = {
  MASTER_ORCHESTRATOR: 'master_orchestrator',
  VENDOR_AGENT: 'vendor_agent',
  CARBON_CREDITS_AGENT: 'carbon_credits_agent',
  STAFF_AGENT: 'staff_agent',
  SCOPE1_AGENT: 'scope1_agent',
  SCOPE2_AGENT: 'scope2_agent',
  MERKLE_AGENT: 'merkle_agent',
};

/**
 * Payment rates for each agent (tokens per operation)
 */
const PAYMENT_RATES = {
  [AGENT_IDENTITIES.VENDOR_AGENT]: {
    base: 1, // 1 token per vendor analyzed
    bonus: 0.5, // Bonus for accurate threshold detection
  },
  [AGENT_IDENTITIES.CARBON_CREDITS_AGENT]: {
    base: 2, // 2 tokens for carbon credit analysis
    bonus: 1, // Bonus for accurate threshold detection
  },
  [AGENT_IDENTITIES.STAFF_AGENT]: {
    base: 1, // 1 token per scope analyzed
  },
  [AGENT_IDENTITIES.SCOPE1_AGENT]: {
    base: 1,
  },
  [AGENT_IDENTITIES.SCOPE2_AGENT]: {
    base: 1,
  },
  [AGENT_IDENTITIES.MERKLE_AGENT]: {
    base: 1, // 1 token per Merkle root generated
  },
  [AGENT_IDENTITIES.MASTER_ORCHESTRATOR]: {
    base: 5, // 5 tokens for orchestrating the entire process
  },
};

/**
 * Masumi Configuration
 * Note: enabled is checked at runtime to ensure env vars are loaded
 */
const MASUMI_CONFIG = {
  // Masumi API endpoint (configure via env)
  apiUrl: process.env.MASUMI_API_URL || 'https://api.masumi.network/v1',
  networkId: process.env.MASUMI_NETWORK_ID || 'masumi-testnet',
  masterWallet: process.env.MASUMI_MASTER_WALLET || null,
  // Don't cache enabled - check at runtime
};

/**
 * Register an agent identity on Masumi blockchain
 * @param {string} agentId - Agent identifier
 * @param {Object} metadata - Agent metadata
 * @returns {Promise<Object>} Registration result with transaction ID
 */
export const registerAgentIdentity = async (agentId, metadata = {}) => {
  const enabled = process.env.MASUMI_ENABLED === 'true';
  if (!enabled) {
    console.log(`[Masumi] Identity registration skipped (disabled): ${agentId}`);
    return {
      agentId,
      registered: false,
      txId: null,
      reason: 'Masumi integration disabled',
    };
  }

  try {
    // Generate agent signature
    const agentSignature = generateAgentSignature(agentId);

    // In production, this would call Masumi API
    // For now, simulate the registration
    const registrationData = {
      agentId,
      signature: agentSignature,
      metadata: {
        name: metadata.name || agentId,
        description: metadata.description || `NetZero ${agentId}`,
        capabilities: metadata.capabilities || [],
        registeredAt: new Date().toISOString(),
        ...metadata,
      },
    };

    // Simulate blockchain transaction
    const txId = await submitToMasumi('register_identity', registrationData);

    console.log(`✅ [Masumi] Agent identity registered: ${agentId} (TX: ${txId})`);

    return {
      agentId,
      registered: true,
      txId,
      signature: agentSignature,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ [Masumi] Identity registration failed for ${agentId}:`, error.message);
    return {
      agentId,
      registered: false,
      txId: null,
      error: error.message,
    };
  }
};

/**
 * Log a decision/action to Masumi blockchain
 * @param {Object} params - Logging parameters
 * @param {string} params.agentId - Agent identifier
 * @param {string} params.action - Action type (e.g., "analysis_completed", "anomaly_detected")
 * @param {Object} params.data - Data to log
 * @returns {Promise<Object>} Log result with transaction ID
 */
export const logDecision = async ({ agentId, action, data }) => {
  const enabled = process.env.MASUMI_ENABLED === 'true';
  if (!enabled) {
    return {
      logged: false,
      txId: null,
      reason: 'Masumi integration disabled',
    };
  }

  try {
    const logEntry = {
      agentId,
      action,
      timestamp: new Date().toISOString(),
      data: {
        reportHash: data.reportHash || null,
        evidenceMerkleRoot: data.evidenceMerkleRoot || null,
        anomalyFlags: data.anomalyFlags || [],
        analysisSummary: data.analysisSummary || {},
        period: data.period || null,
        datacenter: data.datacenter || null,
        ...data,
      },
      signature: generateAgentSignature(agentId, action, data),
    };

    const txId = await submitToMasumi('log_decision', logEntry);

    console.log(`📝 [Masumi] Decision logged: ${agentId} -> ${action} (TX: ${txId})`);

    return {
      logged: true,
      txId,
      timestamp: logEntry.timestamp,
      agentId,
      action,
    };
  } catch (error) {
    console.error(`❌ [Masumi] Decision logging failed:`, error.message);
    return {
      logged: false,
      txId: null,
      error: error.message,
    };
  }
};

/**
 * Schedule payment to an agent
 * @param {Object} params - Payment parameters
 * @param {string} params.agentId - Agent identifier
 * @param {number} params.amount - Amount in tokens
 * @param {string} params.reason - Payment reason
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Payment result with transaction ID
 */
export const schedulePayment = async ({ agentId, amount, reason, metadata = {} }) => {
  const enabled = process.env.MASUMI_ENABLED === 'true';
  if (!enabled) {
    console.log(`[Masumi] Payment skipped (disabled): ${agentId} - ${amount} tokens`);
    return {
      paid: false,
      txId: null,
      reason: 'Masumi integration disabled',
    };
  }

  try {
    const paymentData = {
      from: process.env.MASUMI_MASTER_WALLET || AGENT_IDENTITIES.MASTER_ORCHESTRATOR,
      to: agentId,
      amount,
      currency: 'MASUMI_TOKEN',
      reason,
      timestamp: new Date().toISOString(),
      metadata: {
        jobId: metadata.jobId || null,
        reportHash: metadata.reportHash || null,
        ...metadata,
      },
      signature: generatePaymentSignature(agentId, amount, reason),
    };

    const txId = await submitToMasumi('schedule_payment', paymentData);

    console.log(`💰 [Masumi] Payment scheduled: ${agentId} - ${amount} tokens (TX: ${txId})`);

    return {
      paid: true,
      txId,
      amount,
      agentId,
      timestamp: paymentData.timestamp,
      reason,
    };
  } catch (error) {
    console.error(`❌ [Masumi] Payment scheduling failed:`, error.message);
    return {
      paid: false,
      txId: null,
      error: error.message,
    };
  }
};

/**
 * Calculate payment amount for an agent based on their work
 * @param {string} agentId - Agent identifier
 * @param {Object} workData - Work performed by the agent
 * @returns {number} Payment amount in tokens
 */
export const calculatePayment = (agentId, workData) => {
  const rate = PAYMENT_RATES[agentId];
  if (!rate) {
    console.warn(`⚠️  [Masumi] No payment rate defined for agent: ${agentId}`);
    return 0;
  }

  let payment = rate.base || 0;

  // Apply bonuses based on work quality
  if (agentId === AGENT_IDENTITIES.VENDOR_AGENT && workData.vendorCount) {
    payment += (rate.base || 1) * workData.vendorCount;
  }

  if (agentId === AGENT_IDENTITIES.CARBON_CREDITS_AGENT && workData.accuracy) {
    payment += rate.bonus || 0;
  }

  if (agentId === AGENT_IDENTITIES.MERKLE_AGENT && workData.merkleRoot) {
    payment = rate.base || 1;
  }

  return payment;
};

/**
 * Register all agents at startup
 * @returns {Promise<Object>} Registration results
 */
export const registerAllAgents = async () => {
  const results = {};

  for (const [key, agentId] of Object.entries(AGENT_IDENTITIES)) {
    results[agentId] = await registerAgentIdentity(agentId, {
      name: key.replace(/_/g, ' ').toUpperCase(),
      description: `NetZero ${key.replace(/_/g, ' ')} Agent`,
    });
  }

  return results;
};

/**
 * Submit data to Masumi blockchain
 * This is a placeholder - in production, this would call the actual Masumi API
 * @param {string} action - Action type
 * @param {Object} data - Data to submit
 * @returns {Promise<string>} Transaction ID
 */
const submitToMasumi = async (action, data) => {
  // Simulate blockchain transaction
  // In production, this would:
  // 1. Call Masumi API endpoint
  // 2. Sign the transaction
  // 3. Submit to Masumi network
  // 4. Return transaction hash

  const txHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ action, data, timestamp: Date.now() }))
    .digest('hex')
    .substring(0, 64);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return `masumi_${txHash}`;
};

/**
 * Generate agent signature for authentication
 */
const generateAgentSignature = (agentId, action = null, data = null) => {
  const payload = {
    agentId,
    ...(action && { action }),
    ...(data && { dataHash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex') }),
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

/**
 * Generate payment signature
 */
const generatePaymentSignature = (agentId, amount, reason) => {
  const payload = { agentId, amount, reason, timestamp: Date.now() };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

/**
 * Get agent identity constants
 */
export const getAgentIdentities = () => AGENT_IDENTITIES;

/**
 * Check if Masumi is enabled
 * Checks environment variable at runtime to ensure it's loaded
 */
export const isMasumiEnabled = () => {
  const enabled = process.env.MASUMI_ENABLED === 'true';
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Masumi Debug] MASUMI_ENABLED=${process.env.MASUMI_ENABLED}, parsed=${enabled}`);
  }
  return enabled;
};

/**
 * Get current Masumi configuration from environment variables.
 * This ensures the latest values are always read.
 */
export const getMasumiConfig = () => ({
  apiUrl: process.env.MASUMI_API_URL || 'https://api.masumi.network/v1',
  networkId: process.env.MASUMI_NETWORK_ID || 'masumi-testnet',
  masterWallet: process.env.MASUMI_MASTER_WALLET || null,
  enabled: process.env.MASUMI_ENABLED === 'true',
});

export default {
  registerAgentIdentity,
  logDecision,
  schedulePayment,
  calculatePayment,
  registerAllAgents,
  getAgentIdentities,
  isMasumiEnabled,
  getMasumiConfig,
};

