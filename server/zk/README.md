# ZK Proofs for Scope 3 Emissions

This directory contains zero-knowledge proof circuits and utilities for verifying emissions data without revealing sensitive information.

## Structure

- `circuits/` - Circom circuit definitions
- `build/` - Compiled circuit artifacts (wasm, zkey, verification keys)
- `proofs/` - Generated proof files
- `utils/` - Proof generation and verification utilities

## Setup

1. Install dependencies (circom, snarkjs)
2. Run setup script to compile circuits and generate keys
3. Use the utils to generate and verify proofs

## Usage

```javascript
import { generateProof } from './zk/utils/generateProof.js';
import { verifyProof } from './zk/utils/verifyProof.js';

// Generate proof
const { proof, publicSignals } = await generateProof({
  value: 100,
  threshold: 150
});

// Verify proof
const isValid = await verifyProof({ proof, publicSignals });
```


