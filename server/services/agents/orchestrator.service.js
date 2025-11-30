/**
 * Master AI Data Extraction and Analysis Orchestrator
 * Implements FOUR-PILLAR architecture:
 * 
 * PILLAR 1 - AI Multi-Agent System (LangChain)
 * PILLAR 2 - Integrity Layer (Hashing + Merkle Root)
 * PILLAR 3 - Masumi Blockchain Layer
 * PILLAR 4 - Master Agent (Final Report + Settlement)
 */

import { vendorAgent } from './vendorAgent.js';
import { carbonCreditsAgent } from './carbonCreditsAgent.js';
import { staffAgent } from './staffAgent.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getGeminiLLM } from '../../utils/llm.js';
import DataCenter from '../../models/DataCenter.js';
import { freezeDataAndGenerateProofs } from '../dataFreeze.service.js';
import {
  registerAgentIdentity,
  logDecision,
  schedulePayment,
  calculatePayment,
  getAgentIdentities,
  isMasumiEnabled,
} from '../masumi.service.js';
import { uploadToIPFS } from '../ipfs.service.js';
import { emitOrchestratorEvent } from '../orchestratorEvents.js';
import LedgerEvent from '../../models/LedgerEvent.js';

/**
 * Master Orchestrator - Coordinates all agents and produces unified report
 * Implements the complete four-pillar architecture
 * 
 * @param {string} datacenterName - Name of the datacenter
 * @param {string} period - Period in format "Q1 2025" or "2025-Q1"
 * @returns {Promise<Object>} Unified analysis report with all pillars integrated
 */
