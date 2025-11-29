/**
 * Data Freeze Service
 * Generates cryptographic proofs to ensure integrity, authenticity, and tamper-resistance
 * of all reports and evidence records.
 * 
 * This service:
 * - Freezes datasets exactly as provided (no modification)
 * - Creates SHA-256 hash of the entire final report
 * - Generates SHA-256 hashes for each individual evidence item
 * - Builds a Merkle Tree from all evidence hashes
 * - Provides blockchain-grade integrity guarantees
 */

import crypto from 'crypto';
import { hashData } from './hashing.service.js';

/**
 * Deterministic JSON stringify with stable key ordering
 * Ensures consistent hashing regardless of object property order
 * @param {*} data - Data to stringify
 * @returns {string} - Canonical JSON string
 */
const canonicalJSONStringify = (data) => {
  if (data === null || data === undefined) {
    return JSON.stringify(data);
  }

  if (typeof data === 'string') {
    return JSON.stringify(data);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return JSON.stringify(data);
  }

  if (Array.isArray(data)) {
    return '[' + data.map(item => canonicalJSONStringify(item)).join(',') + ']';
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data).sort();
    const pairs = keys.map(key => {
      return JSON.stringify(key) + ':' + canonicalJSONStringify(data[key]);
    });
    return '{' + pairs.join(',') + '}';
  }

  return JSON.stringify(data);
};

/**
 * Compute SHA-256 hash of data using canonical JSON stringification
 * @param {*} data - Data to hash
 * @returns {string} - SHA-256 hash (hex string, 64 characters)
 */
export const computeSHA256 = (data) => {
  const canonical = canonicalJSONStringify(data);
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
};

/**
 * Build Merkle Tree from array of hashes
 * - Pairs hashes and hashes them again until one final root is produced
 * - If count is odd, duplicates the last node
 * @param {string[]} hashes - Array of hash strings
 * @returns {string} - Final Merkle root hash
 */
const buildMerkleTree = (hashes) => {
  if (hashes.length === 0) {
    throw new Error('Cannot build Merkle tree from empty array');
  }

  if (hashes.length === 1) {
    return hashes[0];
  }

  // Work with a copy to avoid mutation
  let currentLevel = [...hashes];

  while (currentLevel.length > 1) {
    const nextLevel = [];

    // Process pairs
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        // Pair exists: combine both hashes
        const combined = currentLevel[i] + currentLevel[i + 1];
        const parentHash = crypto.createHash('sha256').update(combined, 'utf8').digest('hex');
        nextLevel.push(parentHash);
      } else {
        // Odd number: duplicate the last node
        const combined = currentLevel[i] + currentLevel[i];
        const parentHash = crypto.createHash('sha256').update(combined, 'utf8').digest('hex');
        nextLevel.push(parentHash);
      }
    }

    currentLevel = nextLevel;
  }

  return currentLevel[0];
};

/**
 * Extract individual evidence items from orchestrator analysis result
 * Each evidence item represents a piece of data that contributes to the report
 * @param {Object} analysisResult - Full orchestrator analysis result
 * @returns {Array<Object>} - Array of evidence items
 */
const extractEvidenceItems = (analysisResult) => {
  const evidenceItems = [];

  // 1. Vendor evidence items
  if (analysisResult.vendors_summary?.vendors && Array.isArray(analysisResult.vendors_summary.vendors)) {
    analysisResult.vendors_summary.vendors.forEach((vendor, index) => {
      evidenceItems.push({
        type: 'vendor_scope3',
        index,
        vendor_name: vendor.name,
        scope3_comparison: vendor.scope3_comparison || {},
        anomalies: vendor.anomalies || [],
      });
    });
  }

  // 2. Carbon credits evidence
  if (analysisResult.carbon_credit_summary?.carbon_credits) {
    evidenceItems.push({
      type: 'carbon_credits',
      data: analysisResult.carbon_credit_summary.carbon_credits,
    });
  }

  // 3. Staff Scope 1 evidence
  if (analysisResult.staff_summary?.staff?.scope1) {
    evidenceItems.push({
      type: 'staff_scope1',
      comparison: analysisResult.staff_summary.staff.scope1.scope1_comparison || {},
      anomalies: analysisResult.staff_summary.staff.scope1.anomalies || [],
      total_co2e: analysisResult.staff_summary.staff.scope1.total_co2e,
    });
  }

  // 4. Staff Scope 2 evidence
  if (analysisResult.staff_summary?.staff?.scope2) {
    evidenceItems.push({
      type: 'staff_scope2',
      comparison: analysisResult.staff_summary.staff.scope2.scope2_comparison || {},
      anomalies: analysisResult.staff_summary.staff.scope2.anomalies || [],
      total_co2e: analysisResult.staff_summary.staff.scope2.total_co2e,
    });
  }

  // 5. Summary metadata
  if (analysisResult.vendors_summary?.summary) {
    evidenceItems.push({
      type: 'vendor_summary',
      data: analysisResult.vendors_summary.summary,
    });
  }

  if (analysisResult.staff_summary?.staff?.summary) {
    evidenceItems.push({
      type: 'staff_summary',
      data: analysisResult.staff_summary.staff.summary,
    });
  }

  // Return evidence items in a deterministic order
  return evidenceItems;
};

