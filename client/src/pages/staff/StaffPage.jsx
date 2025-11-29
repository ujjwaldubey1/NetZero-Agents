import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Alert, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Chip, Divider } from '@mui/material';
import api from '../../api';
import MemeLayout from '../../components/MemeLayout';
import { ASSETS } from '../../assets';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ staffEmail: '', staffPassword: '' });
  const [dataCenters, setDataCenters] = useState([]);
  const [staffFilterDc, setStaffFilterDc] = useState('all');
  const [staffDcSelection, setStaffDcSelection] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [s, dcRes] = await Promise.all([
        api.get('/api/admin/staff'),
        api.get('/api/datacenters'),
      ]);
      setStaff(s.data);
      setDataCenters(dcRes.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const addStaff = async () => {
    try {
      const res = await api.post('/api/admin/staff', { email: form.staffEmail, password: form.staffPassword });
      if (staffDcSelection.length) {
        await Promise.all(staffDcSelection.map((dcId) => {
          const dc = dataCenters.find((d) => d._id === dcId);
          const staffIds = Array.from(new Set([...(dc?.staffIds || []).map((s) => s._id || s), res.data._id]));
          return api.put(`/api/datacenters/${dcId}/assign`, { staffIds });
        }));
      }
      setMessage('Staff added');
      setStaffDcSelection([]);
      load();
    } catch (err) { setError(err.response?.data?.error || err.message); }
  };

  const deleteStaff = async (id) => { await api.delete(`/api/admin/staff/${id}`); await pruneAssignments(id, 'staffIds'); load(); };

  const pruneAssignments = async (userId, key) => {
    const updates = dataCenters
      .filter((dc) => (dc[key] || []).some((member) => (member._id || member).toString() === userId.toString()))
      .map((dc) => {
        const staffIds = (dc.staffIds || [])
          .map((s) => s._id || s)
          .filter((id) => !(key === 'staffIds' && id.toString() === userId.toString()));
        return api.put(`/api/datacenters/${dc._id}/assign`, { staffIds });
      });
    if (updates.length) await Promise.all(updates);
  };

  const isStaffInDc = (staffId, dcId) => {
    const dc = dataCenters.find((d) => d._id === dcId);
    if (!dc) return false;
    return (dc.staffIds || []).some((s) => (s._id || s).toString() === staffId.toString());
  };

  const filteredStaff = staffFilterDc === 'all'
    ? staff
    : staff.filter((member) => isStaffInDc(member._id, staffFilterDc));

  return (
    <MemeLayout title="STAFF CONSOLE" subtitle="Manage your team and their access levels.">
      {message && <Alert sx={{ mt: 2, bgcolor: '#00f0ff', color: '#000', border: '2px solid #000' }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}

      <Stack direction="row" spacing={2} mt={4}>
        <Button 
          variant="contained" 
          onClick={() => setShowForm((s) => !s)}
          sx={{ bgcolor: '#fcee0a', color: '#000', '&:hover': { bgcolor: '#fff' } }}
        >
          {showForm ? 'Hide add staff' : 'Add staff'}
        </Button>
      </Stack>

      {showForm && (
        <Card sx={{ mt: 2, bgcolor: '#ffffff', borderColor: '#fcee0a', boxShadow: '10px 10px 0px #fcee0a', position: 'relative', overflow: 'visible' }}>
          <Box 
            component="img" 
            src={ASSETS.HERO_DEV} 
            sx={{ 
              position: 'absolute', 
              top: -30, 
              right: -20, 
              width: 100, 
              transform: 'rotate(10deg)', 
              zIndex: 10,
              filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
            }} 
          />
          <CardContent>
            <Typography variant="h6" color="#0a0a0a" fontFamily='"Bangers", sans-serif' letterSpacing={1}>NEW RECRUIT</Typography>
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              <TextField 
                label="Email" 
                size="small" 
                value={form.staffEmail} 
                onChange={(e) => setForm({ ...form, staffEmail: e.target.value })} 
                sx={{ bgcolor: '#fff' }}
              />
              <TextField 
                label="Password" 
                size="small" 
                value={form.staffPassword} 
                onChange={(e) => setForm({ ...form, staffPassword: e.target.value })} 
                sx={{ bgcolor: '#fff' }}
              />
              <Select
                multiple
                size="small"
                value={staffDcSelection}
                onChange={(e) => setStaffDcSelection(e.target.value)}
                displayEmpty
                sx={{ bgcolor: '#fff', minWidth: 200 }}
                renderValue={(selected) => selected.length ? selected.map((id) => dataCenters.find((d) => d._id === id)?.name || id).join(', ') : 'Assign datacenters'}
              >
                {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
              </Select>
              <Button variant="contained" onClick={addStaff} color="primary">Save</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 4, bgcolor: '#ffffff', borderColor: '#00f0ff', boxShadow: '10px 10px 0px #00f0ff', position: 'relative', overflow: 'visible' }}>
        <Box 
          component="img" 
          src={ASSETS.SIDEKICK_AI} 
          sx={{ 
            position: 'absolute', 
            bottom: -20, 
            right: 10, 
            width: 80, 
            transform: 'rotate(-5deg)', 
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
          }} 
        />
        <CardContent>
          <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1}>ACTIVE AGENTS</Typography>
          <Divider sx={{ my: 1, borderColor: '#000' }} />
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Typography variant="body2" fontWeight="bold">FILTER BY BASE:</Typography>
            <Select size="small" value={staffFilterDc} onChange={(e) => setStaffFilterDc(e.target.value)} sx={{ minWidth: 150 }} className="comic-input">
              <MenuItem value="all">All Bases</MenuItem>
              {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
            </Select>
          </Stack>
          <Table size="small" className="comic-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>AGENT EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>ASSIGNED BASES</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.length === 0 && (
                <TableRow><TableCell colSpan={3} align="center">No staff yet.</TableCell></TableRow>
              )}
              {filteredStaff.map((v) => (
                <TableRow key={v._id}>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {dataCenters.filter((dc) => isStaffInDc(v._id, dc._id)).map((dc) => (
                        <Chip key={dc._id} size="small" label={dc.name} sx={{ bgcolor: '#fcee0a', fontWeight: 'bold', border: '1px solid #000' }} />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell><Button size="small" color="error" onClick={() => deleteStaff(v._id)}>Delete</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MemeLayout>
  );
};

export default StaffPage;