export const orchestrateAnalysis = async (datacenterName, period) => {
  const masumiTransactions = [];
  const jobId = `job_${Date.now()}_${datacenterName}_${period}`;

  try {
    console.log(`🎯 [PILLAR 1] Orchestrating analysis for: ${datacenterName}, Period: ${period}`);
    console.log(`📋 Job ID: ${jobId}`);
    emitOrchestratorEvent({
      level: 'info',
      stage: 'start',
      jobId,
      datacenter: datacenterName,
      period,
      message: `Starting orchestrator for ${datacenterName} @ ${period}`,
    });

    // ===========================================================
    // PILLAR 1 — AI MULTI-AGENT SYSTEM (LANGCHAIN)
    // ===========================================================

    // Normalize period format
    const normalizedPeriod = normalizePeriod(period);

    // Find datacenter
    const datacenter = await DataCenter.findOne({ name: datacenterName });
    if (!datacenter) {
      throw new Error(`Datacenter "${datacenterName}" not found`);
    }

    const facilityId = datacenter._id.toString();

    // ===========================================================
    // PILLAR 3 — MASUMI: Register Master Orchestrator Identity
    // ===========================================================
    const agentIds = getAgentIdentities();
    const masumiEnabled = isMasumiEnabled();
    console.log(`🌐 [PILLAR 3] Masumi blockchain integration: ${masumiEnabled ? 'ENABLED' : 'DISABLED'}`);
    if (masumiEnabled) {
      console.log(`   API URL: ${process.env.MASUMI_API_URL || 'Default'}`);
      console.log(`   Network: ${process.env.MASUMI_NETWORK_ID || 'Default'}`);
      console.log(`   Registering master orchestrator...`);
      const masterRegistration = await registerAgentIdentity(agentIds.MASTER_ORCHESTRATOR, {
        name: 'Master Orchestrator',
        description: 'NetZero AI Orchestrator - Coordinates all analysis agents',
        capabilities: ['orchestration', 'report_generation', 'payment_settlement'],
      });
      console.log(`   Registration result:`, { registered: masterRegistration.registered, txId: masterRegistration.txId });
      if (masterRegistration.txId) {
        masumiTransactions.push({
          type: 'agent_registration',
          agentId: agentIds.MASTER_ORCHESTRATOR,
          txId: masterRegistration.txId,
          timestamp: masterRegistration.timestamp,
        });
        console.log(`   ✅ Master orchestrator registered (TX: ${masterRegistration.txId})`);
      } else {
        console.warn(`   ⚠️  Master orchestrator registration failed:`, masterRegistration.reason || masterRegistration.error);
      }
    } else {
      console.log(`   ℹ️  Masumi is disabled. Set MASUMI_ENABLED=true in .env to enable.`);
    }

    // Trigger all agents in parallel for efficiency
    console.log('🚀 [PILLAR 1] Triggering specialized agents...');
    emitOrchestratorEvent({
      level: 'info',
      stage: 'agents_start',
      jobId,
      message: 'Launching vendor, carbon credits, and staff agents',
    });

    // Execute agents and collect evidence/hashes
    const [vendorsResult, carbonCreditsResult, staffResult] = await Promise.all([
      executeAgentWithMasumi(
        'Vendor Agent',
        agentIds.VENDOR_AGENT,
        () => vendorAgent(datacenterName, facilityId, normalizedPeriod),
        { datacenter: datacenterName, period: normalizedPeriod },
        masumiTransactions,
        jobId,
      ),
      executeAgentWithMasumi(
        'Carbon Credits Agent',
        agentIds.CARBON_CREDITS_AGENT,
        () => carbonCreditsAgent(datacenterName, facilityId, normalizedPeriod),
        { datacenter: datacenterName, period: normalizedPeriod },
        masumiTransactions,
        jobId,
      ),
      executeAgentWithMasumi(
        'Staff Agent',
        agentIds.STAFF_AGENT,
        () => staffAgent(datacenterName, facilityId, normalizedPeriod),
        { datacenter: datacenterName, period: normalizedPeriod },
        masumiTransactions,
        jobId,
      ),
    ]);

    console.log('✅ [PILLAR 1] All agents completed');
    emitOrchestratorEvent({
      level: 'success',
      stage: 'agents_complete',
      jobId,
      message: 'All agents completed successfully',
    });

    // Collect all evidence items and hashes from agents
    const allEvidenceItems = [];
    const allEvidenceHashes = [];

    // Extract evidence from vendor agent
    if (vendorsResult.vendors && Array.isArray(vendorsResult.vendors)) {
      vendorsResult.vendors.forEach((vendor) => {
        const evidence = {
          type: 'vendor_scope3',
          vendor: vendor.name || vendor.email,
          scope3_comparison: vendor.scope3_comparison,
          anomalies: vendor.anomalies || [],
        };
        allEvidenceItems.push(evidence);
      });
    }

    // Extract evidence from carbon credits agent
    if (carbonCreditsResult.carbon_credits) {
      allEvidenceItems.push({
        type: 'carbon_credits',
        ...carbonCreditsResult.carbon_credits,
      });
    }

    // Extract evidence from staff agent
    if (staffResult.staff) {
      if (staffResult.staff.scope1) {
        allEvidenceItems.push({
          type: 'staff_scope1',
          ...staffResult.staff.scope1,
        });
      }
      if (staffResult.staff.scope2) {
        allEvidenceItems.push({
          type: 'staff_scope2',
          ...staffResult.staff.scope2,
        });
      }
    }

    // ===========================================================
    // PILLAR 2 — INTEGRITY LAYER (HASHING + MERKLE ROOT)
    // ===========================================================

    console.log('🔒 [PILLAR 2] Freezing dataset and generating cryptographic proofs...');
    emitOrchestratorEvent({
      level: 'info',
      stage: 'integrity',
      jobId,
      message: 'Freezing dataset and generating cryptographic proofs',
    });

    // Combine all agent results for freezing
    const combinedResult = {
      success: true,
      datacenter: datacenterName,
      period: normalizedPeriod,
      vendors_summary: vendorsResult,
      carbon_credit_summary: carbonCreditsResult,
      staff_summary: staffResult,
      generatedAt: new Date().toISOString(),
    };

    // Freeze data and generate proofs
    const cryptographicProofs = freezeDataAndGenerateProofs(combinedResult);

    console.log('✅ [PILLAR 2] Cryptographic proofs generated:');
    console.log(`   Report Hash: ${cryptographicProofs.report_hash.substring(0, 16)}...`);
    console.log(`   Evidence Items: ${cryptographicProofs.evidence_hashes.length}`);
    console.log(`   Merkle Root: ${cryptographicProofs.evidence_merkle_root.substring(0, 16)}...`);
    emitOrchestratorEvent({
      level: 'success',
      stage: 'integrity_complete',
      jobId,
      message: 'Cryptographic proofs generated',
      reportHash: cryptographicProofs.report_hash,
      merkleRoot: cryptographicProofs.evidence_merkle_root,
      evidenceCount: cryptographicProofs.evidence_hashes.length,
    });

    // Log Merkle agent completion to Masumi
    if (isMasumiEnabled()) {
      const merkleLog = await logDecision({
        agentId: agentIds.MERKLE_AGENT,
        action: 'merkle_root_generated',
        data: {
          reportHash: cryptographicProofs.report_hash,
          evidenceMerkleRoot: cryptographicProofs.evidence_merkle_root,
          evidenceCount: cryptographicProofs.evidence_hashes.length,
          period: normalizedPeriod,
          datacenter: datacenterName,
        },
      });
      if (merkleLog.txId) {
        masumiTransactions.push({
          type: 'decision_log',
          agentId: agentIds.MERKLE_AGENT,
          action: 'merkle_root_generated',
          txId: merkleLog.txId,
          timestamp: merkleLog.timestamp,
        });
      }

      // Pay Merkle agent
      const merklePayment = await schedulePayment({
        agentId: agentIds.MERKLE_AGENT,
        amount: calculatePayment(agentIds.MERKLE_AGENT, { merkleRoot: cryptographicProofs.evidence_merkle_root }),
        reason: 'Merkle root generation',
        metadata: {
          jobId,
          reportHash: cryptographicProofs.report_hash,
          evidenceCount: cryptographicProofs.evidence_hashes.length,
        },
      });
      if (merklePayment.txId) {
        masumiTransactions.push({
          type: 'payment',
          agentId: agentIds.MERKLE_AGENT,
          amount: merklePayment.amount,
          txId: merklePayment.txId,
          timestamp: merklePayment.timestamp,
        });
      }
    }

    // ===========================================================
    // PILLAR 4 — MASTER AGENT (FINAL REPORT + SETTLEMENT)
    // ===========================================================

    console.log('📄 [PILLAR 4] Generating final report...');
    emitOrchestratorEvent({
      level: 'info',
      stage: 'report_generation',
      jobId,
      message: 'Generating unified report',
    });

    // Generate unified summary using AI
    const unifiedReport = await generateUnifiedReport({
      vendors: vendorsResult,
      carbonCredits: carbonCreditsResult,
      staff: staffResult,
      datacenterName,
      period: normalizedPeriod,
      reportHash: cryptographicProofs.report_hash,
      merkleRoot: cryptographicProofs.evidence_merkle_root,
    });

    // Count total anomalies
    const totalAnomalies =
      (vendorsResult.vendors?.reduce((sum, v) => sum + (v.anomalies?.length || 0), 0) || 0) +
      (staffResult.staff?.scope1?.anomalies?.length || 0) +
      (staffResult.staff?.scope2?.anomalies?.length || 0);

    // Log final orchestration completion
    if (isMasumiEnabled()) {
      const finalLog = await logDecision({
        agentId: agentIds.MASTER_ORCHESTRATOR,
        action: 'orchestration_completed',
        data: {
          reportHash: cryptographicProofs.report_hash,
          evidenceMerkleRoot: cryptographicProofs.evidence_merkle_root,
          anomalyFlags: totalAnomalies > 0 ? ['anomalies_detected'] : [],
          analysisSummary: {
            vendorCount: vendorsResult.vendors?.length || 0,
            totalAnomalies,
            complianceStatus: carbonCreditsResult.carbon_credits?.compliance_status || 'unknown',
          },
          period: normalizedPeriod,
          datacenter: datacenterName,
          jobId,
        },
      });
      if (finalLog.txId) {
        masumiTransactions.push({
          type: 'decision_log',
          agentId: agentIds.MASTER_ORCHESTRATOR,
          action: 'orchestration_completed',
          txId: finalLog.txId,
          timestamp: finalLog.timestamp,
        });
      }

      // Pay master orchestrator
      const masterPayment = await schedulePayment({
        agentId: agentIds.MASTER_ORCHESTRATOR,
        amount: calculatePayment(agentIds.MASTER_ORCHESTRATOR, {}),
        reason: 'Complete orchestration and report generation',
        metadata: {
          jobId,
          reportHash: cryptographicProofs.report_hash,
          totalAnomalies,
        },
      });
      if (masterPayment.txId) {
        masumiTransactions.push({
          type: 'payment',
          agentId: agentIds.MASTER_ORCHESTRATOR,
          amount: masterPayment.amount,
          txId: masterPayment.txId,
          timestamp: masterPayment.timestamp,
        });
      }
    }

    console.log('✅ [PILLAR 4] Final report generated and settlement completed');
    console.log(`📊 Total Masumi transactions: ${masumiTransactions.length}`);
    emitOrchestratorEvent({
      level: 'success',
      stage: 'complete',
      jobId,
      message: 'Orchestration completed with final report',
      masumiTransactions: masumiTransactions.length,
      datacenter: datacenterName,
      period: normalizedPeriod,
    });
    try {
      await LedgerEvent.create({
        type: 'ORCHESTRATOR_COMPLETED',
        datacenter: datacenterName,
        period: normalizedPeriod,
        detail: 'Orchestrator finished and report generated',
        payload: {
          reportHash: cryptographicProofs.report_hash,
          merkleRoot: cryptographicProofs.evidence_merkle_root,
          masumiTxCount: masumiTransactions.length,
        },
        timestamp: new Date(),
      });
      const txEvents = (masumiTransactions || []).slice(0, 50).map((tx) => ({
        type: 'ORCHESTRATOR_TX',
        datacenter: datacenterName,
        period: normalizedPeriod,
        agentId: tx.agentId,
        txId: tx.txId,
        detail: `${tx.type} ${tx.action || ''}`.trim(),
        payload: tx,
        timestamp: tx.timestamp || new Date(),
      }));
      if (txEvents.length) {
        await LedgerEvent.insertMany(txEvents);
      }
    } catch (ledgerErr) {
      console.warn('Ledger logging failed:', ledgerErr.message);
    }

    // ===========================================================
    // IPFS UPLOAD - Final Report Bundle & Evidence Package
    // ===========================================================
    
    let ipfsLinks = {};
    
    try {
      // Prepare final report bundle (complete response without IPFS links)
      const reportBundle = {
        success: true,
        datacenter: datacenterName,
        period: normalizedPeriod,
        vendors_summary: vendorsResult,
        carbon_credit_summary: carbonCreditsResult,
        staff_summary: staffResult,
        cryptographic_proofs: cryptographicProofs,
        masumi_transactions: masumiTransactions,
        final_report: unifiedReport,
        generatedAt: new Date().toISOString(),
      };
      
      // Upload report bundle to IPFS
      console.log('📤 [IPFS] Uploading final report bundle to IPFS...');
      const reportBundleBuffer = Buffer.from(JSON.stringify(reportBundle, null, 2), 'utf-8');
      const reportBundleUpload = await uploadToIPFS(
        reportBundleBuffer,
        `netzero-report-${datacenterName}-${normalizedPeriod}-${Date.now()}.json`
      ).catch(err => {
        console.warn('⚠️  Report bundle IPFS upload failed:', err.message);
        return null;
      });
      
      if (reportBundleUpload) {
        ipfsLinks.report_bundle = reportBundleUpload.ipfsUrl;
        ipfsLinks.gateway_urls = ipfsLinks.gateway_urls || {};
        ipfsLinks.gateway_urls.report = reportBundleUpload.gatewayUrl;
        console.log(`✅ [IPFS] Report bundle uploaded: ${reportBundleUpload.cid}`);
      }
      
      // Upload evidence package (all evidence items)
      console.log('📤 [IPFS] Uploading evidence package to IPFS...');
      const evidencePackage = {
        datacenter: datacenterName,
        period: normalizedPeriod,
        evidence_items: allEvidenceItems,
        evidence_hashes: cryptographicProofs.evidence_hashes,
        evidence_merkle_root: cryptographicProofs.evidence_merkle_root,
        generatedAt: new Date().toISOString(),
      };
      
      const evidenceBuffer = Buffer.from(JSON.stringify(evidencePackage, null, 2), 'utf-8');
      const evidenceUpload = await uploadToIPFS(
        evidenceBuffer,
        `netzero-evidence-${datacenterName}-${normalizedPeriod}-${Date.now()}.json`
      ).catch(err => {
        console.warn('⚠️  Evidence package IPFS upload failed:', err.message);
        return null;
      });
      
      if (evidenceUpload) {
        ipfsLinks.evidence_package = evidenceUpload.ipfsUrl;
        ipfsLinks.gateway_urls = ipfsLinks.gateway_urls || {};
        ipfsLinks.gateway_urls.evidence = evidenceUpload.gatewayUrl;
        console.log(`✅ [IPFS] Evidence package uploaded: ${evidenceUpload.cid}`);
      }
    } catch (ipfsError) {
      console.warn('⚠️  IPFS uploads failed (non-critical):', ipfsError.message);
      // Continue without IPFS links - not critical for core functionality
    }

    // ===========================================================
    // UI PAYLOAD GENERATION - Format data for React frontend
    // ===========================================================
    
    const uiPayload = generateUIPayload({
      vendorsResult,
      carbonCreditsResult,
      staffResult,
      cryptographicProofs,
      masumiTransactions,
      datacenterName,
      normalizedPeriod,
    });

    // ===========================================================
    // ANOMALIES SUMMARY
    // ===========================================================
    
    const anomalies = [];
    
    // Collect vendor anomalies
    if (vendorsResult.vendors) {
      vendorsResult.vendors.forEach(vendor => {
        if (vendor.anomalies && vendor.anomalies.length > 0) {
          vendor.anomalies.forEach(anomaly => {
            anomalies.push({
              type: anomaly.type,
              reason: anomaly.reason,
              agent: 'vendor_agent',
              vendor: vendor.name || vendor.email,
              severity: anomaly.severity || 'medium',
            });
          });
        }
      });
    }
    
    // Collect staff anomalies
    if (staffResult.staff?.scope1?.anomalies) {
      staffResult.staff.scope1.anomalies.forEach(anomaly => {
        anomalies.push({
          type: anomaly.type,
          reason: anomaly.reason,
          agent: 'staff_scope1_agent',
          scope: 'scope1',
          severity: anomaly.severity || 'medium',
        });
      });
    }
    
    if (staffResult.staff?.scope2?.anomalies) {
      staffResult.staff.scope2.anomalies.forEach(anomaly => {
        anomalies.push({
          type: anomaly.type,
          reason: anomaly.reason,
          agent: 'staff_scope2_agent',
          scope: 'scope2',
          severity: anomaly.severity || 'medium',
        });
      });
    }

    // ===========================================================
    // EXPECTED FINAL OUTPUT - Full Specification Format
    // ===========================================================

    return {
      status: 'success',
      success: true,
      jobId: jobId,
      datacenter: datacenterName,
      period: normalizedPeriod,
      vendors_summary: vendorsResult,
      carbon_credit_summary: carbonCreditsResult,
      staff_summary: staffResult,
      anomalies: anomalies,
      cryptographic_proofs: cryptographicProofs,
      ipfs_links: Object.keys(ipfsLinks).length > 0 ? ipfsLinks : undefined,
      masumi_transactions: masumiTransactions,
      final_report: unifiedReport,
      ui_payload: uiPayload,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Orchestration error:', error);
    emitOrchestratorEvent({
      level: 'error',
      stage: 'error',
      jobId,
      message: error.message,
      datacenter: datacenterName,
      period: normalizePeriod(period),
    });

    // Log error to Masumi
    if (isMasumiEnabled()) {
      await logDecision({
        agentId: getAgentIdentities().MASTER_ORCHESTRATOR,
        action: 'orchestration_failed',
        data: {
          error: error.message,
          datacenter: datacenterName,
          period: normalizePeriod(period),
          jobId,
        },
      });
    }

    throw new Error(`Orchestration failed: ${error.message}`);
  }
};

/**
 * Execute an agent with Masumi logging and payment
 */
const executeAgentWithMasumi = async (
  agentName,
  agentId,
  agentFunction,
  context,
  masumiTransactions,
  jobId,
) => {
  const startTime = Date.now();

  try {
    console.log(`  → Executing ${agentName}...`);

    // Register agent identity (if not already registered)
    if (isMasumiEnabled()) {
      await registerAgentIdentity(agentId, {
        name: agentName,
        description: `NetZero ${agentName}`,
      });
    }

    // Execute agent
    const result = await agentFunction();

    const executionTime = Date.now() - startTime;

    // Log agent completion to Masumi
    if (isMasumiEnabled()) {
      const anomalyFlags = [];
      if (result.vendors) {
        result.vendors.forEach((v) => {
          if (v.anomalies && v.anomalies.length > 0) {
            anomalyFlags.push(`vendor_${v.name || v.email}_anomalies`);
          }
        });
      }

      const logEntry = await logDecision({
        agentId,
        action: 'analysis_completed',
        data: {
          period: context.period,
          datacenter: context.datacenter,
          executionTime,
          anomalyFlags,
          analysisSummary: {
            vendorCount: result.vendors?.length || 0,
            anomalyCount: result.vendors?.reduce((sum, v) => sum + (v.anomalies?.length || 0), 0) || 0,
          },
        },
      });

      if (logEntry.txId) {
        masumiTransactions.push({
          type: 'decision_log',
          agentId,
          action: 'analysis_completed',
          txId: logEntry.txId,
          timestamp: logEntry.timestamp,
        });
      }

      // Calculate and schedule payment
      const paymentAmount = calculatePayment(agentId, {
        vendorCount: result.vendors?.length || 0,
        accuracy: result.carbon_credits?.compliance_status === 'COMPLIANT',
      });

      const payment = await schedulePayment({
        agentId,
        amount: paymentAmount,
        reason: `${agentName} analysis completion`,
        metadata: {
          jobId,
          executionTime,
        },
      });

      if (payment.txId) {
        masumiTransactions.push({
          type: 'payment',
          agentId,
          amount: payment.amount,
          txId: payment.txId,
          timestamp: payment.timestamp,
        });
      }
    }

    console.log(`  ✅ ${agentName} completed (${executionTime}ms)`);
    return result;
  } catch (error) {
    console.error(`  ❌ ${agentName} failed:`, error.message);

    // Log error to Masumi
    if (isMasumiEnabled()) {
      await logDecision({
        agentId,
        action: 'analysis_failed',
        data: {
          error: error.message,
          period: context.period,
          datacenter: context.datacenter,
        },
      });
    }

    throw error;
  }
};

/**
 * Generate unified human-readable report from all agent outputs
 */
const generateUnifiedReport = async ({
  vendors,
  carbonCredits,
  staff,
  datacenterName,
  period,
  reportHash,
  merkleRoot,
}) => {
  const llm = getGeminiLLM({ temperature: 0.2 });

  if (!llm) {
    return generateManualReport({ vendors, carbonCredits, staff, datacenterName, period, reportHash, merkleRoot });
  }

  try {
    const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert ESG compliance analyst. Generate a comprehensive, human-readable analysis report based on the following emissions data analysis.

**Context:**
- Datacenter: {datacenterName}
- Period: {period}
- Report Hash: {reportHash}
- Merkle Root: {merkleRoot}

**Agent Results:**

1. **Vendor Analysis:**
{vendorsJson}

2. **Carbon Credits Analysis:**
{carbonCreditsJson}

3. **Staff Emissions Analysis:**
{staffJson}

**Instructions:**
Create a comprehensive report that includes:
1. **Executive Summary** - Brief overview of key findings
2. **Vendor Insights** - Summary of vendor emissions, anomalies, and trends
3. **Staff Emissions Evaluation** - Analysis of Scope 1 and Scope 2 emissions
4. **Carbon Credit Positioning** - Current status vs legal thresholds
5. **Risks & Recommendations** - Identified risks and actionable recommendations
6. **Integrity Verification** - Mention the cryptographic proofs (report hash and Merkle root) for auditability

Write in clear, professional business language. Be specific about anomalies, trends, and actionable insights.

Return ONLY the report text (no JSON, no code blocks, just the report).
`);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const report = await chain.invoke({
      datacenterName,
      period,
      reportHash: reportHash?.substring(0, 16) + '...',
      merkleRoot: merkleRoot?.substring(0, 16) + '...',
      vendorsJson: JSON.stringify(vendors, null, 2),
      carbonCreditsJson: JSON.stringify(carbonCredits, null, 2),
      staffJson: JSON.stringify(staff, null, 2),
    });

    return report.trim();
  } catch (error) {
    console.error('AI report generation failed, using fallback:', error.message);
    return generateManualReport({ vendors, carbonCredits, staff, datacenterName, period, reportHash, merkleRoot });
  }
};

/**
 * Fallback manual report generation when AI is unavailable
 */
const generateManualReport = ({ vendors, carbonCredits, staff, datacenterName, period, reportHash, merkleRoot }) => {
  const vendorCount = vendors.vendors?.length || 0;
  const anomalyCount = vendors.vendors?.reduce((sum, v) => sum + (v.anomalies?.length || 0), 0) || 0;
  const totalScope3 = vendors.vendors?.reduce((sum, v) => {
    const current = parseFloat(v.scope3_comparison?.current_quarter) || 0;
    return sum + current;
  }, 0) || 0;

  return `
# Emissions Analysis Report
**Datacenter:** ${datacenterName}
**Period:** ${period}
**Generated:** ${new Date().toLocaleString()}
**Report Hash:** ${reportHash?.substring(0, 32)}...
**Merkle Root:** ${merkleRoot?.substring(0, 32)}...

## Executive Summary
This report analyzes emissions data for ${datacenterName} during ${period}. The analysis covers vendor Scope 3 emissions, staff Scope 1 and Scope 2 emissions, and carbon credit positioning. All data has been cryptographically frozen with blockchain-grade integrity guarantees.

## Vendor Insights
- **Total Vendors Analyzed:** ${vendorCount}
- **Total Anomalies Detected:** ${anomalyCount}
- **Total Scope 3 Emissions:** ${totalScope3.toFixed(2)} tCO2e

${vendorCount > 0
    ? vendors.vendors
        .map(
          (v) => `
### ${v.name || 'Unknown Vendor'}
- Current Quarter: ${v.scope3_comparison?.current_quarter || 'N/A'}
- Previous Quarter: ${v.scope3_comparison?.previous_quarter || 'N/A'}
- Anomalies: ${v.anomalies?.length || 0}
${v.anomalies?.map((a) => `  - ${a.type}: ${a.reason}`).join('\n') || '  - None'}
`,
        )
        .join('\n')
    : 'No vendor data available.'}

## Staff Emissions Evaluation
- **Scope 1 Emissions:** ${staff.staff?.scope1?.total_co2e || 'N/A'} tCO2e
- **Scope 2 Emissions:** ${staff.staff?.scope2?.total_co2e || 'N/A'} tCO2e
- **Scope 1 Anomalies:** ${staff.staff?.scope1?.anomalies?.length || 0}
- **Scope 2 Anomalies:** ${staff.staff?.scope2?.anomalies?.length || 0}

## Carbon Credit Positioning
- **Country:** ${carbonCredits.carbon_credits?.country || 'N/A'}
- **Current Emissions:** ${carbonCredits.carbon_credits?.current_emission || 'N/A'}
- **Legal Threshold:** ${carbonCredits.carbon_credits?.latest_threshold || 'N/A'}
- **Credit Score:** ${carbonCredits.carbon_credits?.credit_score || 'N/A'}

## Integrity Verification
This report has been cryptographically frozen and verified:
- **Report Hash:** ${reportHash?.substring(0, 16)}... (Full hash available for verification)
- **Merkle Root:** ${merkleRoot?.substring(0, 16)}... (Evidence integrity proof)
- All evidence items have been hashed and included in the Merkle tree
- This report is tamper-proof and auditable on the Masumi blockchain

## Risks & Recommendations
Based on the analysis:
1. Monitor vendors with detected anomalies closely
2. Review staff emissions patterns for unusual increases
3. Ensure compliance with carbon credit thresholds
4. Consider implementing corrective actions for identified anomalies

---
*Report generated automatically. All agent actions and cryptographic proofs have been logged to the Masumi blockchain for immutable auditability.*
  `.trim();
};

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
 * Generate UI-ready payload for React frontend components
 * Formats data for charts, timelines, tables, and visualizations
 */
const generateUIPayload = ({
  vendorsResult,
  carbonCreditsResult,
  staffResult,
  cryptographicProofs,
  masumiTransactions,
  datacenterName,
  normalizedPeriod,
}) => {
  // Charts data for emissions visualization
  const charts = {
    emissions_by_scope: {
      scope1: parseFloat(staffResult.staff?.scope1?.total_co2e) || 0,
      scope2: parseFloat(staffResult.staff?.scope2?.total_co2e) || 0,
      scope3: parseFloat(vendorsResult.summary?.total_scope3) || 0,
      total: (parseFloat(staffResult.staff?.scope1?.total_co2e) || 0) +
             (parseFloat(staffResult.staff?.scope2?.total_co2e) || 0) +
             (parseFloat(vendorsResult.summary?.total_scope3) || 0),
    },
    vendor_comparison: vendorsResult.vendors?.map(vendor => ({
      name: vendor.name || vendor.email,
      current: parseFloat(vendor.scope3_comparison?.current_quarter) || 0,
      previous: parseFloat(vendor.scope3_comparison?.previous_quarter) || 0,
      anomalies: vendor.anomalies?.length || 0,
    })) || [],
    anomaly_timeline: [],
    compliance_status: {
      carbon_credits: carbonCreditsResult.carbon_credits?.compliance_status || 'unknown',
      credit_score: carbonCreditsResult.carbon_credits?.credit_score || 'unknown',
      threshold: carbonCreditsResult.carbon_credits?.latest_threshold || 'N/A',
    },
  };

  // Timeline data for blockchain visualization
  const timeline = masumiTransactions.map(tx => ({
    timestamp: tx.timestamp,
    event: tx.type,
    agent: tx.agentId,
    txId: tx.txId,
    amount: tx.amount || null,
    action: tx.action || null,
  }));

  // Block visualization data (grouped by agent)
  const blocks = [];
  const agentGroups = {};
  
  masumiTransactions.forEach(tx => {
    if (!agentGroups[tx.agentId]) {
      agentGroups[tx.agentId] = {
        agentId: tx.agentId,
        transactions: [],
      };
    }
    agentGroups[tx.agentId].transactions.push({
      type: tx.type,
      txId: tx.txId,
      timestamp: tx.timestamp,
      amount: tx.amount,
    });
  });
  
  Object.values(agentGroups).forEach(group => {
    blocks.push({
      hash: cryptographicProofs.evidence_merkle_root,
      parent: null,
      timestamp: group.transactions[0]?.timestamp,
      agent: group.agentId,
      transactions: group.transactions,
    });
  });

  // Table data for React components
  const tables = {
    vendors: vendorsResult.vendors?.map(vendor => ({
      name: vendor.name || vendor.email,
      email: vendor.email,
      scope3_current: vendor.scope3_comparison?.current_quarter || 'N/A',
      scope3_previous: vendor.scope3_comparison?.previous_quarter || 'N/A',
      anomalies_count: vendor.anomalies?.length || 0,
      anomalies: vendor.anomalies || [],
      status: vendor.status || 'pending',
      attested: vendor.attested || false,
    })) || [],
    emissions: [
      {
        scope: 'Scope 1',
        total_co2e: parseFloat(staffResult.staff?.scope1?.total_co2e) || 0,
        anomalies: staffResult.staff?.scope1?.anomalies?.length || 0,
        comparison: staffResult.staff?.scope1?.comparison || {},
      },
      {
        scope: 'Scope 2',
        total_co2e: parseFloat(staffResult.staff?.scope2?.total_co2e) || 0,
        anomalies: staffResult.staff?.scope2?.anomalies?.length || 0,
        comparison: staffResult.staff?.scope2?.comparison || {},
      },
      {
        scope: 'Scope 3',
        total_co2e: parseFloat(vendorsResult.summary?.total_scope3) || 0,
        anomalies: vendorsResult.summary?.total_anomalies || 0,
        comparison: {},
      },
    ],
    anomalies: [],
  };

  // Populate anomalies table
  vendorsResult.vendors?.forEach(vendor => {
    vendor.anomalies?.forEach(anomaly => {
      tables.anomalies.push({
        type: anomaly.type,
        reason: anomaly.reason,
        agent: 'vendor_agent',
        vendor: vendor.name || vendor.email,
        severity: anomaly.severity || 'medium',
        timestamp: new Date().toISOString(),
      });
    });
  });

  staffResult.staff?.scope1?.anomalies?.forEach(anomaly => {
    tables.anomalies.push({
      type: anomaly.type,
      reason: anomaly.reason,
      agent: 'staff_scope1_agent',
      scope: 'scope1',
      severity: anomaly.severity || 'medium',
      timestamp: new Date().toISOString(),
    });
  });

  staffResult.staff?.scope2?.anomalies?.forEach(anomaly => {
    tables.anomalies.push({
      type: anomaly.type,
      reason: anomaly.reason,
      agent: 'staff_scope2_agent',
      scope: 'scope2',
      severity: anomaly.severity || 'medium',
      timestamp: new Date().toISOString(),
    });
  });

  return {
    charts,
    timeline,
    blocks,
    tables,
  };
};
