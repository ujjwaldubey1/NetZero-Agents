import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Divider, Select, Chip } from '@mui/material';
import api from '../../api';
import MemeLayout from '../../components/MemeLayout';

import { ASSETS } from '../../assets';

const InviteVendorsPage = () => {
  const [dataCenters, setDataCenters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterDc, setFilterDc] = useState('all');

  // Form state
  const [form, setForm] = useState({ vendorEmail: '', vendorName: '' });
  const [vendorDcSelection, setVendorDcSelection] = useState([]);

  const load = async () => {
    try {
      const [d, v] = await Promise.all([api.get('/api/datacenters'), api.get('/api/admin/vendors')]);
      setDataCenters(d.data);
      setVendors(v.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const inviteVendor = async () => {
    try {
      const res = await api.post('/api/users/invite-vendor', { 
        email: form.vendorEmail, 
        vendorName: form.vendorName, 
        dataCenterIds: vendorDcSelection 
      });
      setLink(res.data.inviteLink);
      setForm({ vendorEmail: '', vendorName: '' });
      setVendorDcSelection([]);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <MemeLayout title="VENDOR RECRUITMENT" subtitle="Expand your alliance.">
      <Stack direction="row" spacing={2} mt={4}>
        <Button 
          variant="contained" 
          onClick={() => setShowForm((s) => !s)}
          sx={{ bgcolor: '#fcee0a', color: '#000', '&:hover': { bgcolor: '#fff' } }}
        >
          {showForm ? 'Hide invite form' : 'Add vendor'}
        </Button>
      </Stack>

      {showForm && (
        <Card sx={{ mt: 4, bgcolor: '#ffffff', borderColor: '#00f0ff', boxShadow: '10px 10px 0px #00f0ff', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.ANIME_IRONMAN} 
          sx={{ 
            position: 'absolute', 
            top: -40, 
            right: -20, 
            width: 90, 
            transform: 'rotate(15deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <CardContent>
          <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1}>NEW VENDOR</Typography>
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
            <TextField 
              label="Email" 
              size="small" 
              value={form.vendorEmail} 
              onChange={(e) => setForm({ ...form, vendorEmail: e.target.value })} 
              sx={{ bgcolor: '#fff' }}
            />
            <TextField 
              label="Vendor Name" 
              size="small" 
              value={form.vendorName} 
              onChange={(e) => setForm({ ...form, vendorName: e.target.value })} 
              sx={{ bgcolor: '#fff' }}
            />
            <Select
              multiple
              size="small"
              value={vendorDcSelection}
              onChange={(e) => setVendorDcSelection(e.target.value)}
              displayEmpty
              sx={{ bgcolor: '#fff', minWidth: 200 }}
              renderValue={(selected) => selected.length ? selected.map((id) => dataCenters.find((d) => d._id === id)?.name || id).join(', ') : 'Assign datacenters'}
            >
              {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
            </Select>
            <Button variant="contained" onClick={inviteVendor} color="primary">Invite</Button>
          </Stack>
        </CardContent>
      </Card>
      )}
      {link && <Alert sx={{ mt: 2, bgcolor: '#00f0ff', color: '#000', border: '2px solid #000' }}>Invite link: {link}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}

      <Card sx={{ mt: 4, bgcolor: '#ffffff', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.VILLAIN_BUG} 
          sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: -20, 
            width: 100, 
            transform: 'rotate(-10deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <CardContent>
          <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1}>ALLIES LIST</Typography>
          <Divider sx={{ my: 1, borderColor: '#000' }} />
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Typography variant="body2" fontWeight="bold">FILTER BY BASE:</Typography>
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
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>NAME</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>ASSIGNED BASES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.filter((v) => filterDc === 'all' || (v.dataCenterIds || []).includes(filterDc)).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">No vendors yet.</TableCell>
                </TableRow>
              )}
              {vendors
                .filter((v) => filterDc === 'all' || (v.dataCenterIds || []).includes(filterDc))
                .map((v) => (
                <TableRow key={v._id}>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>{v.vendorName || '—'}</TableCell>
                  <TableCell>
                    {(v.dataCenterIds || []).map((id) => {
                      const dc = dataCenters.find((d) => d._id === id);
                      return dc ? <Chip key={id} label={dc.name} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: '#fcee0a', color: '#000', fontWeight: 'bold', border: '1px solid #000' }} /> : id;
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MemeLayout>
  );
};

export default InviteVendorsPage;
