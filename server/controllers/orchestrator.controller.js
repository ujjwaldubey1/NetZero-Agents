/**
 * Orchestrator Controller
 * Handles API requests for the master AI orchestrator
 */

import { orchestrateAnalysis } from '../services/agents/orchestrator.service.js';
import { freezeDataAndGenerateProofs } from '../services/dataFreeze.service.js';
import AuditLog from '../models/AuditLog.js';

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

    // Trigger orchestrator
    const result = await orchestrateAnalysis(datacenterName, period);

    // Freeze data and generate cryptographic proofs
    console.log('🔒 Freezing data and generating cryptographic proofs...');
    let cryptographicProofs = null;
    try {
      cryptographicProofs = freezeDataAndGenerateProofs(result);
      console.log('✅ Cryptographic proofs generated:');
      console.log(`   Report Hash: ${cryptographicProofs.report_hash.substring(0, 16)}...`);
      console.log(`   Evidence Items: ${cryptographicProofs.evidence_hashes.length}`);
      console.log(`   Merkle Root: ${cryptographicProofs.evidence_merkle_root.substring(0, 16)}...`);
    } catch (freezeError) {
      console.error('⚠️  Data freeze failed:', freezeError.message);
      // Continue even if freeze fails - don't block the response
    }

    // Log audit event
    await AuditLog.logInfo({
      event: 'ORCHESTRATOR_ANALYSIS_COMPLETED',
      details: {
        datacenterName,
        period,
        vendorCount: result.vendors_summary?.vendors?.length || 0,
        totalAnomalies: (result.vendors_summary?.vendors?.reduce((sum, v) => sum + (v.anomalies?.length || 0), 0) || 0) +
                       (result.staff_summary?.staff?.scope1?.anomalies?.length || 0) +
                       (result.staff_summary?.staff?.scope2?.anomalies?.length || 0),
        reportHash: cryptographicProofs?.report_hash || null,
        merkleRoot: cryptographicProofs?.evidence_merkle_root || null,
      },
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
      entityId: result.datacenter || datacenterName,
    }).catch((err) => console.error('Audit log error:', err));

    res.status(200).json({
      success: true,
      ...result,
      cryptographic_proofs: cryptographicProofs, // Include cryptographic proofs in response
    });
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
    
    res.json({
      success: true,
      service: 'AI Data Extraction and Analysis Orchestrator',
      status: 'operational',
      llm_provider: hasGeminiKey ? 'Gemini' : hasOpenAIKey ? 'OpenAI (Fallback)' : 'None',
      llm_configured: hasLLM,
      llm_model: process.env.GEMINI_MODEL || process.env.LLM_MODEL || 'Not configured',
      agents: {
        vendor_agent: 'available',
        carbon_credits_agent: 'available',
        staff_agent: 'available',
        scope1_agent: 'available',
        scope2_agent: 'available',
      },
      message: hasLLM 
        ? `All agents are operational and ready for analysis (using ${hasGeminiKey ? 'Gemini' : 'OpenAI'})`
        : 'LLM not configured. Set GEMINI_API_KEY or OPENAI_API_KEY. Analysis will use fallback methods.',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Status check failed',
      message: error.message,
    });
  }
};

