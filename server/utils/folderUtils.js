import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the root blockStorage directory path
 * @returns {string} - Absolute path to blockStorage directory
 */
export const getBlockStorageRoot = () => {
  return path.join(__dirname, '..', 'blockStorage');
};

/**
 * Sanitize a string to be folder-safe
 * Removes special characters and spaces
 * @param {string} name - Name to sanitize
 * @returns {string} - Sanitized name
 */
export const sanitizeFolderName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid folder name provided');
  }
  
  // Remove special characters, keep only alphanumeric, dashes, and underscores
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default';
};

/**
 * Build folder path for staff uploads
 * @param {Object} params - Path parameters
 * @param {string} params.datacenterId - Data center ID
 * @param {string} params.period - Period (e.g., "2025-Q1")
 * @param {string} params.staffId - Staff user ID
 * @param {string} params.scope - Scope (scope1 or scope2)
 * @returns {string} - Full folder path
 */
export const buildStaffFolderPath = ({ datacenterId, period, staffId, scope }) => {
  const root = getBlockStorageRoot();
  const sanitizedDcId = sanitizeFolderName(datacenterId);
  const sanitizedPeriod = sanitizeFolderName(period);
  const sanitizedStaffId = sanitizeFolderName(staffId);
  const sanitizedScope = sanitizeFolderName(scope);
  
  return path.join(root, sanitizedDcId, sanitizedPeriod, 'staff', sanitizedStaffId, sanitizedScope);
};

/**
 * Build folder path for vendor uploads
 * @param {Object} params - Path parameters
 * @param {string} params.datacenterId - Data center ID
 * @param {string} params.period - Period (e.g., "2025-Q1")
 * @param {string} params.vendorId - Vendor user ID
 * @returns {string} - Full folder path
 */
export const buildVendorFolderPath = ({ datacenterId, period, vendorId }) => {
  const root = getBlockStorageRoot();
  const sanitizedDcId = sanitizeFolderName(datacenterId);
  const sanitizedPeriod = sanitizeFolderName(period);
  const sanitizedVendorId = sanitizeFolderName(vendorId);
  
  // Vendor uploads are always scope3
  return path.join(root, sanitizedDcId, sanitizedPeriod, 'vendor', sanitizedVendorId, 'scope3');
};

/**
 * Ensure a folder path exists (create if it doesn't)
 * @param {string} folderPath - Full folder path to create
 * @returns {Promise<string>} - Created folder path
 */
export const ensureFolderExists = async (folderPath) => {
  try {
    await fs.mkdir(folderPath, { recursive: true });
    return folderPath;
  } catch (error) {
    throw new Error(`Failed to create folder: ${folderPath}. Error: ${error.message}`);
  }
};

/**
 * Create folder structure for staff upload
 * @param {Object} params - Folder parameters
 * @returns {Promise<string>} - Created folder path
 */
export const createStaffUploadFolder = async ({ datacenterId, period, staffId, scope }) => {
  const folderPath = buildStaffFolderPath({ datacenterId, period, staffId, scope });
  return await ensureFolderExists(folderPath);
};

/**
 * Create folder structure for vendor upload
 * @param {Object} params - Folder parameters
 * @returns {Promise<string>} - Created folder path
 */
export const createVendorUploadFolder = async ({ datacenterId, period, vendorId }) => {
  const folderPath = buildVendorFolderPath({ datacenterId, period, vendorId });
  return await ensureFolderExists(folderPath);
};

/**
 * Check if a file exists
 * @param {string} filePath - Full file path
 * @returns {Promise<boolean>} - True if file exists
 */
export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file size in bytes
 * @param {string} filePath - Full file path
 * @returns {Promise<number>} - File size in bytes
 */
export const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    throw new Error(`Failed to get file size: ${error.message}`);
  }
};


