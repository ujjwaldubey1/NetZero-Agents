import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { groth16 } from 'snarkjs';
import ZkProof from '../models/ZkProof.js';

const wasmPath = path.join(process.cwd(), 'server/zk/threshold.wasm');
const zkeyPath = path.join(process.cwd(), 'server/zk/threshold.zkey');

export const ensureZkArtifacts = async () => {
  const hasArtifacts = fs.existsSync(wasmPath) && fs.existsSync(zkeyPath);
  if (!hasArtifacts) {
    throw new Error('ZK artifacts missing. Run npm run zk:setup inside server to generate.');
  }
};

export const proveLessThan = async ({ ownerId, value, threshold }) => {
  await ensureZkArtifacts();
  const input = { value: Number(value), threshold: Number(threshold) };
  const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);
  const commitment = crypto.createHash('sha256').update(`${input.value}:${input.threshold}`).digest('hex');
  const zkProof = new ZkProof({ ownerId, valueCommitment: commitment, threshold, proof, publicSignals });
  await zkProof.save();
  return zkProof;
};

export const verifyProof = async (proofDoc) => {
  await ensureZkArtifacts();
  const vKeyPath = path.join(process.cwd(), 'server/zk/verification_key.json');
  if (!fs.existsSync(vKeyPath)) throw new Error('verification_key.json missing');
  const vKey = JSON.parse(fs.readFileSync(vKeyPath));
  const res = await groth16.verify(vKey, proofDoc.publicSignals, proofDoc.proof);
  return res;
};
