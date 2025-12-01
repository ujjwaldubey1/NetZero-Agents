/**
 * Masumi Debug Service
 * Diagnostic tool to check Masumi configuration status
 */

export const checkMasumiStatus = () => {
  const masumiEnabled = process.env.MASUMI_ENABLED;
  const masumiApiUrl = process.env.MASUMI_API_URL;
  const masumiNetworkId = process.env.MASUMI_NETWORK_ID;
  const masumiMasterWallet = process.env.MASUMI_MASTER_WALLET;

  const status = {
    enabled_env: masumiEnabled,
    enabled_parsed: masumiEnabled === 'true',
    api_url: masumiApiUrl || 'Not set',
    network_id: masumiNetworkId || 'Not set',
    master_wallet: masumiMasterWallet || 'Not set',
    all_configured: !!(masumiEnabled === 'true' && masumiApiUrl && masumiNetworkId),
  };

  console.log('🔍 Masumi Configuration Status:');
  console.log('   MASUMI_ENABLED (raw):', masumiEnabled);
  console.log('   MASUMI_ENABLED (parsed):', masumiEnabled === 'true');
  console.log('   MASUMI_API_URL:', masumiApiUrl || 'Not set');
  console.log('   MASUMI_NETWORK_ID:', masumiNetworkId || 'Not set');
  console.log('   MASUMI_MASTER_WALLET:', masumiMasterWallet ? 'Set' : 'Not set');
  console.log('   All configured:', status.all_configured);

  return status;
};

export default { checkMasumiStatus };


