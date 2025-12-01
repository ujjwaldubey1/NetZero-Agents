# NetZero Agents

AI-driven ESG/compliance automation platform for data center emissions tracking with blockchain certification. Automates Scope 1, 2, and 3 emissions reporting using multi-agent AI orchestration, cryptographic integrity, and Masumi blockchain integration.

## 🚀 Features

- **Four-Pillar Architecture**: AI orchestration, cryptographic integrity, blockchain logging, and master agent coordination
- **Multi-Agent AI System**: Automated analysis of vendor emissions, carbon credits, and staff data
- **Blockchain Certification**: Mint compliance certificates on Masumi network with immutable audit trails
- **IPFS Storage**: Decentralized storage for reports and evidence bundles
- **Compliance Logs**: Comprehensive reporting with status tracking (PENDING → ANALYZED → FROZEN → MINTED)
- **Role-Based Access**: Operator, Vendor, and Staff dashboards with different permissions
- **Zero-Knowledge Proofs**: Privacy-preserving verification for sensitive emissions data
- **File Upload System**: Support for PDF, Excel, CSV files with AI-powered extraction

## 🛠️ Tech Stack

**Backend:**

- Node.js + Express
- MongoDB (Mongoose)
- LangChain (AI orchestration)
- Masumi blockchain integration
- IPFS (decentralized storage)
- Zero-Knowledge proofs (Circom/SnarkJS)

**Frontend:**

- React 18 + Vite
- Material-UI
- React Router
- GSAP & Framer Motion (animations)

## 📁 Project Structure

```
NetZero_agents/
├── server/                 # Backend API
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   └── agents/       # AI agents (orchestrator, vendor, staff, etc.)
│   ├── middleware/       # Auth, error handling, uploads
│   ├── blockchain/       # Masumi/Cardano integration
│   ├── zk/              # Zero-knowledge proof circuits
│   └── index.js         # Entry point
│
├── client/               # Frontend React app
│   ├── src/
│   │   ├── pages/       # Page components
│   │   │   ├── operator/   # Operator dashboard & tools
│   │   │   ├── vendor/     # Vendor dashboard
│   │   │   └── staff/      # Staff dashboard
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (auth)
│   │   └── api.js       # API client
│   └── vercel.json      # Vercel deployment config
│
└── docs/                # Documentation
```

## ⚙️ Setup

### Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (or cloud instance)
- **MongoDB URI**: `mongodb://localhost:27017/netzero_agents` (default)

### Backend Setup

```bash
cd server
npm install

# Create .env file (see Environment Variables below)
cp .env.example .env  # Edit with your values

# Start MongoDB (if local)
# MongoDB should be running on port 27017

# Start server
npm start          # Production
npm run dev        # Development (nodemon)
```

### Frontend Setup

```bash
cd client
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:4000  # Default backend URL

# Start dev server
npm run dev        # Runs on http://localhost:3000
```

### Zero-Knowledge Proofs (Optional)

```bash
cd server
npm run zk:setup   # Compiles circuits, generates keys
```

Requires `circom` and `snarkjs` CLI tools globally installed.

## 🔐 Environment Variables

Create `server/.env` with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/netzero_agents

# Authentication
JWT_SECRET=your-secret-key-here

# AI Service
OPENAI_API_KEY=your-openai-key
OPENAI_BASE=https://api.openai.com/v1  # Optional: for custom endpoints
LLM_MODEL=gpt-4  # or gpt-3.5-turbo

# Blockchain (Masumi)
MASUMI_ENABLED=true
MASUMI_API_URL=https://masumi-api-url
MASUMI_NETWORK=masumi-testnet

# IPFS
IPFS_GATEWAY_URL=https://ipfs.io/ipfs

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=no-reply@netzero.local
```

## 👥 Demo Accounts

Default password for all demo users: `password123`

| Role     | Email               | Access                                                      |
| -------- | ------------------- | ----------------------------------------------------------- |
| Operator | `operator@demo.com` | Full access: dashboard, reports, certificates, orchestrator |
| Vendor   | `vendor@demo.com`   | Vendor portal: upload Scope 3 data                          |
| Staff    | `staff@demo.com`    | Staff portal: upload Scope 1 & 2 data                       |

## 📖 Usage

### 1. Start Services

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd server && npm run dev

# Terminal 3: Start Frontend
cd client && npm run dev
```

### 2. Login

Visit `http://localhost:3000/login` and use demo credentials above.

### 3. Operator Workflow

1. **Upload Data**: Staff uploads Scope 1 & 2 files (PDF/Excel)
2. **Invite Vendors**: Operator invites vendors for Scope 3 data
3. **Run Orchestrator**: Generate AI analysis report via `/operator/orchestrator`
4. **View Reports**: Check compliance logs at `/operator/reports`
5. **Mint Certificate**: Issue blockchain-certified certificate at `/operator/certificates`
6. **View Blockchain**: Explore audit trail at `/operator/chain`

### 4. Vendor Workflow

1. Receive invite link via email
2. Complete onboarding with password
3. Upload Scope 3 emissions data (PDF/Excel/CSV)
4. Generate ZK proof for privacy-preserving verification

### 5. Key Endpoints

- `/operator/dashboard` - Operator dashboard with emissions overview
- `/operator/reports` - Compliance logs table with detailed views
- `/operator/orchestrator` - Run multi-agent AI analysis
- `/operator/certificates` - Mint blockchain certificates
- `/operator/chain` - Blockchain visualization
- `/vendor/upload` - Vendor data upload portal

## 🏗️ Architecture Overview

### Four-Pillar System

1. **Pillar 1 - AI Multi-Agent System**

   - Vendor Agent (Scope 3 analysis)
   - Carbon Credits Agent (compliance & thresholds)
   - Staff Agent (Scope 1 & 2 with sub-agents)

2. **Pillar 2 - Integrity Layer**

   - Data freeze with canonical JSON
   - SHA-256 report hashing
   - Merkle tree construction
   - Evidence verification

3. **Pillar 3 - Masumi Blockchain**

   - Agent identity registration
   - Decision logging
   - Micropayment settlement
   - Immutable audit trail

4. **Pillar 4 - Master Agent**
   - Unified report generation
   - Transaction compilation
   - Final settlement coordination

## 📝 API Base URL

Default: `http://localhost:4000`

Production: `https://app.urbanservicecompany.live`

Configure in `client/src/api.js` or via `VITE_API_URL` environment variable.

## 🔗 Related Documentation

- `docs/upload_flow.md` - Detailed upload process documentation
- `docs/user_story_upload_flow.md` - User story and flow diagrams
- `server/zk/README.md` - Zero-knowledge proof setup guide

## 📄 License

ISC

---

**Note**: This is a development version. For production deployment, ensure all environment variables are properly configured and MongoDB is secured.
