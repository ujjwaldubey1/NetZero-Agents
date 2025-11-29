import { Lucid, Blockfrost, Data } from 'lucid-cardano';
import crypto from 'crypto';

let lucid;

const initLucid = async () => {
  if (lucid) return lucid;
  const network = (process.env.CARDANO_NETWORK || 'Preprod').toLowerCase();
  if (!process.env.BLOCKFROST_API_KEY) throw new Error('BLOCKFROST_API_KEY missing');
  const blockfrost = new Blockfrost(`https://cardano-${network}.blockfrost.io/api/v0`, process.env.BLOCKFROST_API_KEY);
  lucid = await Lucid.new(blockfrost, network === 'mainnet' ? 'Mainnet' : 'Preprod');
  if (process.env.CARDANO_SEED_PHRASE) {
    lucid.selectWalletFromSeed(process.env.CARDANO_SEED_PHRASE.split(' '));
  }
  return lucid;
};

export const issueCertificateNft = async (certificateData) => {
  try {
    const l = await initLucid();
    const addr = await l.wallet.address();
    const policy = l.utils.nativeScriptFromJson({ type: 'sig', keyHash: l.utils.getAddressDetails(addr).paymentCredential.hash });
    const policyId = l.utils.mintingPolicyToId(policy);
    const assetName = `NETZERO_${Date.now()}`;
    const fullAssetName = policyId + l.utils.toHex(assetName);

    const metadata = {
      [policyId]: {
        [assetName]: {
          name: 'NetZero Emissions Certificate',
          period: certificateData.period,
          orgDid: certificateData.orgDid,
          scopeTotals: certificateData.scopeTotals,
          reportHash: certificateData.reportHash,
          zkProofId: certificateData.zkProofId,
        },
      },
    };

    const tx = await l
      .newTx()
      .mintAssets({ [fullAssetName]: 1n }, Data.empty())
      .attachMintingPolicy(policy)
      .attachMetadata(721, metadata)
      .complete();

    const signed = await tx.sign().complete();
    const txHash = await signed.submit();
    return txHash;
  } catch (err) {
    console.warn('Cardano mint failed', err.message);
    return null;
  }
};

export const writeLedgerEventOnChain = async (event) => {
  try {
    const l = await initLucid();
    const tx = await l
      .newTx()
      .attachMetadata(674, { event })
      .complete();
    const signed = await tx.sign().complete();
    const txHash = await signed.submit();
    return txHash;
  } catch (err) {
    console.warn('Ledger event on-chain logging skipped:', err.message);
    return null;
  }
};

export const hashReport = (reportJson) => {
  const canonical = typeof reportJson === 'string' ? reportJson : JSON.stringify(reportJson);
  return crypto.createHash('sha256').update(canonical).digest('hex');
};
