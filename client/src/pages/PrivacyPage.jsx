import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from '@mui/material';
import api from '../api';
import MemeLayout from '../components/MemeLayout';

import { ASSETS } from '../assets';

const PrivacyPage = () => {
  const [proofId, setProofId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const verify = async () => {
    try {
      const res = await api.post('/api/zk/verify', { proofId });
      setResult(res.data.verified);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <MemeLayout
      title="PRIVACY / ZK DEMO"
      subtitle="Prove vendor emissions below threshold without revealing values."
      bgPattern={`
        conic-gradient(
          #e0e0e0 90deg,
          #ffffff 90deg 180deg,
          #e0e0e0 180deg 270deg,
          #ffffff 270deg
        )
      `}
      bgSize="60px 60px"
      sx={{ animation: 'moveDiagonal 4s linear infinite' }}
    >
      <Card sx={{ mt: 4, bgcolor: '#ffffff', borderColor: '#00f0ff', boxShadow: '10px 10px 0px #00f0ff', position: 'relative', overflow: 'visible' }}>
        <Box
          component="img"
          src={ASSETS.VILLAIN_BUG}
          sx={{
            position: 'absolute',
            top: -40,
            right: -10,
            width: 100,
            transform: 'rotate(10deg)',
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }}
        />
        <CardContent>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems="center">
            <TextField label="Proof ID" value={proofId} onChange={(e) => setProofId(e.target.value)} sx={{ minWidth: 260, bgcolor: '#fff' }} />
            <Button variant="contained" onClick={verify} color="primary" sx={{ height: '56px' }}>Verify proof</Button>
          </Stack>
          {result !== null && <Alert sx={{ mt: 2, border: '2px solid #000' }} severity={result ? 'success' : 'error'}>{result ? 'Proof valid' : 'Proof invalid'}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}
        </CardContent>
      </Card>
    </MemeLayout>
  );
};

export default PrivacyPage;
