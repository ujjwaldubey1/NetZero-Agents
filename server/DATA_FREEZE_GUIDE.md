# Data Freeze Service - Cryptographic Proof Generation

## Overview

The Data Freeze Service provides **blockchain-grade integrity guarantees** for all reports and evidence records. It freezes processed data exactly as provided and generates cryptographic proofs to ensure tamper-resistance and authenticity.

## Features

✅ **Exact Data Freezing** - Preserves original structure without modification  
✅ **SHA-256 Report Hashing** - Complete report integrity verification  
✅ **Individual Evidence Hashing** - Per-item cryptographic fingerprints  
✅ **Merkle Tree Generation** - Single root hash for all evidence  
✅ **Deterministic Hashing** - Consistent results with stable JSON ordering  
✅ **Verification Functions** - Validate integrity at any time  

## How It Works

### 1. Data Freezing
- Data is frozen **exactly as provided** - no reshaping, reordering, or modification
- Original structure and formatting are preserved
- Creates a canonical frozen copy for hashing

### 2. Report Hashing
- Generates SHA-256 hash of the **entire final report**
- Even a 1-character change produces a different hash
- Guarantees report integrity and detects tampering

### 3. Evidence Hashing
- Generates SHA-256 hash for **each individual evidence item**
- Evidence includes:
  - Vendor Scope 3 data
  - Carbon credits data
  - Staff Scope 1 & 2 data
  - Summary metadata

### 4. Merkle Tree Construction
- Builds a Merkle Tree from all evidence hashes
- Pairs hashes and hashes them again until one final root is produced
- If evidence count is odd, duplicates the last node
- Produces a single cryptographic fingerprint for all evidence

### 5. Purpose of Merkle Root
- Provides a single cryptographic fingerprint for all evidence
- Allows partial verification without needing full dataset
- Prevents undetected manipulation of individual evidence items
- Ensures tamper-proof compliance, auditability, and chain-of-custody

## API Endpoints

### 1. Freeze Data and Generate Proofs

**POST** `/api/data-freeze/freeze`

Freezes data and generates cryptographic proofs.

**Authentication:** Required (operator role)

**Request Body:**
```json
{
  "data": {
    "vendors_summary": { ... },
    "carbon_credit_summary": { ... },
    "staff_summary": { ... },
    "final_report": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data frozen and cryptographic proofs generated successfully",
  "report_hash": "a1b2c3d4e5f6...",
  "evidence_hashes": [
    "hash1...",
    "hash2...",
    "hash3..."
  ],
  "evidence_merkle_root": "final_merkle_root..."
}
```

### 2. Verify Report Hash

**POST** `/api/data-freeze/verify-report`

Verifies that report data matches the expected hash.

**Authentication:** Required

**Request Body:**
```json
{
  "data": { ... },
  "expectedHash": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Report hash verification successful - data integrity confirmed"
}
```

### 3. Verify Evidence Merkle Root

**POST** `/api/data-freeze/verify-evidence`

Verifies that evidence items match the expected Merkle root.

**Authentication:** Required

**Request Body:**
```json
{
  "evidenceItems": [
    { "type": "vendor_scope3", ... },
    { "type": "carbon_credits", ... }
  ],
  "expectedMerkleRoot": "final_merkle_root..."
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Evidence Merkle root verification successful - all evidence items are intact"
}
```

## Automatic Integration

The data freeze service is **automatically integrated** into the orchestrator. When you run an analysis:

```json
POST /api/orchestrator/analyze
{
  "datacenterName": "India_northEast",
  "period": "2025-Q1"
}
```

The response includes cryptographic proofs:

```json
{
  "success": true,
  "datacenter": "India_northEast",
  "period": "2025-Q1",
  "vendors_summary": { ... },
  "carbon_credit_summary": { ... },
  "staff_summary": { ... },
  "final_report": "...",
  "cryptographic_proofs": {
    "report_hash": "...",
    "evidence_hashes": [...],
    "evidence_merkle_root": "..."
  }
}
```

## Usage Examples

### Example 1: Freeze Orchestrator Results

```javascript
const response = await fetch('/api/orchestrator/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    datacenterName: 'India_northEast',
    period: '2025-Q1',
  }),
});

const result = await response.json();
const proofs = result.cryptographic_proofs;

console.log('Report Hash:', proofs.report_hash);
console.log('Evidence Items:', proofs.evidence_hashes.length);
console.log('Merkle Root:', proofs.evidence_merkle_root);
```

### Example 2: Manual Data Freeze

```javascript
const response = await fetch('/api/data-freeze/freeze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      vendors_summary: { ... },
      carbon_credit_summary: { ... },
      staff_summary: { ... },
    },
  }),
});

const proofs = await response.json();
```

### Example 3: Verify Report Integrity

```javascript
const response = await fetch('/api/data-freeze/verify-report', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: reportData,
    expectedHash: storedReportHash,
  }),
});

const result = await response.json();
if (result.verified) {
  console.log('✅ Report integrity confirmed');
} else {
  console.error('❌ Report may have been tampered with');
}
```

## Hash Format

All hashes are:
- **Algorithm:** SHA-256
- **Format:** Hexadecimal string
- **Length:** 64 characters
- **Example:** `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

## Deterministic Hashing

The service uses **canonical JSON stringification** to ensure:
- Consistent hashing regardless of object property order
- Same data always produces the same hash
- Reproducible results across different systems

## Security Guarantees

1. **Report Integrity:** The report hash detects any modification to the report
2. **Evidence Integrity:** The Merkle root detects insertion, deletion, or modification of evidence items
3. **Partial Verification:** Can verify individual evidence items without full dataset
4. **Tamper Detection:** Any unauthorized changes are immediately detectable

## Implementation Details

- **Service:** `server/services/dataFreeze.service.js`
- **Controller:** `server/controllers/dataFreeze.controller.js`
- **Routes:** `server/routes/dataFreeze.routes.js`
- **Integration:** Automatically called by orchestrator controller

## Error Handling

The service handles errors gracefully:
- Invalid data formats return clear error messages
- Empty evidence arrays are rejected
- Malformed hashes are detected and reported
- All errors are logged to audit logs

## Best Practices

1. **Store Proofs:** Always store cryptographic proofs with your data
2. **Verify Before Use:** Verify hashes before trusting stored data
3. **Audit Trail:** Use audit logs to track all freeze operations
4. **Regular Verification:** Periodically verify stored data integrity
5. **Backup Proofs:** Keep cryptographic proofs in secure storage

## Testing

Test the service with Postman:

1. **Freeze Data:**
   ```
   POST /api/data-freeze/freeze
   ```

2. **Verify Report:**
   ```
   POST /api/data-freeze/verify-report
   ```

3. **Verify Evidence:**
   ```
   POST /api/data-freeze/verify-evidence
   ```

## Related Services

- **Orchestrator Service** - Automatically generates proofs
- **Hashing Service** - Provides SHA-256 hashing utilities
- **Merkle Utils** - Provides Merkle tree functions
- **Audit Log Service** - Logs all freeze operations

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2025

