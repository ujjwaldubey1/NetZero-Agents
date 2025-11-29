import express from 'express';
import { authRequired, roleRequired } from '../middleware/auth.js';
import { staffUpload, vendorUpload, handleUploadError } from '../middleware/uploadMiddleware.js';
import { uploadStaffFileHandler, uploadVendorFileHandler } from '../controllers/upload.controller.js';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'BlockStorage upload routes are working!', routes: ['/staff', '/vendor'] });
});

/**
 * POST /api/upload/staff
 * Upload file for staff (scope1 or scope2 only)
 * 
 * Body (multipart/form-data):
 * - file: File to upload (required)
 * - scope: "scope1" or "scope2" (required)
 * - period: "2025-Q1" (optional, defaults to current quarter)
 * - datacenterId: Data center ID (optional)
 */
router.post(
  '/staff',
  authRequired,
  roleRequired('staff'),
  staffUpload.single('file'),
  (err, req, res, next) => {
    // Handle multer errors (including file filter errors)
    if (err) {
      return res.status(400).json({
        error: 'Upload validation failed',
        message: err.message,
      });
    }
    next();
  },
  uploadStaffFileHandler
);

/**
 * POST /api/upload/vendor
 * Upload file for vendor (scope3 only)
 * 
 * Body (multipart/form-data):
 * - file: File to upload (required)
 * - period: "2025-Q1" (optional, defaults to current quarter)
 * - datacenterId: Data center ID (optional)
 */
router.post(
  '/vendor',
  authRequired,
  roleRequired('vendor'),
  vendorUpload.single('file'),
  (err, req, res, next) => {
    // Handle multer errors (including file filter errors)
    if (err) {
      return res.status(400).json({
        error: 'Upload validation failed',
        message: err.message,
      });
    }
    next();
  },
  uploadVendorFileHandler
);

export default router;
