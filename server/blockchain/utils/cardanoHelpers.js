import { Lucid, Blockfrost } from 'lucid-cardano';
import cardanoConfig from '../../config/cardano.js';

/**
 * Get Lucid instance initialized with configuration
 * @returns {Promise<Lucid>} - Lucid instance
 */
export const getLucidInstance = async () => {
  const network = cardanoConfig.network.toLowerCase();
  if (!cardanoConfig.blockfrostApiKey) {
    throw new Error('BLOCKFROST_API_KEY missing');
  }
  
  const blockfrost = new Blockfrost(
    cardanoConfig.blockfrostUrl(network),
    cardanoConfig.blockfrostApiKey
  );
  
  const lucid = await Lucid.new(blockfrost, network === 'mainnet' ? 'Mainnet' : 'Preprod');
  
  if (cardanoConfig.seedPhrase) {
    lucid.selectWalletFromSeed(cardanoConfig.seedPhrase.split(' '));
  }
  
  return lucid;
};

/**
 * Generate policy ID from address
 * @param {string} address - Cardano address
 * @param {Lucid} lucid - Lucid instance
 * @returns {string} - Policy ID
 */
export const generatePolicyId = (address, lucid) => {
  const policy = lucid.utils.nativeScriptFromJson({
    type: 'sig',
    keyHash: lucid.utils.getAddressDetails(address).paymentCredential.hash,
  });
  return lucid.utils.mintingPolicyToId(policy);
};

/**
 * Convert asset name to hex
 * @param {string} assetName - Asset name
 * @returns {string} - Hex representation
 */
export const assetNameToHex = (assetName) => {
  return Buffer.from(assetName).toString('hex');
};

/**
 * Create CIP-68 compatible asset name
 * @param {string} prefix - Asset prefix (optional)
 * @returns {string} - CIP-68 asset name in hex
 */
export const createCIP68AssetName = (prefix = '000de140') => {
  const timestamp = Date.now().toString(16).padStart(32, '0');
  return prefix + timestamp;
};

