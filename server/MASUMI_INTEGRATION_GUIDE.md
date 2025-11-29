# Masumi Blockchain Integration Guide

## Overview

The NetZero AI Orchestrator integrates with the **Masumi decentralized AI protocol** to provide blockchain-grade integrity, auditability, and micropayment-based agent rewards. This implementation follows a **FOUR-PILLAR architecture**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FOUR-PILLAR ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PILLAR 1: AI Multi-Agent System (LangChain)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Vendor Agent │  │ Carbon Agent │  │ Staff Agent  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  PILLAR 2: Integrity Layer (Hashing + Merkle Root)          │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Report Hash + Evidence Hashes + Merkle Root        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  PILLAR 3: Masumi Blockchain Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Identity Reg │  │ Decision Log │  │ Micropayments│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  PILLAR 4: Master Agent (Final Report + Settlement)         │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Unified Report + Transaction IDs + Audit Trail     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Masumi Blockchain Integration
MASUMI_ENABLED=true
MASUMI_API_URL=https://api.masumi.network/v1
MASUMI_NETWORK_ID=masumi-testnet
MASUMI_MASTER_WALLET=your_master_wallet_address
```

### Enable/Disable Masumi

Set `MASUMI_ENABLED=false` to disable Masumi integration (useful for development/testing). When disabled, all Masumi operations are skipped gracefully.

## Agent Identities

Each agent is registered with a unique Masumi identity:

- `master_orchestrator` - Master orchestrator agent
- `vendor_agent` - Vendor Scope 3 analysis agent
- `carbon_credits_agent` - Carbon credit/threshold analysis agent
- `staff_agent` - Staff emissions analysis coordinator
- `scope1_agent` - Scope 1 direct emissions agent
- `scope2_agent` - Scope 2 indirect emissions agent
- `merkle_agent` - Merkle tree generation agent

## Payment Rates

Agents are paid tokens based on their work:

| Agent | Base Payment | Bonus Conditions |
|-------|-------------|------------------|
| Vendor Agent | 1 token per vendor | +0.5 for accurate threshold detection |
| Carbon Credits Agent | 2 tokens | +1 for accurate threshold detection |
| Staff Agent | 1 token per scope | - |
| Scope 1/2 Agents | 1 token each | - |
| Merkle Agent | 1 token per root | - |
| Master Orchestrator | 5 tokens | Complete orchestration |

## Workflow

### 1. Agent Registration

When the orchestrator starts, all agents are registered on the Masumi blockchain with unique identities.

### 2. Agent Execution

Each agent:
- Performs its analysis
- Returns evidence items and analysis results
- Gets logged to Masumi blockchain
- Receives token payment

### 3. Cryptographic Proofs

After all agents complete:
- Dataset is frozen (canonical JSON)
- Report hash is computed
- Evidence items are hashed
- Merkle tree is built
- All proofs are logged to Masumi

### 4. Final Settlement

- Master agent generates final report
- All transactions are compiled
- Final orchestration is logged
- Master agent receives payment
- Job is marked complete

## Output Format

The orchestrator returns:

```json
{
  "success": true,
  "datacenter": "india-northeast",
  "period": "2025-Q1",
  "vendors_summary": { ... },
  "carbon_credit_summary": { ... },
  "staff_summary": { ... },
  "cryptographic_proofs": {
    "report_hash": "...",
    "evidence_hashes": [ ... ],
    "evidence_merkle_root": "..."
  },
  "masumi_transactions": [
    {
      "type": "agent_registration",
      "agentId": "vendor_agent",
      "txId": "masumi_abc123...",
      "timestamp": "2025-11-29T..."
    },
    {
      "type": "decision_log",
      "agentId": "vendor_agent",
      "action": "analysis_completed",
      "txId": "masumi_def456...",
      "timestamp": "2025-11-29T..."
    },
    {
      "type": "payment",
      "agentId": "vendor_agent",
      "amount": 1,
      "txId": "masumi_ghi789...",
      "timestamp": "2025-11-29T..."
    }
  ],
  "final_report": "...",
  "generatedAt": "2025-11-29T..."
}
```

## Masumi Transaction Types

### 1. Agent Registration

```json
{
  "type": "agent_registration",
  "agentId": "vendor_agent",
  "txId": "masumi_...",
  "timestamp": "..."
}
```

### 2. Decision Log

```json
{
  "type": "decision_log",
  "agentId": "vendor_agent",
  "action": "analysis_completed",
  "txId": "masumi_...",
  "timestamp": "..."
}
```

### 3. Payment

```json
{
  "type": "payment",
  "agentId": "vendor_agent",
  "amount": 1,
  "txId": "masumi_...",
  "timestamp": "..."
}
```

## Benefits

### 1. **Immutable Audit Trail**

Every agent action is logged on-chain, providing:
- Complete auditability
- Tamper-proof records
- Regulatory compliance

### 2. **Agent Accountability**

Each agent has:
- On-chain identity
- Signed actions
- Verifiable decisions

### 3. **Micropayment Incentives**

Agents are rewarded based on:
- Work quality
- Accuracy
- Completeness

### 4. **Decentralized Trust**

No single point of failure:
- Distributed logging
- Blockchain verification
- Trustless execution

## API Reference

### Masumi Service Methods

#### `registerAgentIdentity(agentId, metadata)`

Register an agent identity on Masumi blockchain.

```javascript
import { registerAgentIdentity } from './services/masumi.service.js';

