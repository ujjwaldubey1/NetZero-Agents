# NetZero Agents – Cardano AI Compliance Automation

AI-driven ESG/compliance automation for data center emissions (Scopes 1/2/3) with LangChain extraction, vendor portal, Cardano CIP-68 carbon tokenization (Mausami network), and ZK privacy demo.


Password for all demo users: password123
Users:

Operator:
Email: operator@demo.com
Password: password123
Role: operator
Vendor:
Email: vendor@demo.com
Password: password123
Role: vendor
Staff:
Email: staff@demo.com
Password: password123
Role: staff



## Folder structure
- `server/` – Express API, MongoDB, LangChain AI extraction, Cardano CIP-68 carbon token services (Mausami), ZK demo
- `client/` – React SPA (Vite), dashboards, vendor portal, meme mode

## Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017/netzero_agents` by default)
- (Optional) Circom + snarkjs CLI for ZK demo: `npm install -g circom@2 snarkjs`
- (Optional) Cardano testnet wallet seed + Blockfrost key for minting

## Environment variables
Copy `server/.env.example` to `server/.env` and fill:
```
MONGO_URI=mongodb://localhost:27017/netzero_agents
JWT_SECRET=supersecret
OPENAI_API_KEY=your_qwen_or_openai_key
CARDANO_NETWORK=Preprod
BLOCKFROST_API_KEY=your_blockfrost_key
BLOCKFROST_PROJECT_ID=preprod
HYDRA_WS_URL=
CARDANO_SEED_PHRASE="word1 word2 ..."
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@netzero.local
```
- Set `OPENAI_BASE` and `LLM_MODEL` if using a Qwen-compatible endpoint.

## Backend setup (server/)
```
cd server
npm install
cp .env.example .env # edit values
npm start
```
- Uploads are stored under `server/uploads/`.
- ZK artifacts: run `npm run zk:setup` (requires circom + snarkjs CLI). Artifacts live in `server/zk/`.

## Frontend setup (client/)
```
cd client
npm install
npm run dev
```
Vite dev server on http://localhost:3000. API base defaults to http://localhost:4000; override with `VITE_API_URL` in `.env`.

## Demo script
1. Start MongoDB; run backend then frontend.
2. Register operator via POST `/api/auth/register` or by adding a login through the UI.
3. Operator: upload Scope 1/2 PDFs/Excels at `/upload`.
4. Invite vendor (Scope 3) at `/invite` → share invite link.
5. Vendor: login via invite, upload Scope 3 at `/vendor` and generate ZK proof.
6. Operator: `/reports` to review and freeze; generate narrative.
7. `/certificates` to issue certificate → Cardano tx hash + optional CIP-68 carbon token id (LangChain agent suggests Mausami fee).
8. `/chain` shows audit trail; `/privacy` verifies proofs.
9. Toggle “Meme Mode” on the dashboard for Cardano meme gallery + AI captions.
10. Admin/Staff: manage vendors/staff/thresholds and vendor reminders at `/staff`.

## Cardano carbon token notes
- `server/services/cardanoService.js` uses `lucid-cardano` with Blockfrost; requires `BLOCKFROST_API_KEY` and `CARDANO_SEED_PHRASE` on Preprod.
- `HYDRA_WS_URL` can be repurposed for Mausami CIP-68 carbon token submission if available; otherwise flow continues without it.
- LangChain agent (`server/services/mausamiAgent.js`) recommends whether to mint and proposes Mausami fee; defaults to static fee if `OPENAI_API_KEY` is absent.
- On-chain metadata stores report hash, zkProofId, and scope totals for carbon token generation.

## ZK privacy demo
- Circuit `server/zk/threshold.circom` checks `value < threshold` using circomlib comparator.
- `npm run zk:setup` compiles, downloads Powers of Tau, and writes `threshold.wasm`/`threshold.zkey`/`verification_key.json`.
- Vendor calls `/api/zk/prove` (value + threshold) → proof stored in Mongo; operator verifies via `/api/zk/verify`.

## Notes
- Uses LangChain for PDF/Excel/CSV parsing + anomaly summary.
- JWT auth with bcrypt hashing; roles: operator | vendor.
- MongoDB models: users, invites, emission records, reports, certificates, ledger events, ZK proofs.
# cardano-mvp
