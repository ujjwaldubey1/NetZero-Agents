import { Lucid, Blockfrost, Data } from 'lucid-cardano';
import cardanoConfig from '../../config/cardano.js';

let lucid;

/**
 * Initialize Lucid instance
 * @returns {Promise<Lucid>} - Lucid instance
 */
const initLucid = async () => {
  if (lucid) return lucid;
  
  const network = cardanoConfig.network.toLowerCase();
  if (!cardanoConfig.blockfrostApiKey) {
    throw new Error('BLOCKFROST_API_KEY missing');
  }
  
  const blockfrost = new Blockfrost(
    cardanoConfig.blockfrostUrl(network),
    cardanoConfig.blockfrostApiKey
  );
  
  lucid = await Lucid.new(blockfrost, network === 'mainnet' ? 'Mainnet' : 'Preprod');
  
  if (cardanoConfig.seedPhrase) {
    lucid.selectWalletFromSeed(cardanoConfig.seedPhrase.split(' '));
  }
  
  return lucid;
};

/**
 * Mint a CIP-68 Report NFT
 * @param {Object} params - Minting parameters
 * @param {Object} params.reportData - Report data to include in metadata
 * @param {string} params.reportHash - Hash of the report
 * @param {string} params.period - Report period
 * @param {string} params.orgDid - Organization DID
 * @returns {Promise<string>} - Transaction hash
 */
export const mintReportNFT = async ({
  reportData,
  reportHash,
  period,
  orgDid,
}) => {
  try {
    const l = await initLucid();
    const addr = await l.wallet.address();
    
    // Create policy
    const policy = l.utils.nativeScriptFromJson({
      type: 'sig',
      keyHash: l.utils.getAddressDetails(addr).paymentCredential.hash,
    });
    const policyId = l.utils.mintingPolicyToId(policy);
    
    // Create asset name (CIP-68 compatible)
    const assetName = `000de140${Date.now().toString(16).padStart(32, '0')}`;
    const fullAssetName = policyId + assetName;
    
    // CIP-68 metadata structure
    const metadata = {
      [policyId]: {
        [assetName]: {
          name: `NetZero Report ${period}`,
          description: `ESG Emissions Report for period ${period}`,
          image: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', // Placeholder
          attributes: [
            { trait_type: 'Period', value: period },
            { trait_type: 'Report Hash', value: reportHash },
            { trait_type: 'Organization', value: orgDid },
          ],
          // CIP-68 100 metadata reference
          '100': {
            period,
            reportHash,
            orgDid,
            scopeTotals: reportData.scopeTotals || {},
            zkProofId: reportData.zkProofId || null,
          },
        },
      },
    };
    
    const tx = await l
      .newTx()
      .mintAssets({ [fullAssetName]: 1n }, Data.empty())
      .attachMintingPolicy(policy)
      .attachMetadata(721, metadata) // NFT metadata standard
      .complete();
    
    const signed = await tx.sign().complete();
    const txHash = await signed.submit();
    
    return {
      txHash,
      policyId,
      assetName,
      fullAssetName,
    };
  } catch (err) {
    console.error('Cardano mint failed:', err);
    throw new Error(`Minting failed: ${err.message}`);
  }
};

