# Testing Guide - Masumi Integration & Four-Pillar Architecture

## Quick Start Testing

### 1. Test with Masumi Disabled (Development Mode)

This is the easiest way to test - Masumi operations are skipped gracefully.

```bash
# In your .env file
MASUMI_ENABLED=false
```

**What to expect:**
- All agents execute normally
- Cryptographic proofs are generated
- Masumi transactions array will be empty or contain entries with `logged: false`
- Analysis completes successfully

### 2. Test with Masumi Enabled (Production Mode)

```bash
# In your .env file
MASUMI_ENABLED=true
MASUMI_API_URL=https://api.masumi.network/v1
MASUMI_NETWORK_ID=masumi-testnet
MASUMI_MASTER_WALLET=your_wallet_address
```

**What to expect:**
- All agents execute
- Cryptographic proofs generated
- Masumi transactions logged (simulated in current implementation)
- Transaction IDs returned in response

## Step-by-Step Testing

### Step 1: Check Orchestrator Status

**Endpoint:** `GET /api/orchestrator/status`

**Expected Response:**
```json
{
  "success": true,
  "service": "AI Data Extraction and Analysis Orchestrator",
  "architecture": "Four-Pillar (AI Agents + Integrity + Masumi Blockchain + Master Agent)",
  "status": "operational",
  "masumi_blockchain": {
    "enabled": true,
    "api_url": "https://api.masumi.network/v1",
    "network": "masumi-testnet"
  },
  "pillars": {
    "pillar1_ai_agents": "operational",
    "pillar2_integrity_layer": "operational",
    "pillar3_masumi_blockchain": "operational",
    "pillar4_master_agent": "operational"
  }
}
```

**What to verify:**
- ✅ All pillars show "operational"
- ✅ Masumi blockchain status is correct
- ✅ All agents are available

### Step 2: Run Analysis

**Endpoint:** `POST /api/orchestrator/analyze`

**Request Body:**
```json
{
  "datacenterName": "India_northEast",
  "period": "2025-Q1"
}
```

**Expected Response Structure:**
```json
{
  "success": true,
  "datacenter": "India_northEast",
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
      "agentId": "master_orchestrator",
      "txId": "masumi_...",
      "timestamp": "2025-11-29T..."
    },
    {
      "type": "decision_log",
      "agentId": "vendor_agent",
      "action": "analysis_completed",
      "txId": "masumi_...",
      "timestamp": "2025-11-29T..."
    },
    {
      "type": "payment",
      "agentId": "vendor_agent",
      "amount": 1,
      "txId": "masumi_...",
      "timestamp": "2025-11-29T..."
    }
  ],
  "final_report": "# Emissions Analysis Report...",
  "generatedAt": "2025-11-29T18:23:09.499Z"
}
```

### Step 3: Verify Each Pillar

#### ✅ Pillar 1: AI Multi-Agent System

**Check:**
- `vendors_summary.vendors` - Should contain vendor analysis
- `carbon_credit_summary.carbon_credits` - Should contain carbon credit analysis
- `staff_summary.staff.scope1` - Should contain Scope 1 analysis
- `staff_summary.staff.scope2` - Should contain Scope 2 analysis

**Verification:**
```javascript
// In Postman test script or browser console
const response = pm.response.json();
console.log('Pillar 1 - Vendors:', response.vendors_summary?.vendors?.length || 0);
console.log('Pillar 1 - Carbon Credits:', response.carbon_credit_summary?.carbon_credits ? '✅' : '❌');
console.log('Pillar 1 - Staff Scope 1:', response.staff_summary?.staff?.scope1 ? '✅' : '❌');
console.log('Pillar 1 - Staff Scope 2:', response.staff_summary?.staff?.scope2 ? '✅' : '❌');
```

#### ✅ Pillar 2: Integrity Layer

**Check:**
- `cryptographic_proofs.report_hash` - Should be 64-character hex string
- `cryptographic_proofs.evidence_hashes` - Should be array of 64-character hex strings
- `cryptographic_proofs.evidence_merkle_root` - Should be 64-character hex string

