import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { groth16 } from 'snarkjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vkeyPath = path.join(__dirname, '../../zk/build/verification_key.json');

/**
 * Verify a ZK proof
 * @param {Object} proofData - Proof data to verify
 * @param {Object} proofData.proof - The proof object
 * @param {Array} proofData.publicSignals - Public signals array
 * @returns {Promise<boolean>} - True if proof is valid
 */
export const verifyProof = async ({ proof, publicSignals }) => {
  if (!fs.existsSync(vkeyPath)) {
    throw new Error('Verification key missing. Run setup first.');
  }

  const vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
  const isValid = await groth16.verify(vKey, publicSignals, proof);
  
  return isValid;
};


