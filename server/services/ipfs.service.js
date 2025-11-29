import axios from 'axios';
import FormData from 'form-data';

/**
 * IPFS Service for decentralized storage using Pinata
 * Handles file uploads to IPFS network via Pinata API
 */

// Pinata API configuration
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';

// Load Pinata credentials from environment variables
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

// Maximum file size: 50 MB (in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validate Pinata credentials are configured
 * @throws {Error} If credentials are missing
 */
const validatePinataCredentials = () => {
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
    throw new Error(
      'Pinata credentials not configured. Please set PINATA_JWT or both PINATA_API_KEY and PINATA_SECRET_KEY in your .env file.'
    );
  }
};

/**
 * Upload a file buffer to IPFS via Pinata
 * @param {Buffer|Uint8Array} buffer - File buffer from multer or file system
 * @param {string} fileName - Filename for the uploaded file
 * @returns {Promise<Object>} Upload result with CID and URLs
 * @throws {Error} If upload fails or validation fails
 */
export const uploadToIPFS = async (buffer, fileName) => {
  // Input validation
  if (!buffer) {
    throw new Error('File buffer is required. Cannot upload empty file.');
  }

  if (!Buffer.isBuffer(buffer) && !(buffer instanceof Uint8Array)) {
    throw new Error(
      `Invalid file buffer type. Expected Buffer or Uint8Array. Received: ${typeof buffer}`
    );
  }

  if (buffer.length === 0) {
    throw new Error('File buffer is empty. Cannot upload empty file.');
  }

  if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
    throw new Error('Filename is required and must be a non-empty string.');
  }

  const fileSize = buffer.length;

  // Check file size limit (50 MB)
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB. ` +
      `File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`
    );
  }

  // Validate Pinata credentials
  validatePinataCredentials();

  try {
    console.log(`📤 Uploading file to Pinata IPFS: ${fileName} (${fileSize} bytes)...`);

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    
    // Add file to form data
    // Pinata expects the file under the key 'file'
    formData.append('file', buffer, {
      filename: fileName,
      contentType: 'application/octet-stream', // Pinata will detect MIME type
    });

    // Optional: Add metadata (Pinata supports metadata)
    const metadata = JSON.stringify({
      name: fileName,
    });
    formData.append('pinataMetadata', metadata);

    // Optional: Add options (Pinata supports custom options)
    const options = JSON.stringify({
      cidVersion: 1, // Use CIDv1 for better compatibility
    });
    formData.append('pinataOptions', options);

    // Build headers for Pinata API
    const headers = {
      ...formData.getHeaders(),
    };

    // Use JWT authentication if available, otherwise use API key/secret
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    // Upload to Pinata
    const response = await axios.post(PINATA_API_URL, formData, {
      headers: headers,
      maxContentLength: Infinity, // Allow large file uploads
      maxBodyLength: Infinity, // Allow large file uploads
      timeout: 300000, // 5 minute timeout for large files
    });

    // Extract CID from Pinata response
    const cid = response.data?.IpfsHash || response.data?.cid;

    if (!cid) {
      console.error('Pinata response:', JSON.stringify(response.data, null, 2));
      throw new Error('Upload succeeded but no CID was returned from Pinata API.');
    }

    // Construct URLs
    const ipfsUrl = `ipfs://${cid}`;
    const gatewayUrl = `${PINATA_GATEWAY_URL}${cid}`;

    console.log(`✅ File uploaded successfully to Pinata IPFS`);
    console.log(`   CID: ${cid}`);
    console.log(`   File: ${fileName}`);
    console.log(`   Size: ${fileSize} bytes`);
    console.log(`   Gateway URL: ${gatewayUrl}`);

    // Return result object as specified
    return {
      cid: cid,
      ipfsUrl: ipfsUrl,
      gatewayUrl: gatewayUrl,
      size: fileSize,
      fileName: fileName,
    };
  } catch (error) {
    // Enhanced error logging
    console.error('❌ Pinata IPFS upload failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   File: ${fileName}`);
    console.error(`   Size: ${fileSize} bytes`);

    // Handle axios errors specifically
    if (error.response) {
      // Pinata API returned an error response
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error(`   Status: ${status}`);
      console.error(`   Response:`, JSON.stringify(errorData, null, 2));

      if (status === 401) {
        throw new Error(
          'Pinata authentication failed. Please check your PINATA_JWT or PINATA_API_KEY/PINATA_SECRET_KEY credentials.'
        );
      }

      if (status === 403) {
        throw new Error(
          'Pinata access denied. Please check your API key permissions and account status.'
        );
      }

      if (status === 413 || status === 429) {
        throw new Error(
          `Pinata upload failed: File too large or rate limit exceeded. Status: ${status}`
        );
      }

      // Extract error message from Pinata response if available
      const errorMessage = errorData?.error?.details || errorData?.error?.message || error.message;
      throw new Error(`Pinata upload failed: ${errorMessage}`);
    }

    if (error.request) {
      // Request was made but no response received
      throw new Error(
        `Pinata service unavailable. Could not connect to ${PINATA_API_URL}. ` +
        `Please check your network connection and Pinata service status.`
      );
    }

    // Provide specific error messages for common issues
    if (error.message.includes('timeout')) {
      throw new Error(
        'Upload timeout. The file may be too large or the connection is slow. ' +
        `File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      );
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      throw new Error(
        `Cannot connect to Pinata API at ${PINATA_API_URL}. Please check your network connection.`
      );
    }

    // Generic error fallback
    throw new Error(
      `Pinata IPFS upload failed: ${error.message || 'Unknown error occurred'}`
    );
  }
};

/**
 * Retrieve data from IPFS by CID using Pinata gateway
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<Buffer>} Retrieved file buffer
 * @throws {Error} If CID is invalid or retrieval fails
 */
export const getFromIPFS = async (cid) => {
  if (!cid || typeof cid !== 'string') {
    throw new Error('CID (Content Identifier) is required and must be a string.');
  }

  try {
    console.log(`📥 Retrieving file from IPFS: ${cid}...`);

    const gatewayUrl = `${PINATA_GATEWAY_URL}${cid}`;
    const response = await axios.get(gatewayUrl, {
      responseType: 'arraybuffer',
      timeout: 60000, // 1 minute timeout
    });

    const fileBuffer = Buffer.from(response.data);

    console.log(`✅ File retrieved successfully: ${cid} (${fileBuffer.length} bytes)`);
    return fileBuffer;
  } catch (error) {
    console.error(`❌ IPFS retrieval failed for CID ${cid}:`, error.message);
    
    if (error.response) {
      throw new Error(
        `Failed to retrieve file from IPFS: HTTP ${error.response.status} - ${error.response.statusText}`
      );
    }
    
    throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
  }
};

/**
 * Pin content to IPFS via Pinata (if not already pinned)
 * Note: Pinata automatically pins content when you upload, so this is mainly for existing CIDs
 * @param {string} cid - IPFS Content Identifier
 * @param {Object} [options={}] - Pin options
 * @returns {Promise<void>}
 * @throws {Error} If pinning fails
 */
export const pinToIPFS = async (cid, options = {}) => {
  if (!cid || typeof cid !== 'string') {
    throw new Error('CID (Content Identifier) is required and must be a string.');
  }

  validatePinataCredentials();

  try {
    console.log(`📌 Pinning content to Pinata IPFS: ${cid}...`);

    const pinataPinUrl = 'https://api.pinata.cloud/pinning/pinByHash';

    const headers = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const payload = {
      hashToPin: cid,
      ...options,
    };

    await axios.post(pinataPinUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 30000,
    });

    console.log(`✅ Content pinned successfully: ${cid}`);
  } catch (error) {
    console.error(`❌ Pinata pinning failed for CID ${cid}:`, error.message);
    
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error?.details || errorData?.error?.message || error.message;
      throw new Error(`Failed to pin content to Pinata: ${errorMessage}`);
    }
    
    throw new Error(`Failed to pin content to Pinata: ${error.message}`);
  }
};

/**
 * Unpin content from Pinata IPFS
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<void>}
 * @throws {Error} If unpinning fails
 */
export const unpinFromIPFS = async (cid) => {
  if (!cid || typeof cid !== 'string') {
    throw new Error('CID (Content Identifier) is required and must be a string.');
  }

  validatePinataCredentials();

  try {
    console.log(`📌 Unpinning content from Pinata IPFS: ${cid}...`);

    const pinataUnpinUrl = `https://api.pinata.cloud/pinning/unpin/${cid}`;

    const headers = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    await axios.delete(pinataUnpinUrl, {
      headers: headers,
      timeout: 30000,
    });

    console.log(`✅ Content unpinned successfully: ${cid}`);
  } catch (error) {
    console.error(`❌ Pinata unpinning failed for CID ${cid}:`, error.message);
    
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error?.details || errorData?.error?.message || error.message;
      throw new Error(`Failed to unpin content from Pinata: ${errorMessage}`);
    }
    
    throw new Error(`Failed to unpin content from Pinata: ${error.message}`);
  }
};