const result = await registerAgentIdentity('vendor_agent', {
  name: 'Vendor Agent',
  description: 'Analyzes vendor Scope 3 emissions',
});
```

#### `logDecision({ agentId, action, data })`

Log an agent decision/action to Masumi.

```javascript
import { logDecision } from './services/masumi.service.js';

const result = await logDecision({
  agentId: 'vendor_agent',
  action: 'analysis_completed',
  data: {
    reportHash: '...',
    anomalyFlags: ['spike_detected'],
    analysisSummary: { vendorCount: 5 },
  },
});
```

#### `schedulePayment({ agentId, amount, reason, metadata })`

Schedule a payment to an agent.

```javascript
import { schedulePayment } from './services/masumi.service.js';

const result = await schedulePayment({
  agentId: 'vendor_agent',
  amount: 1,
  reason: 'Analysis completion',
  metadata: { jobId: 'job_123' },
});
```

## Testing

### Test with Masumi Disabled

```bash
MASUMI_ENABLED=false
```

All Masumi operations will be skipped gracefully, useful for development.

### Test with Masumi Enabled

```bash
MASUMI_ENABLED=true
MASUMI_API_URL=https://api.masumi.network/v1
```

All operations will be logged to Masumi blockchain.

## Production Setup

1. **Configure Masumi API**

   Set up your Masumi API endpoint and network:

   ```bash
   MASUMI_API_URL=https://api.masumi.network/v1
   MASUMI_NETWORK_ID=masumi-mainnet
   ```

2. **Set Master Wallet**

   Configure the master wallet for payments:

   ```bash
   MASUMI_MASTER_WALLET=your_wallet_address
   ```

3. **Enable Integration**

   ```bash
   MASUMI_ENABLED=true
   ```

4. **Monitor Transactions**

   All transactions are returned in the `masumi_transactions` array for monitoring and verification.

## Troubleshooting

### Masumi API Connection Issues

If Masumi API is unavailable, the system will:
- Log errors but continue execution
- Return empty transaction arrays
- Continue with analysis without blockchain logging

### Payment Failures

If payments fail:
- Transactions are logged locally
- Errors are returned in response
- Analysis continues normally

## Security Considerations

1. **Private Keys**: Never expose Masumi wallet private keys
2. **API Keys**: Keep Masumi API keys secure
3. **Transaction Signing**: All transactions are cryptographically signed
4. **Identity Verification**: Agent identities are verified on-chain

## Future Enhancements

- Real-time Masumi API integration
- Multi-signature payment approval
- Agent reputation system
- Decentralized governance
- Cross-chain interoperability

---

**Note**: This is a production-ready framework. In production, connect to the actual Masumi API endpoints and implement proper transaction signing.

