# NetZero Full-Stack AI Orchestrator - System Architecture

## 🎯 System Overview

The NetZero platform is a unified, end-to-end emissions analysis system that combines:
- **Backend APIs** (Node.js/Express)
- **Frontend Components** (React)
- **Multi-Agent AI Analysis** (LangChain)
- **Cryptographic Proofs** (Hashing + Merkle Trees)
- **IPFS Storage** (Pinata Gateway)
- **Masumi Blockchain Integration** (Identity + Logging + Micropayments)
- **Final Report Generation** (Human-readable + Export-ready)

---

## 🏗️ Four-Pillar Architecture

### **PILLAR 1: Multi-Agent Emissions Analysis (LangChain)**

#### Agents
1. **Vendor Agent** - Analyzes Scope 3 vendor emissions
2. **Carbon Credit Agent** - Calculates thresholds and compliance
3. **Staff Scope-1 Agent** - Direct emissions analysis
4. **Staff Scope-2 Agent** - Indirect emissions analysis
5. **Master Agent** - Orchestrates all agents

#### Agent Output Format
```json
{
  "evidence": [...],
  "analysis": {...},
  "hashes": [...]
}
```

#### Backend Route
```
POST /api/orchestrator/analyze
Body: { datacenterName: string, period: string }
```

#### Frontend Integration
- Trigger from React dashboard
- Display agent progress
- Show agent-by-agent results

---

### **PILLAR 2: Integrity Layer (Hashing + Merkle Root)**

#### Process Flow
1. Freeze dataset (canonical JSON) - **No modification**
2. Generate SHA-256 `report_hash` of entire dataset
3. Create `evidence_hashes` array for each evidence item
4. Build Merkle tree → `evidence_merkle_root`
5. Attach all proofs to final report

#### Backend Routes
```
POST /api/data-freeze/freeze
POST /api/data-freeze/verify-report
POST /api/data-freeze/verify-evidence
```

#### Output Format
```json
{
  "cryptographic_proofs": {
    "report_hash": "sha256...",
    "evidence_hashes": ["hash1", "hash2", ...],
    "evidence_merkle_root": "sha256..."
  }
}
```

#### Frontend Integration
- Hash verification UI
- Merkle tree visualization
- Evidence integrity checks

---

### **PILLAR 3: Masumi Blockchain Integration**

#### Features
1. **On-Chain Identity** - Each agent registered with unique ID
2. **Decision Logging** - Immutable log of all actions
3. **Micropayments** - Token rewards to agents

#### Transaction Types
- `agent_registration` - Agent identity creation
- `decision_log` - Action logging
- `payment` - Token transfers

#### Micropayment Rates
- Vendor Agent: 1 token per vendor
- Staff Agents: 1 token per scope
- Merkle Agent: 1 token per freeze
- Carbon Agent: 2 tokens base + bonuses
- Master Orchestrator: 5 tokens

#### Backend Service
```javascript
// server/services/masumi.service.js
registerAgentIdentity(agentId, metadata)
logDecision({ agentId, action, data })
schedulePayment({ agentId, amount, reason })
```

#### Frontend Integration
- Blockchain transaction timeline
- Transaction ID display
- Payment visualization

---

### **PILLAR 4: Master Agent Final Report**

#### Responsibilities
1. Aggregate all agent results
2. Construct cryptographic summary
3. Add Merkle root + hashes
4. Include Masumi transaction IDs
5. Upload proof bundle to IPFS
6. Generate structured JSON + human-readable report

#### Output Format
```json
{
  "vendors_summary": {...},
  "carbon_credit_summary": {...},
  "staff_summary": {...},
  "cryptographic_proofs": {...},
  "masumi_transactions": [...],
  "final_report": "Human-readable markdown...",
  "ipfs_links": {
    "report_bundle": "ipfs://...",
    "evidence_package": "ipfs://..."
  }
}
```

#### Frontend Integration
- Report preview
- Export options (PDF/JSON)
- Download links

---

## 📊 Backend API Routes

