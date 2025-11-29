# NetZero AI Orchestrator - Four-Pillar Architecture

## Overview

The NetZero AI Orchestrator implements a comprehensive **FOUR-PILLAR ARCHITECTURE** that combines AI-powered multi-agent analysis, cryptographic integrity guarantees, blockchain-based auditability, and automated payment settlement.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NETZERO AI ORCHESTRATOR                           │
│                    FOUR-PILLAR ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PILLAR 1: AI MULTI-AGENT SYSTEM (LANGCHAIN)               │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ Vendor Agent │  │ Carbon Agent │  │ Staff Agent  │      │   │
│  │  │              │  │              │  │              │      │   │
│  │  │ Scope 3      │  │ Thresholds   │  │ Scope 1 & 2  │      │   │
│  │  │ Emissions    │  │ Credits      │  │ Emissions    │      │   │
│  │  │ Anomalies    │  │ Compliance   │  │ Anomalies    │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  │         │                  │                  │              │   │
│  │         └──────────────────┼──────────────────┘              │   │
│  │                            │                                 │   │
│  │                    Evidence + Analysis                       │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PILLAR 2: INTEGRITY LAYER (HASHING + MERKLE ROOT)         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  Step A: Freeze Dataset (Canonical JSON)                    │   │
│  │  Step B: Generate Report Hash (SHA-256)                     │   │
│  │  Step C: Hash Each Evidence Item (SHA-256)                  │   │
│  │  Step D: Build Merkle Tree → Evidence Merkle Root           │   │
│  │                                                               │   │
│  │  Result:                                                     │   │
│  │  • report_hash: "<sha256>"                                  │   │
│  │  • evidence_hashes: ["<hash1>", "<hash2>", ...]            │   │
│  │  • evidence_merkle_root: "<root>"                           │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PILLAR 3: MASUMI BLOCKCHAIN LAYER                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ Identity     │  │ Decision     │  │ Micropayment │      │   │
│  │  │ Registration │  │ Logging      │  │ Settlement   │      │   │
│  │  │              │  │              │  │              │      │   │
│  │  │ • Agents     │  │ • Actions    │  │ • Tokens     │      │   │
│  │  │ • Signatures │  │ • Timestamps │  │ • Rewards    │      │   │
│  │  │ • Metadata   │  │ • Hashes     │  │ • Tracking   │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  │                                                               │   │
│  │  All transactions logged on Masumi blockchain                │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PILLAR 4: MASTER AGENT (FINAL REPORT + SETTLEMENT)        │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  • Aggregate all agent results                               │   │
│  │  • Generate human-readable final report                      │   │
│  │  • Include cryptographic proofs                              │   │
│  │  • Compile Masumi transaction IDs                            │   │
│  │  • Trigger payment settlement                                │   │
│  │  • Log final orchestration record                            │   │
│  │                                                               │   │
│  │  Final Output:                                               │   │
│  │  • vendors_summary                                           │   │
│  │  • carbon_credit_summary                                     │   │
│  │  • staff_summary                                             │   │
│  │  • cryptographic_proofs                                      │   │
│  │  • masumi_transactions                                       │   │
│  │  • final_report                                              │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Pillar 1: AI Multi-Agent System (LangChain)

### Agents

1. **Vendor Agent**
   - Extracts vendor Scope 3 emission data
   - Compares current vs previous quarter
   - Detects anomalies (spikes, missing data, inconsistencies)
   - Produces evidence items with analysis

2. **Carbon Credits Agent**
   - Identifies country-level carbon credit thresholds
   - Compares datacenter emissions with thresholds
   - Calculates credits, penalties, compliance
   - Produces evidence with threshold reasoning

3. **Staff Agent** (coordinates two sub-agents)
   - **Scope 1 Agent**: Direct emissions analysis
   - **Scope 2 Agent**: Indirect (energy) emissions analysis
   - Each runs quarter-over-quarter comparison
   - Detects anomalies with detailed reasoning

### Output Format

Each agent returns:
```json
{
  "evidence": [...],
  "analysis": {...},
  "hashes": [...]
}
```

## Pillar 2: Integrity Layer (Hashing + Merkle Root)

### Process

**Step A — Freeze Dataset**
- Convert combined agent output to canonical JSON
- No field reordering allowed
- Frozen dataset = authoritative truth

**Step B — Report Hash**
- Compute SHA-256 hash of entire frozen dataset
- Single character change = different hash
- Guarantees report integrity

**Step C — Evidence Hashes**
- Generate SHA-256 hash for each evidence item
- All agent outputs included

**Step D — Merkle Tree Builder**
- Build Merkle tree from all evidence hashes
- Duplicate last node if count is odd
- Recursively hash pairs until single root

### Output

```json
{
  "report_hash": "<sha256>",
  "evidence_hashes": ["<hash1>", "<hash2>", ...],
  "evidence_merkle_root": "<root>"
}
```

### Purpose

- Tamper-proof auditability
- Proves dataset cannot be altered
- Required for regulatory audits
- Forensic accountability

## Pillar 3: Masumi Blockchain Layer

### Components

