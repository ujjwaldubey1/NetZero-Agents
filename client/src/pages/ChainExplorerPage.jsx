import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import api from '../api';
import BlockchainVisualization from '../components/BlockchainVisualization';
import MemeLayout from '../components/MemeLayout';

import { ASSETS } from '../assets';

const getMockEvents = () => {
  const now = new Date();
  return [
    {
      _id: 'demo1',
      type: 'CERTIFICATE_ISSUED',
      detail: 'Certificate #CERT-2025-Q4 issued for period 2025-Q4. Total emissions: 1,247 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 30),
      certificateId: 'CERT-2025-Q4',
      cardanoTxHash: '0x8f3d9a2b1c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      hydraTxId: 'hydra_tx_12345abcdef'
    },
    {
      _id: 'demo2',
      type: 'REPORT_FROZEN',
      detail: 'Compliance report for 2025-Q4 frozen. Scope 1: 342 tons, Scope 2: 518 tons, Scope 3: 387 tons',
      timestamp: new Date(now - 1000 * 60 * 60 * 2),
      reportHash: 'QmX4z9W8v7U6t5S4r3Q2p1O0n9M8l7K6j5I4h3G2f1E0d'
    },
    {
      _id: 'demo3',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Vendor "GreenTech Solutions" submitted Scope 3 data for DC-North. Upstream emissions: 387 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 5),
    },
    {
      _id: 'demo4',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Staff uploaded Scope 2 data for DC-West. Electricity consumption: 518 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 8),
    },
    {
      _id: 'demo5',
      type: 'CERTIFICATE_ISSUED',
      detail: 'Certificate #CERT-2025-Q3 issued for period 2025-Q3. Total emissions: 1,089 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 3),
      certificateId: 'CERT-2025-Q3',
      cardanoTxHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      hydraTxId: 'hydra_tx_67890ghijkl'
    },
    {
      _id: 'demo6',
      type: 'REPORT_FROZEN',
      detail: 'Compliance report for 2025-Q3 frozen. Scope 1: 298 tons, Scope 2: 456 tons, Scope 3: 335 tons',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 60),
      reportHash: 'QmY5a0X9w8V7u6T5s4R3q2P1o0N9m8L7k6J5i4H3g2F1e'
    },
    {
      _id: 'demo7',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Vendor "CloudOps Ltd" submitted Scope 3 data for DC-East. Upstream emissions: 335 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 60 * 4),
    },
    {
      _id: 'demo8',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Staff uploaded Scope 1 data for DC-North. Diesel generators: 298 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 60 * 6),
    },
    {
      _id: 'demo9',
      type: 'ZK_PROOF_VERIFIED',
      detail: 'Zero-knowledge proof verified: Vendor emissions below threshold without revealing exact values',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 7),
      proofHash: 'zk_proof_abc123xyz789'
    },
    {
      _id: 'demo10',
      type: 'CERTIFICATE_ISSUED',
      detail: 'Certificate #CERT-2025-Q2 issued for period 2025-Q2. Total emissions: 1,156 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 90),
      certificateId: 'CERT-2025-Q2',
      cardanoTxHash: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
      hydraTxId: 'hydra_tx_mnopqr12345'
    },
    {
      _id: 'demo11',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Vendor "DataCore Systems" submitted Scope 3 data for DC-South. Cloud services: 412 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 92),
    },
    {
      _id: 'demo12',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Staff uploaded Scope 2 data for DC-Central. Grid electricity: 589 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 95),
    },
    {
      _id: 'demo13',
      type: 'REPORT_FROZEN',
      detail: 'Compliance report for 2025-Q2 frozen. Scope 1: 312 tons, Scope 2: 478 tons, Scope 3: 366 tons',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 90 - 1000 * 60 * 60 * 2),
      reportHash: 'QmZ6b1Y0x9W8v7U6t5S4r3Q2p1O0n9M8l7K6j5I4h3G2f'
    },
    {
      _id: 'demo14',
      type: 'ZK_PROOF_VERIFIED',
      detail: 'Zero-knowledge proof verified: Multiple vendors proved compliance without data exposure',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 100),
      proofHash: 'zk_proof_def456uvw012'
    },
    {
      _id: 'demo15',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Vendor "EcoTech Industries" submitted Scope 3 data for DC-North. Supply chain: 298 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 120),
    },
    {
      _id: 'demo16',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Staff uploaded Scope 1 data for DC-West. Natural gas heating: 445 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 125),
    },
    {
      _id: 'demo17',
      type: 'CERTIFICATE_ISSUED',
      detail: 'Certificate #CERT-2025-Q1 issued for period 2025-Q1. Total emissions: 1,203 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 180),
      certificateId: 'CERT-2025-Q1',
      cardanoTxHash: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
      hydraTxId: 'hydra_tx_stuvwx67890'
    },
    {
      _id: 'demo18',
      type: 'REPORT_FROZEN',
      detail: 'Compliance report for 2025-Q1 frozen. Scope 1: 356 tons, Scope 2: 502 tons, Scope 3: 345 tons',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 180 - 1000 * 60 * 60 * 3),
      reportHash: 'QmA7c2Z1y0X9w8V7u6T5s4R3q2P1o0N9m8L7k6J5i4H3g'
    },
    {
      _id: 'demo19',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Vendor "ServerFarm Co" submitted Scope 3 data for DC-East. Hardware manufacturing: 421 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 185),
    },
    {
      _id: 'demo20',
      type: 'EMISSIONS_UPLOADED',
      detail: 'Staff uploaded Scope 2 data for DC-South. Renewable energy purchase: 267 tons CO2e',
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 190),
    }
  ];
};

const ChainExplorerPage = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to fetch from API, but use mock data as fallback
    api
      .get('/api/ledger')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setEvents(res.data);
        } else {
          // Use mock data if API returns empty
          setEvents(getMockEvents());
        }
      })
      .catch((err) => {
        // Use mock data on error
        setEvents(getMockEvents());
        console.log('Using mock blockchain data:', err.message);
      });
  }, []);

  return (
    <MemeLayout title="AUDIT TRAIL" subtitle="Local ledger + on-chain tx references.">
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}
      <Box sx={{ mt: 4, border: '3px solid #0a0a0a', p: 2, bgcolor: '#fff', boxShadow: '5px 5px 0px #0a0a0a', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.FROGGY_MEME} 
          sx={{ 
            position: 'absolute', 
            top: -40, 
            right: -10, 
            width: 90, 
            transform: 'rotate(10deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <BlockchainVisualization events={events} />
      </Box>
    </MemeLayout>
  );
};

export default ChainExplorerPage;