### Health & Status
```
GET  /api/orchestrator/status
GET  /api/ipfs/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Reports
```
GET  /api/reports
POST /api/reports/create
GET  /api/reports/current
```

### Vendor Scope
```
GET  /api/vendor-scope
POST /api/vendor-scope/submit
```

### File Uploads (BlockStorage)
```
POST /api/upload/staff    # Scope 1 & 2 only
POST /api/upload/vendor   # Scope 3 only
```

### IPFS (Pinata)
```
POST /api/ipfs/upload
GET  /api/ipfs/info/:cid
GET  /api/ipfs/retrieve/:cid
```

### AI Orchestrator
```
POST /api/orchestrator/analyze
Body: {
  "datacenterName": "string",
  "period": "string"
}
```

### Data Freeze
```
POST /api/data-freeze/freeze
POST /api/data-freeze/verify-report
POST /api/data-freeze/verify-evidence
```

---

## 🎨 Frontend React Components

### Core Components

#### 1. **ReportTable.jsx**
- Display emissions data in tables
- Show vendor, carbon, staff summaries
- Sortable, filterable columns

#### 2. **DashboardCards.jsx**
- Summary cards for key metrics
- Total emissions, anomalies, compliance
- Quick stats visualization

#### 3. **LedgerTimeline.jsx**
- Blockchain transaction timeline
- Masumi transaction history
- Audit trail visualization

#### 4. **BlockchainVisualization.jsx**
- Merkle tree visual representation
- Hash chains
- Evidence integrity graph

#### 5. **UploadForm.jsx**
- File upload interface
- Role-based scope selection
- Upload progress tracking

#### 6. **MemeLayout.jsx**
- Styling/UX modes
- Theme management
- Layout configuration

### UI Features

#### Charts & Graphs
- Emissions trends
- Scope breakdowns
- Anomaly detection charts
- Compliance status

#### Status Indicators
- BootLoader animations
- Agent execution status
- Progress bars
- Error states

#### Export Options
- PDF generation
- JSON download
- CSV export
- Print view

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                    (React Frontend)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    API REQUEST LAYER                         │
│              (Authentication + Validation)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API ROUTES                              │
│  - Upload → BlockStorage                                    │
│  - Analysis → Orchestrator                                  │
│  - Verification → Data Freeze                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         PILLAR 1: MULTI-AGENT SYSTEM                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Vendor  │  │  Carbon  │  │  Staff   │                 │
│  │  Agent   │  │  Agent   │  │  Agents  │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       └─────────────┼──────────────┘                        │
│                     ▼                                        │
│            Master Agent Aggregation                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         PILLAR 2: INTEGRITY LAYER                           │
│  - Freeze Dataset                                           │
│  - Generate Report Hash                                     │
│  - Create Evidence Hashes                                   │
│  - Build Merkle Tree                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         PILLAR 3: MASUMI BLOCKCHAIN                         │
│  - Register Agents                                          │
│  - Log Decisions                                            │
│  - Process Micropayments                                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         PILLAR 4: MASTER AGENT                              │
│  - Generate Final Report                                    │
│  - Upload to IPFS                                           │
│  - Format UI Payload                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESPONSE LAYER                            │
│  - Structured JSON                                          │
│  - UI-Ready Payload                                         │
│  - Export Formats                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              REACT FRONTEND RENDERING                        │
│  - Charts & Graphs                                          │
│  - Tables & Timelines                                       │
│  - Download & Export                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Final Output Format

### Complete Response Structure
```json
{
  "status": "success",
  "datacenter": "string",
  "period": "string",
  "vendors_summary": {
    "vendors": [...],
    "summary": {
      "total_vendors": 0,
      "total_anomalies": 0,
      "total_scope3": 0
    }
  },
  "carbon_credit_summary": {
    "carbon_credits": {
      "country": "string",
      "latest_threshold": "string",
      "current_emission": "string",
      "credit_score": "string",
      "compliance_status": "string"
    }
  },
  "staff_summary": {
    "staff": {
      "scope1": {...},
      "scope2": {...},
      "summary": {...}
    }
  },
  "anomalies": [
    {
      "type": "string",
      "reason": "string",
      "agent": "string",
      "severity": "string"
    }
  ],
  "cryptographic_proofs": {
    "report_hash": "sha256...",
    "evidence_hashes": ["hash1", "hash2", ...],
    "evidence_merkle_root": "sha256..."
  },
  "ipfs_links": {
    "report_bundle": "ipfs://...",
    "evidence_package": "ipfs://...",
    "gateway_urls": {
      "report": "https://gateway.pinata.cloud/ipfs/...",
      "evidence": "https://gateway.pinata.cloud/ipfs/..."
    }
  },
  "masumi_transactions": [
    {
      "type": "agent_registration|decision_log|payment",
      "agentId": "string",
      "txId": "masumi_...",
      "timestamp": "ISO8601",
      "amount": 0,
      "action": "string"
    }
  ],
  "final_report": "Markdown-formatted human-readable report...",
  "ui_payload": {
    "charts": {
      "emissions_by_scope": {...},
      "vendor_comparison": {...},
      "anomaly_timeline": {...}
    },
    "timeline": [
      {
        "timestamp": "ISO8601",
        "event": "string",
        "agent": "string",
        "txId": "string"
      }
    ],
    "blocks": [
      {
        "hash": "string",
        "parent": "string",
        "timestamp": "ISO8601",
        "transactions": [...]
      }
    ],
    "tables": {
      "vendors": [...],
      "emissions": [...],
      "anomalies": [...]
    }
  },
  "generatedAt": "ISO8601",
  "export_formats": {
    "pdf_url": "string",
    "json_url": "string",
    "csv_url": "string"
  }
}
```

---

## 🔒 Security & Integrity Rules

### Deterministic JSON
- Always maintain stable key ordering
- Use canonical JSON stringification
- Never modify frozen dataset

### Hash Computation
- SHA-256 for all hashes
- 64-character hex format
- Canonical ordering required

### Merkle Tree
- Pair hashes recursively
- Duplicate last node if odd count
- Single root hash output

### Blockchain Logging
- All agent actions logged
- Immutable transaction IDs
- Timestamp for every action

---

## 🎯 Frontend Integration Checklist

### Required UI Components
- [ ] ReportTable.jsx - Display emissions data
- [ ] DashboardCards.jsx - Summary metrics
- [ ] LedgerTimeline.jsx - Blockchain timeline
- [ ] BlockchainVisualization.jsx - Merkle tree view
- [ ] UploadForm.jsx - File uploads
- [ ] ReportViewer.jsx - Final report display
- [ ] ExportMenu.jsx - Download options

### Required Features
- [ ] Vendor list display
- [ ] Emissions charts (Scope 1, 2, 3)
- [ ] Anomaly detection visualization
- [ ] Blockchain transaction timeline
- [ ] IPFS link display
- [ ] Hash/merkle verification UI
- [ ] Status animations
- [ ] Graph views
- [ ] Export buttons (PDF/JSON/CSV)

---

## 📋 System Validation Checklist

### Backend Validation
- [x] All four pillars operational
- [x] Masumi integration working (11 transactions logged)
- [x] Cryptographic proofs generated
- [x] IPFS upload ready
- [x] File upload system working
- [x] API routes registered

### Frontend Integration Needed
- [ ] Create React components for each UI element
- [ ] Connect to backend APIs
- [ ] Display orchestrator results
- [ ] Show Masumi transactions
- [ ] Render Merkle tree visualization
- [ ] Implement export functionality

---

## 🚀 Implementation Priorities

### Phase 1: Core Integration (High Priority)
1. Connect React frontend to orchestrator API
2. Display orchestrator analysis results
3. Show cryptographic proofs in UI
4. Display Masumi transaction timeline

### Phase 2: Visualizations (Medium Priority)
1. Implement charts for emissions data
2. Create Merkle tree visualization
3. Build anomaly detection graphs
4. Add status indicators

### Phase 3: Export & Download (Medium Priority)
1. PDF report generation
2. JSON export
3. CSV export
4. IPFS link downloads

### Phase 4: Advanced Features (Low Priority)
1. Real-time updates
2. Historical comparison
3. Advanced filtering
4. Custom report templates

---

## 📝 Notes

- All backend systems are operational
- Masumi blockchain integration is working (11 transactions per analysis)
- Cryptographic proofs are generated correctly
- Frontend components need to be created/connected
- UI payload structure should match the format above

---

**This document serves as the master specification for the unified NetZero platform!**

