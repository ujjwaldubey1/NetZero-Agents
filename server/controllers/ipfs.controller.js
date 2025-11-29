import { uploadToIPFS, getFromIPFS } from '../services/ipfs.service.js';
import AuditLog from '../models/AuditLog.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Upload file to IPFS via Pinata
 * POST /api/ipfs/upload
 */
export const uploadFileToIPFS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please upload a file using multipart/form-data with key "file"',
      });
    }

    const fileName = req.body.fileName || req.file.originalname;

    console.log(`📤 IPFS Upload Request: ${fileName} (${req.file.size} bytes)`);

    // Upload to IPFS via Pinata
    const result = await uploadToIPFS(req.file.buffer, fileName);

    // Log audit event
    await AuditLog.logIPFSUpload({
      entityId: null,
      ipfsCid: result.cid,
      filename: fileName,
      details: {
        size: result.size,
        gatewayUrl: result.gatewayUrl,
      },
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
    }).catch((err) => console.error('Audit log error:', err));

    res.status(201).json({
      success: true,
      message: 'File uploaded to IPFS successfully',
      data: result,
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      error: 'IPFS upload failed',
      message: error.message,
    });
  }
};

/**
 * Upload existing file from filesystem to IPFS
 * POST /api/ipfs/upload-file
 * Body: { filePath: string, fileName: string }
 */
export const uploadFileFromPath = async (req, res) => {
  try {
    const { filePath, fileName } = req.body;

    if (!filePath) {
      return res.status(400).json({
        error: 'File path is required',
        message: 'Please provide filePath in request body',
      });
    }

    // Resolve the file path
    let resolvedPath = filePath;
    
    // Check if the path exists
    try {
      const stats = await fs.stat(resolvedPath);
      
      // If it's a directory and fileName is provided, construct full path
      if (stats.isDirectory()) {
        if (!fileName) {
          return res.status(400).json({
            error: 'Invalid path',
            message: `The provided path is a directory: ${filePath}. Please provide a fileName to construct the full file path, or provide the complete file path including the filename.`,
          });
        }
        
        // Construct full path: directory + fileName
        resolvedPath = path.join(filePath, fileName);
        console.log(`📁 Directory provided, constructing full path: ${resolvedPath}`);
        
        // Verify the constructed path exists and is a file
        const fileStats = await fs.stat(resolvedPath);
        if (fileStats.isDirectory()) {
          return res.status(400).json({
            error: 'Invalid path',
            message: `The resolved path is still a directory: ${resolvedPath}. Please provide a valid file path.`,
          });
        }
      } else if (!stats.isFile()) {
        return res.status(400).json({
          error: 'Invalid path',
          message: `The provided path is not a file: ${filePath}. Please provide a valid file path.`,
        });
      }
    } catch (statError) {
      // Path doesn't exist - check if it's because it's a directory + fileName combo
      if (statError.code === 'ENOENT' && fileName) {
        // Try constructing the full path
        const constructedPath = path.join(filePath, fileName);
        try {
          const fileStats = await fs.stat(constructedPath);
          if (fileStats.isFile()) {
            resolvedPath = constructedPath;
            console.log(`📁 Path constructed from directory + fileName: ${resolvedPath}`);
          } else {
            return res.status(404).json({
              error: 'File not found',
              message: `File not found at path: ${filePath} or constructed path: ${constructedPath}`,
            });
          }
        } catch (constructError) {
          return res.status(404).json({
            error: 'File not found',
            message: `File not found at path: ${filePath}. If ${filePath} is a directory, make sure fileName "${fileName}" exists in that directory.`,
            details: constructError.message,
          });
        }
      } else {
        return res.status(404).json({
          error: 'File not found',
          message: `File not found at path: ${filePath}`,
          details: statError.message,
        });
      }
    }

    // Validate that the resolved path is actually a file
    const finalStats = await fs.stat(resolvedPath);
    if (!finalStats.isFile()) {
      return res.status(400).json({
        error: 'Invalid path',
        message: `The resolved path is not a file: ${resolvedPath}`,
      });
    }

    // Read file from filesystem
    const fileBuffer = await fs.readFile(resolvedPath);
    const finalFileName = fileName || path.basename(resolvedPath);

    console.log(`📤 IPFS Upload from path: ${resolvedPath} (${fileBuffer.length} bytes)`);

    // Upload to IPFS
    const result = await uploadToIPFS(fileBuffer, finalFileName);

    // Log audit event
    await AuditLog.logIPFSUpload({
      entityId: null,
      ipfsCid: result.cid,
      filename: finalFileName,
      details: {
        originalPath: filePath,
        resolvedPath: resolvedPath,
        size: result.size,
        gatewayUrl: result.gatewayUrl,
      },
      user: req.user?.email || req.user?.id?.toString() || 'anonymous',
    }).catch((err) => console.error('Audit log error:', err));

    res.status(201).json({
      success: true,
      message: 'File uploaded to IPFS successfully',
      data: result,
    });
  } catch (error) {
    console.error('IPFS upload from path error:', error);
    
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        error: 'File not found',
        message: `File not found at path: ${req.body.filePath}`,
        details: error.message,
      });
    }

    if (error.code === 'EISDIR') {
      return res.status(400).json({
        error: 'Invalid path',
        message: `The provided path is a directory, not a file: ${req.body.filePath}. Please provide the full file path or provide a directory path with a fileName.`,
      });
    }

    res.status(500).json({
      error: 'IPFS upload failed',
      message: error.message,
    });
  }
};

