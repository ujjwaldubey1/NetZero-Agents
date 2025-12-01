import crypto from 'crypto';

/**
 * Calculate Merkle root from an array of data
 * @param {Array} data - Array of data items (strings or objects)
 * @returns {string} - Merkle root hash
 */
export const calculateMerkleRoot = (data) => {
  if (data.length === 0) return null;
  if (data.length === 1) return hashData(data[0]);

  const hashes = data.map((item) => hashData(item));

  while (hashes.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        nextLevel.push(combineHashes(hashes[i], hashes[i + 1]));
      } else {
        nextLevel.push(hashes[i]);
      }
    }
    hashes.splice(0, hashes.length, ...nextLevel);
  }

  return hashes[0];
};

/**
 * Generate Merkle proof for a specific data item
 * @param {Array} data - Array of data items
 * @param {number} index - Index of the item to prove
 * @returns {Array} - Array of proof hashes
 */
export const generateMerkleProof = (data, index) => {
  if (index < 0 || index >= data.length) return null;

  const hashes = data.map((item) => hashData(item));
  const proof = [];

  let currentIndex = index;
  let currentLevel = [...hashes];
  let levelIndex = 0;

  while (currentLevel.length > 1) {
    const nextLevel = [];
    const isLeft = currentIndex % 2 === 0;
    const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;

    if (siblingIndex < currentLevel.length) {
      proof.push({
        hash: currentLevel[siblingIndex],
        position: isLeft ? 'right' : 'left',
      });
    }

    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(combineHashes(currentLevel[i], currentLevel[i + 1]));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }

    currentIndex = Math.floor(currentIndex / 2);
    currentLevel = nextLevel;
    levelIndex++;
  }

  return proof;
};

/**
 * Verify Merkle proof
 * @param {string|Object} data - The data item to verify
 * @param {Array} proof - Merkle proof array
 * @param {string} root - Expected Merkle root
 * @returns {boolean} - True if proof is valid
 */
export const verifyMerkleProof = (data, proof, root) => {
  let currentHash = hashData(data);

  for (const proofItem of proof) {
    if (proofItem.position === 'left') {
      currentHash = combineHashes(proofItem.hash, currentHash);
    } else {
      currentHash = combineHashes(currentHash, proofItem.hash);
    }
  }

  return currentHash === root;
};

/**
 * Hash a single data item
 * @param {string|Object} data - Data to hash
 * @returns {string} - SHA-256 hash
 */
const hashData = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Combine two hashes
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {string} - Combined hash
 */
const combineHashes = (hash1, hash2) => {
  return crypto.createHash('sha256').update(hash1 + hash2).digest('hex');
};