**Verification:**
```javascript
const proofs = response.cryptographic_proofs;
console.log('Pillar 2 - Report Hash:', proofs?.report_hash ? '✅' : '❌');
console.log('Pillar 2 - Evidence Hashes:', proofs?.evidence_hashes?.length || 0);
console.log('Pillar 2 - Merkle Root:', proofs?.evidence_merkle_root ? '✅' : '❌');

// Verify hash format (64 hex characters)
const hashRegex = /^[a-f0-9]{64}$/i;
console.log('Pillar 2 - Hash Format Valid:', hashRegex.test(proofs?.report_hash) ? '✅' : '❌');
```

#### ✅ Pillar 3: Masumi Blockchain Layer

**Check:**
- `masumi_transactions` - Should be array of transaction objects
- Transaction types: `agent_registration`, `decision_log`, `payment`
- Each transaction should have `txId` and `timestamp`

**Verification:**
```javascript
const transactions = response.masumi_transactions || [];
console.log('Pillar 3 - Total Transactions:', transactions.length);

const registrationTxs = transactions.filter(t => t.type === 'agent_registration');
const logTxs = transactions.filter(t => t.type === 'decision_log');
const paymentTxs = transactions.filter(t => t.type === 'payment');

console.log('Pillar 3 - Registrations:', registrationTxs.length);
console.log('Pillar 3 - Decision Logs:', logTxs.length);
console.log('Pillar 3 - Payments:', paymentTxs.length);

// If Masumi is disabled, transactions may be empty or have logged: false
if (process.env.MASUMI_ENABLED === 'false') {
  console.log('⚠️  Masumi disabled - transactions may be empty');
} else {
  console.log('✅ Masumi enabled - transactions should be present');
}
```

#### ✅ Pillar 4: Master Agent

**Check:**
- `final_report` - Should contain human-readable report
- Report should mention report hash and Merkle root
- All summaries should be included

**Verification:**
```javascript
console.log('Pillar 4 - Final Report:', response.final_report ? '✅' : '❌');
console.log('Pillar 4 - Report Length:', response.final_report?.length || 0, 'characters');
console.log('Pillar 4 - Contains Hash:', response.final_report?.includes('hash') ? '✅' : '❌');
console.log('Pillar 4 - Contains Merkle:', response.final_report?.includes('Merkle') ? '✅' : '❌');
```

## Testing Checklist

### Basic Functionality

- [ ] Orchestrator status endpoint returns all pillars operational
- [ ] Analysis endpoint accepts datacenter and period
- [ ] All three agents (vendor, carbon, staff) execute
- [ ] Response contains all required fields

### Pillar 1: AI Agents

- [ ] Vendor agent returns vendor analysis
- [ ] Carbon credits agent returns threshold analysis
- [ ] Staff agent returns Scope 1 and Scope 2 analysis
- [ ] Anomalies are detected and tagged with reasons

### Pillar 2: Integrity Layer

- [ ] Report hash is generated (64 hex characters)
- [ ] Evidence hashes array is populated
- [ ] Merkle root is generated (64 hex characters)
- [ ] All hashes are valid SHA-256 format

### Pillar 3: Masumi Blockchain

- [ ] Agent registrations are logged (if enabled)
- [ ] Decision logs are created for each agent
- [ ] Payments are scheduled for each agent
- [ ] Transaction IDs are returned
- [ ] Timestamps are included

### Pillar 4: Master Agent

- [ ] Final report is generated
- [ ] Report includes all summaries
- [ ] Report mentions cryptographic proofs
- [ ] All transaction IDs are compiled
- [ ] Generated timestamp is included

## Testing with Postman

### 1. Import Collection

The Postman collection already includes orchestrator routes. Use:
- `GET /api/orchestrator/status` - Check status
- `POST /api/orchestrator/analyze` - Run analysis

### 2. Test Scripts

Add this to your Postman test script for the analyze endpoint:

