import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography, Alert, Stack } from '@mui/material';
import api from '../../api';
import MemeLayout from '../../components/MemeLayout';

import { ASSETS } from '../../assets';

const CertificatePage = () => {
  const [reports, setReports] = useState([]);
  const [certs, setCerts] = useState([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    const [r, c] = await Promise.all([api.get('/api/reports'), api.get('/api/certificates')]);
    setReports(r.data);
    setCerts(c.data);
    if (r.data.length) setSelected(r.data[0]._id);
  };

  useEffect(() => { load(); }, []);

  const issue = async () => {
    try {
      const res = await api.post('/api/certificates/issue', { reportId: selected });
      setMessage(`Certificate issued. tx ${res.data.cardanoTxHash || 'pending'}`);
      setCerts((prev) => [res.data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <MemeLayout title="CERTIFICATES" subtitle="Mint proof of compliance on Cardano.">
      {message && <Alert sx={{ mt: 2, bgcolor: '#00f0ff', color: '#000', border: '2px solid #000' }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}
      
      <Card sx={{ mt: 4, bgcolor: '#ffffff', borderColor: '#fcee0a', boxShadow: '10px 10px 0px #fcee0a', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.CARDANO_MEME} 
          sx={{ 
            position: 'absolute', 
            top: -30, 
            right: -20, 
            width: 70, 
            transform: 'rotate(15deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField 
              select 
              label="Frozen report" 
              value={selected} 
              onChange={(e) => setSelected(e.target.value)} 
              sx={{ minWidth: 240, bgcolor: '#fff' }}
            >
              {reports.filter((r) => r.status === 'frozen').map((r) => (
                <MenuItem key={r._id} value={r._id}>{r.period}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={issue} color="primary" sx={{ height: '56px' }}>Issue Certificate (Cardano)</Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h5" mt={6} fontFamily='"Bangers", sans-serif' letterSpacing={1}>ISSUED CERTIFICATES</Typography>
      {certs.map((c) => (
        <Card key={c._id} sx={{ mt: 2, bgcolor: '#ffffff', borderColor: '#0a0a0a', boxShadow: '5px 5px 0px #0a0a0a', position: 'relative', overflow: 'visible' }}>
          <Box 
            component="img" 
            src={ASSETS.HERO_AWAKENING} 
            sx={{ 
              position: 'absolute', 
              bottom: -10, 
              right: 10, 
              width: 80, 
              opacity: 0.8,
              transform: 'rotate(-5deg)', 
              zIndex: 10
            }} 
          />
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">PERIOD {c.period || ''}</Typography>
            <Typography variant="body2" fontFamily='"Space Grotesk"'>Report hash: {c.reportHash}</Typography>
            <Typography variant="body2" fontFamily='"Space Grotesk"'>Cardano tx: {c.cardanoTxHash || 'not submitted'}</Typography>
            <Typography variant="body2" fontFamily='"Space Grotesk"'>CIP-68 carbon token: {c.hydraTxId || 'n/a'}</Typography>
            <Typography variant="body2" fontFamily='"Space Grotesk"'>Mausami fee (ADA): {c.mausamiFeeAda ?? 'n/a'}</Typography>
            {c.mausamiNote && (
              <Typography variant="body2" fontFamily='"Space Grotesk"'>Agent note: {c.mausamiNote}</Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </MemeLayout>
  );
};

export default CertificatePage;
