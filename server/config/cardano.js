// Cardano blockchain configuration
export default {
  network: process.env.CARDANO_NETWORK || 'Preprod',
  blockfrostApiKey: process.env.BLOCKFROST_API_KEY,
  blockfrostUrl: (network) => {
    const net = (network || process.env.CARDANO_NETWORK || 'Preprod').toLowerCase();
    return `https://cardano-${net}.blockfrost.io/api/v0`;
  },
  seedPhrase: process.env.CARDANO_SEED_PHRASE,
  policyId: process.env.CARDANO_POLICY_ID,
};