```javascript
// Test all four pillars
if (pm.response.code === 200) {
    const response = pm.response.json();
    
    // Pillar 1: AI Agents
    pm.test("Pillar 1 - Vendors summary exists", () => {
        pm.expect(response.vendors_summary).to.exist;
    });
    
    pm.test("Pillar 1 - Carbon credits summary exists", () => {
        pm.expect(response.carbon_credit_summary).to.exist;
    });
    
    pm.test("Pillar 1 - Staff summary exists", () => {
        pm.expect(response.staff_summary).to.exist;
    });
    
    // Pillar 2: Integrity Layer
    pm.test("Pillar 2 - Cryptographic proofs exist", () => {
        pm.expect(response.cryptographic_proofs).to.exist;
    });
    
    pm.test("Pillar 2 - Report hash is valid", () => {
        const hash = response.cryptographic_proofs?.report_hash;
        pm.expect(hash).to.match(/^[a-f0-9]{64}$/i);
    });
    
    pm.test("Pillar 2 - Merkle root is valid", () => {
        const root = response.cryptographic_proofs?.evidence_merkle_root;
        pm.expect(root).to.match(/^[a-f0-9]{64}$/i);
    });
    
    // Pillar 3: Masumi Blockchain
    pm.test("Pillar 3 - Masumi transactions array exists", () => {
        pm.expect(response.masumi_transactions).to.be.an('array');
    });
    
    // Pillar 4: Master Agent
    pm.test("Pillar 4 - Final report exists", () => {
        pm.expect(response.final_report).to.be.a('string');
        pm.expect(response.final_report.length).to.be.above(100);
    });
    
    // Log summary
    console.log('✅ All pillars verified!');
    console.log('📊 Transactions:', response.masumi_transactions?.length || 0);
    console.log('🔒 Report Hash:', response.cryptographic_proofs?.report_hash?.substring(0, 16) + '...');
}
```

## Testing Scenarios

### Scenario 1: Normal Analysis

**Input:**
```json
{
  "datacenterName": "India_northEast",
  "period": "2025-Q1"
}
```

**Expected:**
- All agents execute
- All pillars complete
- Response includes all fields

### Scenario 2: Missing Data

**Input:**
```json
{
  "datacenterName": "NonExistent",
  "period": "2025-Q1"
}
```

**Expected:**
- Error response with clear message
- No partial data returned

### Scenario 3: Invalid Period

**Input:**
```json
{
  "datacenterName": "India_northEast",
  "period": "invalid"
}
```

**Expected:**
- Period normalized or error
- Analysis continues with normalized period

## Debugging

### Check Logs

The orchestrator logs each pillar:

```
🎯 [PILLAR 1] Orchestrating analysis for: ...
🚀 [PILLAR 1] Triggering specialized agents...
✅ [PILLAR 1] All agents completed
🔒 [PILLAR 2] Freezing dataset and generating cryptographic proofs...
✅ [PILLAR 2] Cryptographic proofs generated
📝 [Masumi] Decision logged: vendor_agent -> analysis_completed
💰 [Masumi] Payment scheduled: vendor_agent - 1 tokens
📄 [PILLAR 4] Generating final report...
✅ [PILLAR 4] Final report generated and settlement completed
```

### Common Issues

**Issue: Masumi transactions empty**
- Check `MASUMI_ENABLED` in .env
- If false, this is expected behavior
- If true, check Masumi service logs

**Issue: Missing cryptographic proofs**
- Check data freeze service
- Verify evidence items are extracted
- Check console for errors

**Issue: Agents not executing**
- Check database connection
- Verify datacenter exists
- Check agent service files

## Verification Commands

### Check Environment

```bash
# Check if Masumi is enabled
node -e "require('dotenv').config(); console.log('Masumi Enabled:', process.env.MASUMI_ENABLED)"
```

### Test Hash Verification

Use the data freeze verification endpoint:

```bash
POST /api/data-freeze/verify-report
{
  "data": { /* your orchestrator result without cryptographic_proofs */ },
  "expectedHash": "your_report_hash"
}
```

## Next Steps

1. **Test with real data** - Use actual datacenter and period
2. **Verify hashes** - Use verification endpoints
3. **Check transactions** - Review Masumi transaction array
4. **Test error cases** - Invalid inputs, missing data
5. **Performance testing** - Multiple concurrent requests

---

**Ready to test! Start with the status endpoint, then run a full analysis.**

