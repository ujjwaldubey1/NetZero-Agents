import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { groth16 } from 'snarkjs';
import { ensureZkArtifacts } from '../../services/zkService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wasmPath = path.join(__dirname, '../../zk/build/scope3.wasm');
const zkeyPath = path.join(__dirname, '../../zk/build/scope3.zkey');

/**
 * Generate a ZK proof for scope 3 emissions threshold verification
 * @param {Object} params - Proof parameters
 * @param {number} params.value - The actual emission value
 * @param {number} params.threshold - The threshold value to compare against
 * @returns {Promise<Object>} - Proof and public signals
 */
export const generateProof = async ({ value, threshold }) => {
  await ensureZkArtifacts();
  
  const input = { 
    value: Number(value), 
    threshold: Number(threshold) 
  };

  // Check if artifacts exist
  if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
    throw new Error('ZK artifacts missing. Run setup first.');
  }

  const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);
  
  return {
    proof,
    publicSignals,
    commitment: crypto.createHash('sha256')
      .update(`${input.value}:${input.threshold}`)
      .digest('hex')
  };
};