**1. On-Chain Identity**
- Each agent registered as Masumi identity
- Makes actions signed, verifiable, discoverable

**2. Decision Logging**
For each agent and processing step:
- `agent_id`
- `timestamp`
- `report_hash`
- `evidence_merkle_root`
- `anomaly_flags`
- `analysis_summary`

All logs stored immutably on-chain.

**3. Micropayments / Token-Reward Flow**

Payment flow:
```
User → Masumi Payment → Master Agent → Child Agents
```

Payment rates:
- Vendor Agent: 1 token per vendor analyzed
- Carbon Agent: 2 tokens (base) + 1 bonus
- Staff Agent: 1 token per scope
- Merkle Agent: 1 token per root
- Master Orchestrator: 5 tokens

All payments logged on-chain.

## Pillar 4: Master Agent (Final Report + Settlement)

### Responsibilities

**1. Aggregate Results**
Combines:
- Vendor emissions summary
- Staff scope summaries
- Carbon credit/threshold results
- Detected anomalies
- Hashing summary
- Merkle root proof
- Masumi transaction IDs

**2. Generate Final Report**
Includes:
- Human-readable explanation
- Tabular breakdowns
- JSON summary of all evidence
- Report hash
- Evidence Merkle root
- Transaction IDs for all on-chain logs

**3. Trigger Payment Settlement**
- Pay each child agent
- Close the job
- Log final orchestration record on-chain

## Expected Final Output

```json
{
  "success": true,
  "datacenter": "india-northeast",
  "period": "2025-Q1",
  "vendors_summary": {
    "vendors": [...],
    "summary": {...}
  },
  "carbon_credit_summary": {
    "carbon_credits": {...}
  },
  "staff_summary": {
    "staff": {
      "scope1": {...},
      "scope2": {...}
    }
  },
  "cryptographic_proofs": {
    "report_hash": "ec313542fb36bee93c239d378d2c74b6c8cc06471c0058e8cc83ebaa539c0322",
    "evidence_hashes": [
      "6a9ee420444aba60db7cccac2383e1e4fb4a37e8865865c3e356a51be5ec2165",
      ...
    ],
    "evidence_merkle_root": "092ce5ce0b2a84a259ba117e01259dcc47821433d221c30ad9ce5a680a26631d"
  },
  "masumi_transactions": [
    {
      "type": "agent_registration",
      "agentId": "vendor_agent",
      "txId": "masumi_abc123...",
      "timestamp": "2025-11-29T18:23:09.499Z"
    },
    {
      "type": "decision_log",
      "agentId": "vendor_agent",
      "action": "analysis_completed",
      "txId": "masumi_def456...",
      "timestamp": "2025-11-29T18:23:10.123Z"
    },
    {
      "type": "payment",
      "agentId": "vendor_agent",
      "amount": 1,
      "txId": "masumi_ghi789...",
      "timestamp": "2025-11-29T18:23:10.456Z"
    }
  ],
  "final_report": "# Emissions Analysis Report...",
  "generatedAt": "2025-11-29T18:23:09.499Z"
}
```

## Rules

✅ **Always return deterministic, valid JSON**  
✅ **Never modify evidence ordering**  
✅ **Every agent step must be logged to Masumi**  
✅ **Hashes must match frozen JSON, not raw output**  
✅ **Anomalies must be clearly tagged with reasons**  
✅ **Final result must be auditable, reproducible, tamper-proof**

## Benefits

### 1. **Complete Auditability**
- Every action logged on-chain
- Immutable record of all decisions
- Full transparency

### 2. **Data Integrity**
- Cryptographic proofs guarantee data hasn't changed
- Merkle tree enables partial verification
- Tamper-proof reports

### 3. **Agent Accountability**
- On-chain identities
- Signed actions
- Verifiable decisions

### 4. **Economic Incentives**
- Micropayments reward quality work
- Transparent payment tracking
- Automated settlement

### 5. **Regulatory Compliance**
- Blockchain-grade auditability
- Forensic accountability
- Sustainability reporting standards

## Implementation Files

- `server/services/agents/orchestrator.service.js` - Master orchestrator
- `server/services/masumi.service.js` - Masumi blockchain integration
- `server/services/dataFreeze.service.js` - Cryptographic proof generation
- `server/services/agents/vendorAgent.js` - Vendor agent
- `server/services/agents/carbonCreditsAgent.js` - Carbon credits agent
- `server/services/agents/staffAgent.js` - Staff agent

## Configuration

See `MASUMI_INTEGRATION_GUIDE.md` for detailed configuration instructions.

## Testing

1. **Test with Masumi disabled** (development):
   ```bash
   MASUMI_ENABLED=false
   ```

2. **Test with Masumi enabled** (production):
   ```bash
   MASUMI_ENABLED=true
   MASUMI_API_URL=https://api.masumi.network/v1
   ```

## Next Steps

1. Connect to actual Masumi API endpoints
2. Implement proper transaction signing
3. Add multi-signature payment approval
4. Build agent reputation system
5. Enable decentralized governance

---

**This architecture provides blockchain-grade integrity, complete auditability, and economic incentives for quality analysis work.**

