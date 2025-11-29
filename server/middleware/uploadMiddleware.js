import multer from 'multer';
import path from 'path';
import fs from 'fs';

// File size limit: 50 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes

// Allowed file types for STAFF
const STAFF_ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

// Allowed file types for VENDOR
const VENDOR_ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  'application/zip': ['.zip'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

// Allowed scopes for STAFF
const STAFF_ALLOWED_SCOPES = ['scope1', 'scope2'];

/**
 * Validate file type based on role
 * @param {string} mimetype - File MIME type
 * @param {string} originalname - Original filename
 * @param {string} role - User role ('staff' or 'vendor')
 * @returns {boolean} - True if valid
 */
const isValidFileType = (mimetype, originalname, role) => {
  const ext = path.extname(originalname).toLowerCase();
  const allowedTypes = role === 'staff' ? STAFF_ALLOWED_TYPES : VENDOR_ALLOWED_TYPES;
  
  // Check MIME type
  if (!allowedTypes[mimetype]) {
    return false;
  }
  
  // Check file extension matches MIME type
  const allowedExtensions = allowedTypes[mimetype];
  return allowedExtensions.includes(ext);
};

/**
 * Validate scope based on role
 * @param {string} scope - Scope to validate
 * @param {string} role - User role
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateScope = (scope, role) => {
  if (!scope) {
    return { valid: false, error: 'Scope is required' };
  }
  
  const normalizedScope = scope.toLowerCase().trim();
  
  if (role === 'staff') {
    if (!STAFF_ALLOWED_SCOPES.includes(normalizedScope)) {
      return {
        valid: false,
        error: `Staff can only upload scope1 or scope2 files. Scope3 is not allowed.`,
      };
    }
    return { valid: true };
  }
  
  if (role === 'vendor') {
    if (normalizedScope !== 'scope3') {
      return {
        valid: false,
        error: 'Vendors can only upload scope3 files.',
      };
    }
    return { valid: true };
  }
  
  return { valid: false, error: 'Invalid user role for file upload' };
};

/**
 * Create multer storage configuration for staff uploads
 */
const createStaffStorage = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Destination will be set in upload service after folder creation
      cb(null, '/tmp'); // Temporary location, will be moved
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `staff-${uniqueSuffix}${ext}`);
    },
  });
};

/**
 * Create multer storage configuration for vendor uploads
 */
const createVendorStorage = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Destination will be set in upload service after folder creation
      cb(null, '/tmp'); // Temporary location, will be moved
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `vendor-${uniqueSuffix}${ext}`);
    },
  });
};

/**
 * File filter for staff uploads
 */
const staffFileFilter = (req, file, cb) => {
  const scope = req.body.scope || req.query.scope;
  
  // Validate scope
  const scopeValidation = validateScope(scope, 'staff');
  if (!scopeValidation.valid) {
    return cb(new Error(scopeValidation.error), false);
  }
  
  // Validate file type
  if (!isValidFileType(file.mimetype, file.originalname, 'staff')) {
    return cb(
      new Error(
        'Invalid file type. Staff can only upload PDF (.pdf) or Excel (.xls, .xlsx) files.'
      ),
      false
    );
  }
  
  cb(null, true);
};

/**
 * File filter for vendor uploads
 */
const vendorFileFilter = (req, file, cb) => {
  const scope = req.body.scope || req.query.scope;
  
  // Validate scope
  const scopeValidation = validateScope(scope, 'vendor');
  if (!scopeValidation.valid) {
    return cb(new Error(scopeValidation.error), false);
  }
  
  // Validate file type
  if (!isValidFileType(file.mimetype, file.originalname, 'vendor')) {
    return cb(
      new Error(
        'Invalid file type. Vendors can upload PDF, Excel, CSV, ZIP, or image files.'
      ),
      false
    );
  }
  
  cb(null, true);
};

/**
 * Multer middleware for staff uploads
 */
export const staffUpload = multer({
  storage: createStaffStorage(),
  fileFilter: staffFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Multer middleware for vendor uploads
 */
export const vendorUpload = multer({
  storage: createVendorStorage(),
  fileFilter: vendorFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File size exceeds the maximum limit of 50 MB.`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum number of files exceeded.',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: 'Upload validation failed',
      message: err.message,
    });
  }
  
  next();
};

