# Quick Testing Guide - Four-Pillar Architecture

## 🚀 Quick Start (3 Steps)

### Step 1: Check Status
```bash
GET /api/orchestrator/status
```
**Expected:** All 4 pillars show "operational"

### Step 2: Run Analysis
```bash
POST /api/orchestrator/analyze
{
  "datacenterName": "India_northEast",
  "period": "2025-Q1"
}
```

### Step 3: Verify Response
Check for these fields:
- ✅ `vendors_summary` (Pillar 1)
- ✅ `cryptographic_proofs` (Pillar 2)
- ✅ `masumi_transactions` (Pillar 3)
- ✅ `final_report` (Pillar 4)

## 📋 Testing Checklist

### Basic Test
- [ ] Status endpoint returns all pillars operational
- [ ] Analysis completes without errors
- [ ] Response contains all 4 pillar outputs

### Pillar 1: AI Agents
- [ ] `vendors_summary.vendors` exists
- [ ] `carbon_credit_summary.carbon_credits` exists
- [ ] `staff_summary.staff.scope1` exists
- [ ] `staff_summary.staff.scope2` exists

### Pillar 2: Integrity
- [ ] `cryptographic_proofs.report_hash` (64 hex chars)
- [ ] `cryptographic_proofs.evidence_hashes` (array)
- [ ] `cryptographic_proofs.evidence_merkle_root` (64 hex chars)

### Pillar 3: Masumi
- [ ] `masumi_transactions` is an array
- [ ] Contains `agent_registration` entries
- [ ] Contains `decision_log` entries
- [ ] Contains `payment` entries

### Pillar 4: Master Agent
- [ ] `final_report` is a string
- [ ] Report length > 100 characters
- [ ] Report mentions "hash" or "Merkle"

## 🔧 Configuration

### Development Mode (Masumi Disabled)
```bash
MASUMI_ENABLED=false
```
**Result:** Analysis works, Masumi transactions may be empty

### Production Mode (Masumi Enabled)
```bash
MASUMI_ENABLED=true
MASUMI_API_URL=https://api.masumi.network/v1
MASUMI_NETWORK_ID=masumi-testnet
```
**Result:** All transactions logged to blockchain

## 📊 Postman Collection

The Postman collection includes:
- ✅ Status check endpoint
- ✅ Analysis endpoint with 4-pillar verification
- ✅ Automatic test scripts
- ✅ Collection variable saving

**Import:** `server/NetZero_Agents.postman_collection.json`

## 🐛 Troubleshooting

**Issue:** Masumi transactions empty
- ✅ Normal if `MASUMI_ENABLED=false`
- Check `.env` file

**Issue:** Missing cryptographic proofs
- Check console logs for errors
- Verify data freeze service

**Issue:** Agents not executing
- Check database connection
- Verify datacenter exists

## 📝 Example Response

```json
{
  "success": true,
  "vendors_summary": {...},           // Pillar 1
  "carbon_credit_summary": {...},      // Pillar 1
  "staff_summary": {...},              // Pillar 1
  "cryptographic_proofs": {            // Pillar 2
    "report_hash": "...",
    "evidence_hashes": [...],
    "evidence_merkle_root": "..."
  },
  "masumi_transactions": [...],       // Pillar 3
  "final_report": "..."                // Pillar 4
}
```

## ✅ Success Indicators

- All 4 pillars return data
- Hashes are 64-character hex strings
- Masumi transactions array exists (may be empty if disabled)
- Final report is generated
- No errors in console

---

**For detailed testing, see `TESTING_GUIDE.md`**

