import crypto from 'crypto';

/**
 * Hash a report JSON object
 * @param {Object|string} reportData - Report data to hash
 * @returns {string} - SHA-256 hash
 */
export const hashReport = (reportData) => {
  const canonical = typeof reportData === 'string'
    ? reportData
    : JSON.stringify(reportData, Object.keys(reportData).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
};

/**
 * Hash arbitrary data
 * @param {string|Object|Buffer} data - Data to hash
 * @param {string} algorithm - Hash algorithm (default: 'sha256')
 * @returns {string} - Hash string
 */
export const hashData = (data, algorithm = 'sha256') => {
  const hash = crypto.createHash(algorithm);
  
  if (Buffer.isBuffer(data)) {
    hash.update(data);
  } else if (typeof data === 'string') {
    hash.update(data, 'utf8');
  } else {
    hash.update(JSON.stringify(data), 'utf8');
  }
  
  return hash.digest('hex');
};

/**
 * Create a commitment hash from value and threshold
 * @param {number} value - The value
 * @param {number} threshold - The threshold
 * @returns {string} - Commitment hash
 */
export const createCommitment = (value, threshold) => {
  return crypto.createHash('sha256')
    .update(`${value}:${threshold}`)
    .digest('hex');
};

