import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import {
  createStaffUploadFolder,
  createVendorUploadFolder,
  buildStaffFolderPath,
  buildVendorFolderPath,
} from '../utils/folderUtils.js';
import { getQuarterFromDate, isValidPeriod } from '../utils/dateUtils.js';
import DataCenter from '../models/DataCenter.js';

/**
 * Upload service for handling file storage and metadata
 */

/**
 * Get data center ID from user
 * @param {Object} user - User object
 * @param {string} datacenterIdOrName - Optional explicit datacenter ID (ObjectId) or name (string)
 * @returns {Promise<string>} - Data center ID (ObjectId as string)
 */
const getDatacenterId = async (user, datacenterIdOrName = null) => {
  if (datacenterIdOrName) {
    // Get user's access filter
    const filter = getUserDatacenterFilter(user);
    
    // Check if the provided value is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(datacenterIdOrName);
    
    let dc;
    if (isValidObjectId) {
      // Query by _id if it's a valid ObjectId
      dc = await DataCenter.findOne({ _id: datacenterIdOrName, ...filter });
    } else {
      // Query by name if it's not a valid ObjectId (e.g., "India_northEast")
      dc = await DataCenter.findOne({ name: datacenterIdOrName, ...filter });
    }
    
    if (!dc) {
      throw new Error(
        `Access denied: You are not assigned to datacenter "${datacenterIdOrName}" or it does not exist.`
      );
    }
    return dc._id.toString();
  }
  
  // Find user's datacenter (fallback if no datacenter specified)
  const filter = getUserDatacenterFilter(user);
  const dc = await DataCenter.findOne(filter).sort({ createdAt: -1 });
  if (!dc) {
    throw new Error('No datacenter found for this user. Please specify a datacenter.');
  }
  return dc._id.toString();
};

/**
 * Get datacenter filter based on user role
 * @param {Object} user - User object
 * @returns {Object} - MongoDB filter
 */
const getUserDatacenterFilter = (user) => {
  if (user.role === 'operator') return { ownerId: user.id };
  if (user.role === 'vendor') return { vendorIds: user.id };
  if (user.role === 'staff') return { staffIds: user.id };
  return {};
};

/**
 * Validate and normalize period
 * @param {string} period - Period string or date
 * @returns {string} - Normalized period string
 */
const normalizePeriod = (period) => {
  if (!period) {
    // Default to current quarter
    return getQuarterFromDate(new Date());
  }
  
  // If it's already a valid period, return it
  if (isValidPeriod(period)) {
    return period;
  }
  
  // Try to parse as date
  const date = new Date(period);
  if (!isNaN(date.getTime())) {
    return getQuarterFromDate(date);
  }
  
  throw new Error(`Invalid period format: ${period}. Expected format: YYYY-QN (e.g., 2025-Q1)`);
};

/**
 * Move file from temporary location to final destination
 * @param {string} tempPath - Temporary file path
 * @param {string} destinationPath - Final destination path
 * @returns {Promise<string>} - Final file path
 */
const moveFile = async (tempPath, destinationPath) => {
  try {
    // Check if source file exists
    try {
      await fs.access(tempPath);
    } catch (accessError) {
      throw new Error(`Source file not found: ${tempPath}. Error: ${accessError.message}`);
    }
    
    // Try to rename first (fastest, works on same filesystem)
    try {
      await fs.rename(tempPath, destinationPath);
      return destinationPath;
    } catch (renameError) {
      // If rename fails (cross-device or other error), copy and delete
      await fs.copyFile(tempPath, destinationPath);
      await fs.unlink(tempPath);
      return destinationPath;
    }
  } catch (error) {
    throw new Error(`Failed to move file from ${tempPath} to ${destinationPath}: ${error.message}`);
  }
};

/**
 * Upload file for staff member
 * @param {Object} params - Upload parameters
 * @param {Object} params.user - User object
 * @param {Object} params.file - Multer file object
 * @param {string} params.scope - Scope (scope1 or scope2)
 * @param {string} params.period - Period (optional, defaults to current quarter)
 * @param {string} params.datacenterId - Data center ID (optional)
 * @returns {Promise<Object>} - File metadata
 */
export const uploadStaffFile = async ({ user, file, scope, period, datacenterId }) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (user.role !== 'staff') {
    throw new Error('Only staff members can upload via this endpoint');
  }
  
  // Normalize scope
  const normalizedScope = scope.toLowerCase().trim();
  if (!['scope1', 'scope2'].includes(normalizedScope)) {
    throw new Error('Staff can only upload scope1 or scope2 files');
  }
  
  // Get datacenter ID
  const dcId = await getDatacenterId(user, datacenterId);
  
  // Normalize period
  const normalizedPeriod = normalizePeriod(period);
  
  // Create folder structure
  const folderPath = await createStaffUploadFolder({
    datacenterId: dcId,
    period: normalizedPeriod,
    staffId: user.id.toString(),
    scope: normalizedScope,
  });
  
  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = `${timestamp}-${random}${ext}`;
  
  // Final file path
  const finalPath = path.join(folderPath, filename);
  
  // Move file from temp location to final destination
  await moveFile(file.path, finalPath);
  
  // Get relative path from blockStorage root
  const blockStorageRoot = path.join(process.cwd(), 'server', 'blockStorage');
  const storedPath = path.relative(blockStorageRoot, finalPath);
  
  // Return metadata
  return {
    filename,
    originalName: file.originalname,
    storedPath: storedPath.replace(/\\/g, '/'), // Use forward slashes for consistency
    fullPath: finalPath,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
    scope: normalizedScope,
    datacenterId: dcId,
    period: normalizedPeriod,
  };
};

/**
 * Upload file for vendor
 * @param {Object} params - Upload parameters
 * @param {Object} params.user - User object
 * @param {Object} params.file - Multer file object
 * @param {string} params.period - Period (optional, defaults to current quarter)
 * @param {string} params.datacenterId - Data center ID (optional)
 * @returns {Promise<Object>} - File metadata
 */
export const uploadVendorFile = async ({ user, file, period, datacenterId }) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (user.role !== 'vendor') {
    throw new Error('Only vendors can upload via this endpoint');
  }
  
  // Get datacenter ID
  const dcId = await getDatacenterId(user, datacenterId);
  
  // Normalize period
  const normalizedPeriod = normalizePeriod(period);
  
  // Create folder structure (vendors always use scope3)
  const folderPath = await createVendorUploadFolder({
    datacenterId: dcId,
    period: normalizedPeriod,
    vendorId: user.id.toString(),
  });
  
  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = `${timestamp}-${random}${ext}`;
  
  // Final file path
  const finalPath = path.join(folderPath, filename);
  
  // Move file from temp location to final destination
  await moveFile(file.path, finalPath);
  
  // Get relative path from blockStorage root
  const blockStorageRoot = path.join(process.cwd(), 'server', 'blockStorage');
  const storedPath = path.relative(blockStorageRoot, finalPath);
  
  // Return metadata
  return {
    filename,
    originalName: file.originalname,
    storedPath: storedPath.replace(/\\/g, '/'), // Use forward slashes for consistency
    fullPath: finalPath,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
    scope: 'scope3',
    datacenterId: dcId,
    period: normalizedPeriod,
  };
};