/**
 * Retrieve file from IPFS by CID
 * GET /api/ipfs/retrieve/:cid
 */
export const retrieveFileFromIPFS = async (req, res) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        error: 'CID is required',
        message: 'Please provide a CID (Content Identifier) in the URL',
      });
    }

    console.log(`📥 IPFS Retrieve Request: ${cid}`);

    // Retrieve file from IPFS
    const fileBuffer = await getFromIPFS(cid);

    // Determine content type (you can enhance this with MIME type detection)
    const contentType = req.query.download === 'true' 
      ? 'application/octet-stream' 
      : 'application/octet-stream';

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${cid}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
  } catch (error) {
    console.error('IPFS retrieve error:', error);
    res.status(500).json({
      error: 'IPFS retrieval failed',
      message: error.message,
    });
  }
};

/**
 * Get IPFS file info (metadata only, no file download)
 * GET /api/ipfs/info/:cid
 */
export const getIPFSInfo = async (req, res) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        error: 'CID is required',
        message: 'Please provide a CID (Content Identifier) in the URL',
      });
    }

    // Return metadata without downloading the file
    res.json({
      success: true,
      cid: cid,
      ipfsUrl: `ipfs://${cid}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      message: 'Use GET /api/ipfs/retrieve/:cid to download the file',
    });
  } catch (error) {
    console.error('IPFS info error:', error);
    res.status(500).json({
      error: 'Failed to get IPFS info',
      message: error.message,
    });
  }
};

/**
 * Health check for IPFS service
 * GET /api/ipfs/health
 */
export const ipfsHealthCheck = async (req, res) => {
  try {
    // Check if credentials are configured
    const hasJWT = !!process.env.PINATA_JWT;
    const hasApiKeys = !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY);
    
    res.json({
      success: true,
      service: 'Pinata IPFS',
      configured: hasJWT || hasApiKeys,
      authMethod: hasJWT ? 'JWT' : hasApiKeys ? 'API Keys' : 'Not configured',
      message: hasJWT || hasApiKeys 
        ? 'IPFS service is configured and ready' 
        : 'Please configure PINATA_JWT or PINATA_API_KEY/PINATA_SECRET_KEY in .env',
    });
  } catch (error) {
    res.status(500).json({
      error: 'IPFS health check failed',
      message: error.message,
    });
  }
};

