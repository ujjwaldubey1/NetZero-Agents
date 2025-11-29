/**
 * Orchestrator Controller
 * Handles API requests for the master AI orchestrator
 */

import { orchestrateAnalysis } from '../services/agents/orchestrator.service.js';
import AuditLog from '../models/AuditLog.js';
import { isMasumiEnabled } from '../services/masumi.service.js';

/**
 * Generate comprehensive emissions analysis report
 * POST /api/orchestrator/analyze
 * Body: { datacenterName: string, period: string }
 */
export const analyzeEmissions = async (req, res) => {
  try {
    const { datacenterName, period } = req.body;

    // Validation
    if (!datacenterName || typeof datacenterName !== 'string') {
      return res.status(400).json({
        error: 'Invalid datacenter name',
        message: 'datacenterName is required and must be a string',
      });
    }

    if (!period || typeof period !== 'string') {
      return res.status(400).json({
        error: 'Invalid period',
        message: 'period is required and must be a string (e.g., "Q1 2025" or "2025-Q1")',
      });
    }

    console.log(`🎯 Analysis request: ${datacenterName}, Period: ${period}`);

    // Trigger orchestrator (now includes Pillar 2 and 3 integration)
    const result = await orchestrateAnalysis(datacenterName, period);

    // Log audit event
    await AuditLog.logInfo({
      event: 'ORCHESTRATOR_ANALYSIS_COMPLETED',
      details: {
        datacenterName,
        period,
        vendorCount: result.vendors_summary?.vendors?.length || 0,
        totalAnomalies:
          (result.vendors_summary?.vendors?.reduce((sum, v) => sum + (v.anomalies?.length || 0), 0) || 0) +
          (result.staff_summary?.staff?.scope1?.anomalies?.length || 0) +
          (result.staff_summary?.staff?.scope2?.anomalies?.length || 0),
        reportHash: result.cryptographic_proofs?.report_hash || null,
        merkleRoot: result.cryptographic_proofs?.evidence_merkle_root || null,
        masumiTransactionCount: result.masumi_transactions?.length || 0,
      },
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
      entityId: result.datacenter || datacenterName,
    }).catch((err) => console.error('Audit log error:', err));

    // Result already includes cryptographic_proofs and masumi_transactions
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Orchestrator analysis error:', error);

    // Log error
    await AuditLog.logError({
      event: 'ORCHESTRATOR_ANALYSIS_FAILED',
      error: error.message,
      details: {
        datacenterName: req.body.datacenterName,
        period: req.body.period,
      },
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
    }).catch((err) => console.error('Audit log error:', err));

    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
    });
  }
};

/**
 * Get orchestrator service status
 * GET /api/orchestrator/status
 */
export const getOrchestratorStatus = async (req, res) => {
  try {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasLLM = hasGeminiKey || hasOpenAIKey;
    const masumiEnabled = isMasumiEnabled();
    
    res.json({
      success: true,
      service: 'AI Data Extraction and Analysis Orchestrator',
      architecture: 'Four-Pillar (AI Agents + Integrity + Masumi Blockchain + Master Agent)',
      status: 'operational',
      llm_provider: hasGeminiKey ? 'Gemini' : hasOpenAIKey ? 'OpenAI (Fallback)' : 'None',
      llm_configured: hasLLM,
      llm_model: process.env.GEMINI_MODEL || process.env.LLM_MODEL || 'Not configured',
      masumi_blockchain: {
        enabled: masumiEnabled,
        api_url: process.env.MASUMI_API_URL || 'Not configured',
        network: process.env.MASUMI_NETWORK_ID || 'Not configured',
      },
      agents: {
        vendor_agent: 'available',
        carbon_credits_agent: 'available',
        staff_agent: 'available',
        scope1_agent: 'available',
        scope2_agent: 'available',
        merkle_agent: 'available',
        master_orchestrator: 'available',
      },
      pillars: {
        pillar1_ai_agents: 'operational',
        pillar2_integrity_layer: 'operational',
        pillar3_masumi_blockchain: masumiEnabled ? 'operational' : 'disabled',
        pillar4_master_agent: 'operational',
      },
      message: hasLLM 
        ? `All agents are operational and ready for analysis (using ${hasGeminiKey ? 'Gemini' : 'OpenAI'})${masumiEnabled ? ' with Masumi blockchain integration' : ''}`
        : 'LLM not configured. Set GEMINI_API_KEY or OPENAI_API_KEY. Analysis will use fallback methods.',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Status check failed',
      message: error.message,
    });
  }
};

