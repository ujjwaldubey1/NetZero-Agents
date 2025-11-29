import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography, Alert, Select, MenuItem, Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import api from '../../api';
import MemeLayout from '../../components/MemeLayout';
import { ASSETS } from '../../assets';


const DataCentersPage = () => {
  const [dataCenters, setDataCenters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: '', location: '' });
  const [assignments, setAssignments] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = async () => {
    try {
      const [dcRes, vendorsRes, staffRes] = await Promise.all([
        api.get('/api/datacenters'),
        api.get('/api/admin/vendors'),
        api.get('/api/admin/staff'),
      ]);
      setDataCenters(dcRes.data);
      setVendors(vendorsRes.data);
      setStaff(staffRes.data);
      const map = {};
      dcRes.data.forEach((dc) => {
        map[dc._id] = {
          vendorIds: (dc.vendorIds || []).map((v) => v._id),
          staffIds: (dc.staffIds || []).map((s) => s._id),
        };
      });
      setAssignments(map);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => { refresh(); }, []);

  const addDataCenter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/datacenters', form);
      setForm({ name: '', location: '' });
      setShowForm(false);
      setMessage('Datacenter added');
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const updateAssignment = async (id) => {
    try {
      const payload = assignments[id] || { vendorIds: [], staffIds: [] };
      await api.put(`/api/datacenters/${id}/assign`, payload);
      setMessage('Assignments updated');
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const setLocalAssignment = (id, key, values) => {
    setAssignments((prev) => ({ ...prev, [id]: { ...(prev[id] || { vendorIds: [], staffIds: [] }), [key]: values } }));
  };

  const staffLookup = useMemo(() => Object.fromEntries(staff.map((s) => [s._id, s.email])), [staff]);
  const vendorLookup = useMemo(() => Object.fromEntries(vendors.map((v) => [v._id, v.vendorName || v.email])), [vendors]);

  return (
    <MemeLayout
      title="DATA CENTERS"
      subtitle="Manage your operational bases."
      bgPattern={`
        linear-gradient(30deg, #e0e0e0 12%, transparent 12.5%, transparent 87%, #e0e0e0 87.5%, #e0e0e0),
        linear-gradient(150deg, #e0e0e0 12%, transparent 12.5%, transparent 87%, #e0e0e0 87.5%, #e0e0e0),
        linear-gradient(30deg, #e0e0e0 12%, transparent 12.5%, transparent 87%, #e0e0e0 87.5%, #e0e0e0),
        linear-gradient(150deg, #e0e0e0 12%, transparent 12.5%, transparent 87%, #e0e0e0 87.5%, #e0e0e0),
        linear-gradient(60deg, #e0e0e077 25%, transparent 25.5%, transparent 75%, #e0e0e077 75%, #e0e0e077),
        linear-gradient(60deg, #e0e0e077 25%, transparent 25.5%, transparent 75%, #e0e0e077 75%, #e0e0e077)
      `}
      bgSize="40px 70px"
      bgPosition="0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px"
      sx={{ animation: 'moveDiagonal 30s linear infinite' }}
    >
      <Stack direction="row" spacing={2} mt={4}>
        <Button 
          variant="contained" 
          onClick={() => setShowForm((s) => !s)}
          sx={{ bgcolor: '#fcee0a', color: '#000', '&:hover': { bgcolor: '#fff' } }}
        >
          {showForm ? 'Hide add datacenter' : 'Add datacenter'}
        </Button>
      </Stack>

      {message && <Alert sx={{ mt: 2, bgcolor: '#00f0ff', color: '#000', border: '2px solid #000' }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}

      {showForm && (
        <Card sx={{ mt: 2, bgcolor: '#ffffff', borderColor: '#fcee0a', boxShadow: '10px 10px 0px #fcee0a', position: 'relative', overflow: 'visible' }}>
          <Box 
            component="img" 
            src={ASSETS.ANIME_ROBOT} 
            sx={{ 
              position: 'absolute', 
              top: -40, 
              right: -20, 
              width: 100, 
              transform: 'rotate(10deg)', 
              zIndex: 10,
              filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
            }} 
          />
          <CardContent>
            <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1}>NEW BASE</Typography>
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              <TextField 
                label="Name" 
                size="small" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                sx={{ bgcolor: '#fff' }}
              />
              <TextField 
                label="Location" 
                size="small" 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
                sx={{ bgcolor: '#fff' }}
              />
              <Button variant="contained" onClick={addDataCenter} color="primary">Save</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 4, bgcolor: '#ffffff', borderColor: '#00f0ff', boxShadow: '10px 10px 0px #00f0ff', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.HERO_DEV} 
          sx={{ 
            position: 'absolute', 
            bottom: -30, 
            right: 10, 
            width: 90, 
            transform: 'rotate(-5deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <CardContent>
          <Typography variant="h6" gutterBottom fontFamily='"Bangers", sans-serif' letterSpacing={1}>ACTIVE BASES</Typography>
          <Table size="small" className="comic-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>NAME</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>LOCATION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataCenters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">No datacenters yet.</TableCell>
                </TableRow>
              )}
              {dataCenters.map((dc) => (
                <TableRow key={dc._id}>
                  <TableCell>{dc.name}</TableCell>
                  <TableCell>{dc.location || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {dataCenters.map((dc) => (
          <Grid key={dc._id} item xs={12} md={6}>
            <Card sx={{ height: '100%', bgcolor: '#ffffff', border: '3px solid #0a0a0a', boxShadow: '8px 8px 0px #0a0a0a' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1}>{dc.name}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>{dc.location || 'Location pending'}</Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => updateAssignment(dc._id)} sx={{ color: '#000', borderColor: '#000', '&:hover': { bgcolor: '#fcee0a' } }}>Save</Button>
                </Stack>

                <Divider sx={{ my: 2, borderColor: '#000' }} />

                <Typography variant="subtitle2" fontWeight="bold">VENDORS ALLOWED</Typography>
                <Select
                  fullWidth
                  multiple
                  size="small"
                  value={assignments[dc._id]?.vendorIds || []}
                  onChange={(e) => setLocalAssignment(dc._id, 'vendorIds', e.target.value)}
                  sx={{ bgcolor: '#fff', mt: 1 }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selected.map((id) => <Chip key={id} label={vendorLookup[id] || id} size="small" sx={{ bgcolor: '#fcee0a', border: '1px solid #000' }} />)}
                    </Box>
                  )}
                >
                  {vendors.map((v) => (
                    <MenuItem key={v._id} value={v._id}>{v.vendorName || v.email}</MenuItem>
                  ))}
                </Select>

                <Typography variant="subtitle2" sx={{ mt: 2 }} fontWeight="bold">STAFF ALLOWED</Typography>
                <Select
                  fullWidth
                  multiple
                  size="small"
                  value={assignments[dc._id]?.staffIds || []}
                  onChange={(e) => setLocalAssignment(dc._id, 'staffIds', e.target.value)}
                  sx={{ bgcolor: '#fff', mt: 1 }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selected.map((id) => <Chip key={id} label={staffLookup[id] || id} size="small" sx={{ bgcolor: '#00f0ff', border: '1px solid #000' }} />)}
                    </Box>
                  )}
                >
                  {staff.map((s) => (
                    <MenuItem key={s._id} value={s._id}>{s.email}</MenuItem>
                  ))}
                </Select>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MemeLayout>
  );
};

export default DataCentersPage;
