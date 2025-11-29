import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDb from './config/db.js';
import authRoutes from './routes/auth.js';
import emissionRoutes from './routes/emissions.js';
import vendorRoutes from './routes/vendor.js';
import reportRoutes from './routes/reports.js';
import certificateRoutes from './routes/certificates.js';
import zkRoutes from './routes/zk.js';
import ledgerRoutes from './routes/ledger.js';
import miscRoutes from './routes/misc.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import dataCenterRoutes from './routes/datacenters.js';
import { ensureZkArtifacts } from './services/zkService.js';
import { startReminderAgent } from './services/scheduler.js';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDb();

// ensure uploads dir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure CORS to allow all origins
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));

// Multer storage for generic uploads route
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });

app.get('/', (_req, res) => {
  res.json({ status: 'NetZero Agents API', health: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/emissions', emissionRoutes(upload));
app.use('/api/vendor', vendorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/zk', zkRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api', miscRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
// Datacenter routes available under multiple role-specific prefixes to avoid 404s from hardcoded paths
app.use('/api/datacenters', dataCenterRoutes);
app.use('/api/operator/datacenters', dataCenterRoutes);
app.use('/api/vendor/datacenters', dataCenterRoutes);
app.use('/api/staff/datacenters', dataCenterRoutes);

// Ensure zk artifacts exist (non-blocking)
ensureZkArtifacts().catch((err) => {
  console.warn('ZK artifacts not ready:', err.message);
});

startReminderAgent();

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`NetZero Agents server running on port ${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use, retrying on ${nextPort}...`);
      startServer(nextPort);
    } else {
      throw err;
    }
  });
};

const PORT = Number(process.env.PORT) || 4000;
startServer(PORT);
