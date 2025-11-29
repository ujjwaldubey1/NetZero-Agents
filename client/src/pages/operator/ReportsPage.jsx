import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography, Alert, Chip } from '@mui/material';
import api from '../../api';
import ReportTable from '../../components/ReportTable';
import MemeLayout from '../../components/MemeLayout';

import { ASSETS } from '../../assets';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    const res = await api.get('/api/reports');
    setReports(res.data);
  };

  useEffect(() => { load(); }, []);

  const freeze = async (period) => {
    try {
      const res = await api.post('/api/reports/freeze', { period });
      setMessage(`Report ${period} frozen`);
      setReports((prev) => prev.map((r) => (r._id === res.data._id ? res.data : r)));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const generateNarrative = async (id) => {
    try {
      const res = await api.post('/api/reports/generate-narrative', { reportId: id });
      setMessage('Narrative generated');
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, aiNarrative: res.data.narrative } : r)));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <MemeLayout title="COMPLIANCE REPORTS" subtitle="Freeze, narrate, and certify per period.">
      <Card sx={{ p: 3, mb: 2, bgcolor: '#ffffff', borderColor: '#0a0a0a', boxShadow: '8px 8px 0px #0a0a0a', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.STRESSED_MANAGER} 
          sx={{ 
            position: 'absolute', 
            top: -30, 
            right: -10, 
            width: 120, 
            transform: 'rotate(5deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Reports" sx={{ bgcolor: '#00f0ff', color: '#000', fontWeight: 'bold', border: '1px solid #000' }} />
          <Typography variant="h5" fontWeight={800} fontFamily='"Bangers", sans-serif' letterSpacing={1}>COMPLIANCE LOGS</Typography>
        </Stack>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>Official records of carbon emissions.</Typography>
      </Card>

      {message && <Alert sx={{ mt: 2, bgcolor: '#00f0ff', color: '#000', border: '2px solid #000' }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}
      
      <Box sx={{ mt: 4, border: '3px solid #0a0a0a', p: 2, bgcolor: '#fff', boxShadow: '5px 5px 0px #0a0a0a' }}>
        <ReportTable reports={reports} />
      </Box>

      <Stack direction="row" spacing={2} mt={4} flexWrap="wrap">
        {reports.map((r) => (
          <Stack key={r._id} spacing={1} direction="row">
            <Button size="small" variant="outlined" onClick={() => freeze(r.period)} sx={{ color: '#000', borderColor: '#000', '&:hover': { bgcolor: '#fcee0a' } }}>Freeze {r.period}</Button>
            <Button size="small" variant="contained" onClick={() => generateNarrative(r._id)} color="primary">Narrative</Button>
          </Stack>
        ))}
      </Stack>

      {reports.find((r) => r.aiNarrative) && (
        <Card sx={{ mt: 4, bgcolor: '#ffffff', borderColor: '#ff0055', boxShadow: '10px 10px 0px #ff0055', position: 'relative', overflow: 'visible' }}>
          <Box 
            component="img" 
            src={ASSETS.SIDEKICK_AI} 
            sx={{ 
              position: 'absolute', 
              bottom: -20, 
              left: -20, 
              width: 80, 
              transform: 'rotate(-10deg)', 
              zIndex: 10,
              filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
            }} 
          />
          <CardContent>
            <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1} color="#ff0055">AI NARRATIVE</Typography>
            <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk"', mt: 1 }}>{reports.find((r) => r.aiNarrative)?.aiNarrative}</Typography>
          </CardContent>
        </Card>
      )}
    </MemeLayout>
  );
};

export default ReportsPage;
