import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const cwd = path.join(process.cwd(), 'server/zk');
const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd });

const main = async () => {
  try {
    if (!existsSync(path.join(cwd, 'threshold.r1cs'))) {
      console.log('Compiling circuit...');
      run('circom threshold.circom --r1cs --wasm --sym');
    }
    if (!existsSync(path.join(cwd, 'pot12.ptau'))) {
      console.log('Downloading powers of tau (powersOfTau28_hez_final_12.ptau required).');
      run('wget -O pot12.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau');
    }
    if (!existsSync(path.join(cwd, 'threshold.zkey'))) {
      console.log('Generating zkey...');
      run('snarkjs groth16 setup threshold.r1cs pot12.ptau threshold.zkey');
      run('snarkjs zkey export verificationkey threshold.zkey verification_key.json');
    }
    console.log('ZK artifacts ready.');
  } catch (err) {
    console.error('ZK setup failed. Ensure circom and snarkjs CLI are installed.', err.message);
  }
};

main();
