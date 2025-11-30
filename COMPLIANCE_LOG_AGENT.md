# Compliance Log Population & Report Viewer Agent ✅

## 🎯 Overview

The Compliance Log Population & Report Viewer Agent populates the compliance logs table with accurate emissions data and provides detailed JSON payloads for report viewing.

## ✅ Implementation Complete

### **1. Service Layer** (`server/services/complianceLog.service.js`)

#### **Core Functions:**

- **`getComplianceLogs(datacenter)`** - Fetches all compliance log data for a datacenter
  - Aggregates data from Reports, OrchestratorResult, and Certificates
  - Returns `{ tableRows, viewPayloads }`

- **`getPeriodDetails(datacenter, period)`** - Gets detailed view payload for a specific period
  - Returns complete JSON with all report information

- **`getPeriodNarrative(datacenter, period)`** - Gets narrative text for a period
  - Returns the `final_report` text from orchestrator

#### **Helper Functions:**

- **`formatToTwoDecimals(value)`** - Formats numbers to 2 decimal places (e.g., "24.94")
- **`mapToComplianceStatus()`** - Maps report status to compliance status:
  - `MINTED` - Certificate minted
  - `FROZEN` - Cryptographic proofs generated
  - `ANALYZED` - Agents completed but not frozen
  - `PENDING` - No analysis yet
- **`extractScopeValues()`** - Extracts scope1, scope2, scope3 from orchestrator results
- **`buildViewPayload()`** - Builds complete view payload with all required fields

### **2. Controller Layer** (`server/controllers/complianceLog.controller.js`)

#### **API Endpoints:**

- **`GET /api/reports?datacenter=<dc>`** - Get compliance table rows
  - Returns: `{ tableRows: [...], viewPayloads: {...} }`

- **`GET /api/reports/:period/details?datacenter=<dc>`** - Get detailed view payload
  - Returns: Complete JSON payload for viewing

- **`GET /api/reports/:period/narrative?datacenter=<dc>`** - Get narrative
  - Returns: `{ narrative: "..." }`

### **3. Data Model** (`server/models/OrchestratorResult.js`)

New model to store complete orchestrator analysis results:
- Stores full `vendors_summary`, `staff_summary`, `carbon_credit_summary`
- Stores `final_report` (narrative)
- Stores `cryptographic_proofs`, `masumi_transactions`
- Indexed by `datacenter` and `period` for efficient queries

### **4. Orchestrator Integration**

Updated `server/controllers/orchestrator.controller.js` to:
- Store full orchestrator results in `OrchestratorResult` collection
- Ensures compliance log agent has access to complete data

## 📋 Data Flow

### **Table Population:**

1. **Fetch Reports** - Get all reports for datacenter
2. **Fetch Orchestrator Results** - Get full analysis results (prioritize OrchestratorResult collection, fallback to audit logs)
3. **Fetch Certificates** - Get minted certificates
4. **Map Data** - Combine data by period
5. **Extract Scope Values** - Get scope1, scope2, scope3 from orchestrator results
6. **Determine Status** - Map to compliance status (PENDING | ANALYZED | FROZEN | MINTED)
7. **Format Values** - Format scope values to 2 decimals
8. **Sort Chronologically** - Sort table rows by period
9. **Build View Payloads** - Generate complete JSON for each period

### **View Payload Structure:**

```json
{
  "period": "2025-Q4",
  "datacenter": "india-northeast",
  "status": "MINTED",
  "scope1": 24.94,
  "scope2": 15.23,
  "scope3": 8.76,
  "reportHash": "a3ae8175c98b69a88071f2e0370657576c02e8b3b84a0bd30dbd4aab00a7e76d",
  "merkleRoot": "...",
  "evidenceHashes": ["hash1", "hash2", ...],
  "evidence": [
    {
      "type": "vendor_scope3",
      "vendor": "vendor@example.com",
      "scope3_comparison": {...},
      "anomalies": [...]
    },
    {
      "type": "staff_scope1",
      "total_co2e": 24.94,
      "anomalies": [...]
    },
    ...
  ],
  "narrative": "Full human-readable report...",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "jobId": "job_1736935800000_india-northeast_2025-Q4",
  "masumiTxCount": 5,
  "certificateTxHash": "masumi_cert_...",
  "ipfs_bundle": "Qm..."
}
```

## 🔄 Status Mapping

| Report Status | Has Proofs | Has Certificate | Compliance Status |
|--------------|------------|-----------------|-------------------|
| pending      | No         | No              | PENDING           |
| pending      | Yes        | No              | FROZEN            |
| validated    | Yes        | No              | FROZEN            |
| validated    | Yes        | Yes             | MINTED            |
| minted       | Yes        | Yes             | MINTED            |

## 📊 Scope Value Extraction

### **From Orchestrator Results:**
- **Scope 1**: `staff_summary.staff.scope1.total_co2e`
- **Scope 2**: `staff_summary.staff.scope2.total_co2e`
- **Scope 3**: `vendors_summary.summary.total_scope3`

### **From Report Model (Legacy):**
- **Scope 1**: `scope1.total_co2e` or `scope1`
- **Scope 2**: `scope2.total_co2e` or `scope2`
- **Scope 3**: `scope3.total_co2e` or `scope3`

## ✅ Features

- ✅ Accurate emissions data from agent outputs
- ✅ Status mapping (PENDING | ANALYZED | FROZEN | MINTED)
- ✅ Scope values formatted to 2 decimals
- ✅ Chronological sorting by period
- ✅ Complete view payloads with all required fields
- ✅ Evidence extraction from orchestrator results
- ✅ Narrative retrieval from stored results
- ✅ Cryptographic proofs included
- ✅ Masumi transaction logs
- ✅ Certificate information
- ✅ IPFS bundle links

## 🎯 Usage

### **Get Compliance Table:**
```bash
GET /api/reports?datacenter=india-northeast
```

### **Get Period Details:**
```bash
GET /api/reports/2025-Q4/details?datacenter=india-northeast
```

### **Get Narrative:**
```bash
GET /api/reports/2025-Q4/narrative?datacenter=india-northeast
```

## 📝 Notes

- Full orchestrator results are now stored in `OrchestratorResult` collection
- Falls back to audit logs for older data
- View payloads include all required fields for frontend display
- Evidence ordering is preserved for Merkle validation
- All values are deterministic and accurate

---

**Compliance Log Population & Report Viewer Agent is fully implemented!** ✅

