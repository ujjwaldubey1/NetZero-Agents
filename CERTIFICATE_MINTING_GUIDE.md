# Certificate-Minting Agent Guide 🔐

## Overview

The Certificate-Minting Agent transforms frozen emissions reports into blockchain-certified compliance certificates on Cardano/Masumi blockchain.

---

## ✅ What Was Created

### Backend:
1. **`server/services/certificateMinting.service.js`** - Main certificate minting logic
2. **`server/controllers/certificateMinting.controller.js`** - API controllers
3. **Updated `server/models/Certificate.js`** - Enhanced schema for Masumi integration
4. **Updated `server/services/masumi.service.js`** - Added `getMasumiConfig()` function
5. **Updated `server/routes/certificates.js`** - Added new routes

### Frontend:
1. **Updated `client/src/api.js`** - Added certificate minting API functions
2. **Updated `client/src/pages/operator/OrchestratorAnalysisPage.jsx`** - Added certificate minting UI

---

## 🔄 How It Works

### Step-by-Step Process:

1. **Frozen Report Input**
   - Report hash (SHA-256)
   - Merkle root
   - Evidence hashes
   - Datacenter & period
   - Masumi transactions
   - IPFS bundle (optional)

2. **Certificate Metadata Building**
   - Type: "NetZero Compliance Certificate"
   - All cryptographic proofs
   - Agent audit trail
   - Verification metadata

3. **Masumi Blockchain Minting**
   - Register certificate identity
   - Create blockchain transaction
   - Store metadata on-chain
   - Return transaction hash

4. **Database Storage**
   - Save certificate with all metadata
   - Link to frozen report
   - Store transaction hash

5. **UI Response**
   - Certificate ID
   - Transaction hash
   - Verification URL
   - Network info

---

## 📋 API Endpoints

### 1. Mint Certificate from Frozen Report
```
POST /api/certificates/mint
Body: {
  frozenReport: {
    reportHash: "...",
    evidenceMerkleRoot: "...",
    evidenceHashes: [...],
    datacenter: "...",
    period: "...",
    jobId: "...",
    masumiTransactions: [...],
    ipfsBundle: "...",
    timestamp: "..."
  }
}
```

### 2. Mint Certificate from Orchestrator Analysis
```
POST /api/certificates/mint-from-analysis
Body: {
  analysisResult: {
    // Full orchestrator analysis result
    cryptographic_proofs: {...},
    datacenter: "...",
    period: "...",
    masumi_transactions: [...],
    ipfs_links: {...}
  }
}
```

### 3. Get Minting Status
```
GET /api/certificates/mint-status
```

---

## 🎯 Frontend Integration

### Using in Orchestrator Analysis Page:

1. **Run Analysis** - Complete an emissions analysis
2. **Click "Mint Compliance Certificate"** button
3. **View Certificate** - See certificate ID, transaction hash, and verification link
4. **Verify on Blockchain** - Click "View on Blockchain Explorer" to verify

### Certificate Display:
- Certificate ID
- Transaction Hash
- Network (Masumi testnet/mainnet)
- Issued timestamp
- Blockchain explorer link

---

## 🔒 Security Features

### ✅ Integrity Guarantees:
- Report hash validated (must match frozen hash)
- Merkle root validated (must match evidence set)
- Immutable certificate metadata
- Blockchain-backed verification

### ✅ Audit Trail:
- All agent actions logged to Masumi
- Certificate minting logged to audit log
- Transaction hash stored permanently

### ✅ Verification:
- Blockchain explorer links
- Cryptographic proof validation
- Evidence integrity checks

---

## 📊 Certificate Structure

```json
{
  "status": "success",
  "certificateId": "CERT-...",
  "txHash": "masumi_cert_...",
  "network": "masumi-testnet",
  "reportHash": "...",
  "merkleRoot": "...",
  "evidenceCount": 10,
  "issuedAt": "2025-11-30T...",
  "ipfsLink": "ipfs://...",
  "verifyUrl": "https://explorer.io/transaction/...",
  "datacenter": "...",
  "period": "2025-Q1",
  "certificateRef": "CERT-dc-period-timestamp",
  "masumiTransactionCount": 11
}
```

---

## 🔧 Configuration

### Environment Variables:
```env
MASUMI_ENABLED=true
MASUMI_API_URL=https://api.masumi.network/v1
MASUMI_NETWORK_ID=masumi-testnet
MASUMI_MASTER_WALLET=your_wallet_address
```

### If Masumi is Disabled:
- Certificate is still minted (simulated)
- All metadata is stored locally
- Can be verified later when Masumi is enabled

---

## 🎨 UI Features

### Certificate Minting Section:
- "Mint Compliance Certificate" button
- Loading state during minting
- Success message with certificate details
- Error handling with clear messages
- Blockchain explorer link

### Certificate Display:
- Certificate ID (prominent)
- Transaction hash (monospace font)
- Network badge
- Verification button
- Issued timestamp

---

## 🚀 Usage Flow

1. **Complete Analysis**
   - Run orchestrator analysis
   - Get frozen report with proofs

2. **Mint Certificate**
   - Click "Mint Compliance Certificate"
   - Wait for blockchain confirmation

3. **Verify Certificate**
   - View certificate details
   - Click blockchain explorer link
   - Verify transaction on-chain

4. **Use Certificate**
   - Export for regulatory submissions
   - Share verification link
   - Store for audit purposes

---

## ✅ Testing Checklist

- [ ] Run orchestrator analysis successfully
- [ ] Click "Mint Compliance Certificate" button
- [ ] Certificate minting completes
- [ ] Certificate ID is displayed
- [ ] Transaction hash is shown
- [ ] Blockchain explorer link works
- [ ] Certificate saved to database
- [ ] Audit log entry created
- [ ] Error handling works (try without analysis)

---

## 🔍 Verification

### On-Chain Verification:
1. Copy transaction hash from certificate
2. Open blockchain explorer (link provided)
3. Search for transaction hash
4. Verify certificate metadata
5. Check report hash matches
6. Verify Merkle root

### Local Verification:
- Certificate stored in MongoDB
- All proofs preserved
- Can be retrieved anytime
- Audit log tracks all actions

---

## 📚 Files Reference

### Backend:
- `server/services/certificateMinting.service.js` - Core minting logic
- `server/controllers/certificateMinting.controller.js` - API handlers
- `server/models/Certificate.js` - Database schema
- `server/routes/certificates.js` - API routes

### Frontend:
- `client/src/api.js` - API functions
- `client/src/pages/operator/OrchestratorAnalysisPage.jsx` - UI integration

---

## 🎯 Certificate Purpose

The certificate proves:
- ✅ Report is tamper-proof (report hash)
- ✅ Evidence is intact (Merkle root)
- ✅ Analysis pipeline was executed (agent logs)
- ✅ Operators certified the report (issuedBy)
- ✅ All actions are auditable (blockchain)

**This certificate is safe for enterprise regulatory submissions!** 🏆

---

**Certificate-Minting Agent is ready to transform your frozen reports into blockchain-certified compliance certificates!** 🔐

