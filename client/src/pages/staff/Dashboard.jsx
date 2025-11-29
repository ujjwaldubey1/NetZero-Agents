import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, Divider, Table, TableHead, TableBody, TableCell, TableRow, Grid } from '@mui/material';
import UploadForm from '../../components/UploadForm';
import api from '../../api';

const StaffDashboard = () => {
  const [recent, setRecent] = useState([]);

  const loadRecent = async () => {
    const res = await api.get('/api/emissions/by-period');
    const filtered = res.data.filter((r) => [1, 2].includes(Number(r.scope)));
    setRecent(filtered.slice(0, 8));
  };

  useEffect(() => { loadRecent(); }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        background: 'radial-gradient(circle at 20% 20%, rgba(0,240,255,0.08), transparent 25%), radial-gradient(circle at 80% 10%, rgba(255,0,85,0.08), transparent 25%), #0b0f1a',
        color: '#fff',
      }}
    >
      <Box
        sx={{
          mb: 4,
          border: '3px solid #0a0a0a',
          boxShadow: '10px 10px 0px #00f0ff',
          p: { xs: 2, md: 3 },
          bgcolor: '#111727',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 2, textShadow: '2px 2px 0 #00f0ff' }}>
              STAFF MISSION BAY
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 640, mt: 1 }}>
              Double-drop your evidence: Scope 1 and Scope 2 uploads live here. Pick the right datacenter and fire the AI parser.
            </Typography>
          </Box>
          <Chip label="STAFF" color="primary" variant="outlined" sx={{ border: '2px solid #00f0ff', color: '#00f0ff', fontWeight: 700 }} />
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '3px solid #0a0a0a', boxShadow: '8px 8px 0 #00f0ff' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 1 }}>Scope 1 Upload</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>Combustion, fuel, chillers — drop it here.</Typography>
              <UploadForm allowedScopes={[1]} defaultScope={1} onUploaded={loadRecent} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '3px solid #0a0a0a', boxShadow: '8px 8px 0 #ff0055' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 1 }}>Scope 2 Upload</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>Electricity, grid, renewables — drop it here.</Typography>
              <UploadForm allowedScopes={[2]} defaultScope={2} onUploaded={loadRecent} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3, border: '3px solid #0a0a0a', boxShadow: '8px 8px 0 #fcee0a' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 1 }}>Recent drops</Typography>
          <Divider sx={{ my: 1, borderColor: '#0a0a0a' }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Scope</TableCell>
                <TableCell>Datacenter</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No uploads yet.</TableCell>
                </TableRow>
              )}
              {recent.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.scope}</TableCell>
                  <TableCell>{r.dataCenterName || '—'}</TableCell>
                  <TableCell>{r.period || '—'}</TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StaffDashboard;