/**
 * Freeze processed data and generate cryptographic proofs
 * 
 * This function:
 * 1. Freezes the dataset exactly as provided (no modification)
 * 2. Creates SHA-256 hash of the entire final report
 * 3. Generates SHA-256 hashes for each individual evidence item
 * 4. Builds a Merkle Tree using all evidence hashes
 * 
 * @param {Object} analysisResult - The orchestrator analysis result to freeze
 * @returns {Object} - Cryptographic proof object containing:
 *   - report_hash: SHA-256 hash of entire final report
 *   - evidence_hashes: Array of SHA-256 hashes for each evidence item
 *   - evidence_merkle_root: Final Merkle root hash
 */
export const freezeDataAndGenerateProofs = (analysisResult) => {
  if (!analysisResult || typeof analysisResult !== 'object') {
    throw new Error('Invalid analysis result: must be a non-null object');
  }

  // Step 1: Freeze the dataset exactly as provided (no modification)
  // We work with the data as-is, only creating a frozen copy for hashing
  const frozenReport = JSON.parse(canonicalJSONStringify(analysisResult));

  // Step 2: Create SHA-256 hash of the entire final report
  const reportHash = computeSHA256(frozenReport);

  // Step 3: Extract individual evidence items
  const evidenceItems = extractEvidenceItems(analysisResult);

  if (evidenceItems.length === 0) {
    throw new Error('No evidence items found in analysis result');
  }

  // Step 4: Generate SHA-256 hashes for each individual evidence item
  const evidenceHashes = evidenceItems.map((item, index) => {
    const hash = computeSHA256(item);
    
    // Validate hash format (should be 64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error(`Invalid hash generated for evidence item ${index}`);
    }
    
    return hash;
  });

  // Step 5: Build Merkle Tree using all evidence hashes
  // If evidence count is odd, the last node will be duplicated automatically
  const evidenceMerkleRoot = buildMerkleTree(evidenceHashes);

  // Validate Merkle root format
  if (!/^[a-f0-9]{64}$/i.test(evidenceMerkleRoot)) {
    throw new Error('Invalid Merkle root generated');
  }

  // Return the cryptographic proof object
  return {
    report_hash: reportHash,
    evidence_hashes: evidenceHashes,
    evidence_merkle_root: evidenceMerkleRoot,
  };
};

/**
 * Verify that a report hash matches the provided hash
 * @param {Object} reportData - Report data to verify
 * @param {string} expectedHash - Expected report hash
 * @returns {boolean} - True if hash matches
 */
export const verifyReportHash = (reportData, expectedHash) => {
  const computedHash = computeSHA256(reportData);
  return computedHash === expectedHash;
};

/**
 * Verify that evidence items match the provided Merkle root
 * @param {Array<Object>} evidenceItems - Evidence items to verify
 * @param {string} expectedMerkleRoot - Expected Merkle root
 * @returns {boolean} - True if Merkle root matches
 */
export const verifyEvidenceMerkleRoot = (evidenceItems, expectedMerkleRoot) => {
  const evidenceHashes = evidenceItems.map(item => computeSHA256(item));
  const computedRoot = buildMerkleTree(evidenceHashes);
  return computedRoot === expectedMerkleRoot;
};

/**
 * Verify individual evidence item against Merkle root
 * This uses a simplified approach - for full verification, you'd need Merkle proofs
 * @param {Object} evidenceItem - Evidence item to verify
 * @param {string[]} allEvidenceHashes - All evidence hashes
 * @param {string} expectedMerkleRoot - Expected Merkle root
 * @returns {boolean} - True if item is part of the Merkle tree
 */
export const verifyEvidenceItem = (evidenceItem, allEvidenceHashes, expectedMerkleRoot) => {
  const itemHash = computeSHA256(evidenceItem);
  
  // Check if item hash is in the list
  if (!allEvidenceHashes.includes(itemHash)) {
    return false;
  }

  // Verify the Merkle root
  const computedRoot = buildMerkleTree(allEvidenceHashes);
  return computedRoot === expectedMerkleRoot;
};

