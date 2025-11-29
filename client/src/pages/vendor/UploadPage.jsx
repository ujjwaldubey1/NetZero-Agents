import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, Divider, Alert, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem } from '@mui/material';
import UploadForm from '../../components/UploadForm';
import api from '../../api';
import MemeLayout from '../../components/MemeLayout';

import { ASSETS } from '../../assets';

const VendorUploadPage = () => {
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [dataCenters, setDataCenters] = useState([]);
  const [filterDc, setFilterDc] = useState('all');

  const loadRecent = async () => {
    try {
      const res = await api.get('/api/emissions/by-period');
      const filtered = res.data.filter((r) => Number(r.scope) === 3);
      setRecent(filtered);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const loadDataCenters = async () => {
    try {
      const res = await api.get('/api/datacenters');
      setDataCenters(res.data || []);
    } catch {
      setDataCenters([]);
    }
  };

  useEffect(() => { loadRecent(); loadDataCenters(); }, []);

  return (
    <MemeLayout
      title="UPLOAD INTEL"
      subtitle="Submit your Scope 3 data."
      bgPattern="repeating-linear-gradient(-45deg, #f5f5f5, #f5f5f5 5px, #ffffff 5px, #ffffff 25px)"
      bgSize="20px 20px"
      sx={{ animation: 'moveVertical 10s linear infinite' }}
    >
      <Card className="glass-card" sx={{ p: 3, bgcolor: '#ffffff', borderColor: '#00f0ff', boxShadow: '8px 8px 0px #00f0ff', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.BLOCK_PUSHING} 
          sx={{ 
            position: 'absolute', 
            top: -40, 
            right: -10, 
            width: 100, 
            transform: 'rotate(5deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Scope 3" sx={{ bgcolor: '#ff0055', color: '#fff', fontWeight: 'bold', border: '1px solid #000' }} />
          <Typography variant="h5" fontWeight={800} fontFamily='"Bangers", sans-serif' letterSpacing={1}>SCOPE 3 DATA</Typography>
        </Stack>
        <Typography variant="body1" sx={{ opacity: 0.7, mt: 1 }}>PDF, Excel, CSV supported. Assigned datacenter required.</Typography>
        <Button sx={{ mt: 2, bgcolor: '#fcee0a', color: '#000', '&:hover': { bgcolor: '#fff' } }} variant="contained" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Hide upload' : 'Add upload'}
        </Button>
      </Card>
      
      {showForm && (
        <Box mt={4} sx={{ border: '3px solid #0a0a0a', p: 3, bgcolor: '#fff', boxShadow: '5px 5px 0px #0a0a0a' }}>
          <UploadForm allowedScopes={[3]} onUploaded={loadRecent} />
        </Box>
      )}

      <Card sx={{ mt: 4, bgcolor: '#ffffff', borderColor: '#0a0a0a', boxShadow: '8px 8px 0px #0a0a0a', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.ANIME_ROBOT} 
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
          <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1}>RECENT UPLOADS</Typography>
          <Divider sx={{ my: 1, borderColor: '#000' }} />
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Typography variant="body2" fontWeight="bold">FILTER BY BASE:</Typography>
            <Button size="small" variant="outlined" onClick={loadRecent} sx={{ color: '#000', borderColor: '#000' }}>Refresh</Button>
            <TextField
              select
              size="small"
              value={filterDc}
              onChange={(e) => setFilterDc(e.target.value)}
              sx={{ minWidth: 180, bgcolor: '#fff' }}
              className="comic-input"
            >
              <MenuItem value="all">All</MenuItem>
              {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
            </TextField>
          </Stack>
          <Table size="small" className="comic-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>DATACENTER</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>PERIOD</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>SUBMITTED</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.filter((r) => filterDc === 'all' || r.dataCenterId === filterDc).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">No uploads yet.</TableCell>
                </TableRow>
              )}
              {recent
                .filter((r) => filterDc === 'all' || r.dataCenterId === filterDc)
                .map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.dataCenterName || '—'}</TableCell>
                  <TableCell>{r.period || '—'}</TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}
    </MemeLayout>
  );
};

export default VendorUploadPage;
