import express from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/auth.js';
import {
  uploadFileToIPFS,
  uploadFileFromPath,
  retrieveFileFromIPFS,
  getIPFSInfo,
  ipfsHealthCheck,
} from '../controllers/ipfs.controller.js';

const router = express.Router();

// Configure multer for memory storage (file stays in memory as buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

/**
 * GET /api/ipfs/health
 * Health check endpoint to verify IPFS service configuration
 */
router.get('/health', ipfsHealthCheck);

/**
 * POST /api/ipfs/upload
 * Upload a file to IPFS via Pinata
 * 
 * Body (multipart/form-data):
 * - file: File to upload (required, max 50MB)
 * - fileName: Optional custom filename (defaults to original filename)
 * 
 * Requires: Authentication (optional - can be tested without auth)
 */
router.post('/upload', upload.single('file'), uploadFileToIPFS);

/**
 * POST /api/ipfs/upload-file
 * Upload an existing file from filesystem to IPFS
 * 
 * Body (JSON):
 * {
 *   "filePath": "/path/to/file.pdf",
 *   "fileName": "optional-custom-name.pdf"
 * }
 * 
 * Requires: Authentication
 */
router.post('/upload-file', authRequired, uploadFileFromPath);

/**
 * GET /api/ipfs/retrieve/:cid
 * Retrieve and download a file from IPFS by CID
 * 
 * Query params:
 * - download: true/false (default: true) - forces download vs inline display
 * 
 * Example: GET /api/ipfs/retrieve/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG?download=true
 */
router.get('/retrieve/:cid', retrieveFileFromIPFS);

/**
 * GET /api/ipfs/info/:cid
 * Get metadata about an IPFS file (does not download the file)
 * 
 * Returns:
 * {
 *   "cid": "...",
 *   "ipfsUrl": "ipfs://...",
 *   "gatewayUrl": "https://gateway.pinata.cloud/ipfs/..."
 * }
 */
router.get('/info/:cid', getIPFSInfo);

export default router;


