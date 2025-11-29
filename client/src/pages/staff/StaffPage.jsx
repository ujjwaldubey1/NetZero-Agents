import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Alert, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
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
      setForm({ staffEmail: '', staffPassword: '' });
      setStaffDcSelection([]);
      setShowForm(false);
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="contained" 
            onClick={() => setShowForm((s) => !s)}
            sx={{ 
              bgcolor: '#fcee0a', 
              color: '#000', 
              fontWeight: 'bold',
              border: '3px solid #0a0a0a',
              boxShadow: '5px 5px 0px #0a0a0a',
              '&:hover': { bgcolor: '#fff', boxShadow: '7px 7px 0px #0a0a0a' } 
            }}
          >
            {showForm ? 'Hide add staff' : 'Add staff'}
          </Button>
        </motion.div>
      </Stack>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Card sx={{ 
            mt: 2, 
            bgcolor: '#ffffff', 
            border: '4px solid #fcee0a',
            boxShadow: '10px 10px 0px #fcee0a', 
            position: 'relative', 
            overflow: 'visible',
            background: `
              linear-gradient(135deg, #ffffff 25%, transparent 25%),
              linear-gradient(225deg, #ffffff 25%, transparent 25%),
              linear-gradient(45deg, #ffffff 25%, transparent 25%),
              linear-gradient(315deg, #ffffff 25%, #fffef0 25%)
            `,
            backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
            backgroundSize: '20px 20px',
            backgroundRepeat: 'repeat'
          }}>
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
              <Typography variant="h6" color="#0a0a0a" fontFamily='"Bangers", sans-serif' letterSpacing={1} sx={{ textShadow: '2px 2px 0px #fcee0a' }}>
                NEW RECRUIT
              </Typography>
              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                <TextField 
                  label="Email" 
                  size="small" 
                  value={form.staffEmail} 
                  onChange={(e) => setForm({ ...form, staffEmail: e.target.value })} 
                  sx={{ bgcolor: '#fff', border: '2px solid #0a0a0a', borderRadius: 1 }}
                />
                <TextField 
                  label="Password" 
                  size="small" 
                  type="password"
                  value={form.staffPassword} 
                  onChange={(e) => setForm({ ...form, staffPassword: e.target.value })} 
                  sx={{ bgcolor: '#fff', border: '2px solid #0a0a0a', borderRadius: 1 }}
                />
                <Select
                  multiple
                  size="small"
                  value={staffDcSelection}
                  onChange={(e) => setStaffDcSelection(e.target.value)}
                  displayEmpty
                  sx={{ bgcolor: '#fff', minWidth: 200, border: '2px solid #0a0a0a', borderRadius: 1 }}
                  renderValue={(selected) => selected.length ? selected.map((id) => dataCenters.find((d) => d._id === id)?.name || id).join(', ') : 'Assign datacenters'}
                >
                  {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
                </Select>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="contained" 
                    onClick={addStaff} 
                    color="primary"
                    sx={{ fontWeight: 'bold', border: '2px solid #0a0a0a' }}
                  >
                    Save
                  </Button>
                </motion.div>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card sx={{ 
          mt: 4, 
          bgcolor: '#ffffff', 
          border: '4px solid #00f0ff',
          boxShadow: '10px 10px 0px #00f0ff', 
          position: 'relative', 
          overflow: 'visible',
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(252, 238, 10, 0.1) 0%, transparent 50%),
            #ffffff
          `
        }}>
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
            <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1} sx={{ color: '#0a0a0a', textShadow: '2px 2px 0px #00f0ff' }}>
              ACTIVE AGENTS
            </Typography>
            <Divider sx={{ my: 1, borderColor: '#0a0a0a', borderWidth: 2 }} />
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Typography variant="body2" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif'>FILTER BY BASE:</Typography>
              <Select 
                size="small" 
                value={staffFilterDc} 
                onChange={(e) => setStaffFilterDc(e.target.value)} 
                sx={{ minWidth: 150, border: '2px solid #0a0a0a', borderRadius: 1 }} 
                className="comic-input"
              >
                <MenuItem value="all">All Bases</MenuItem>
                {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
              </Select>
            </Stack>
            <Box sx={{ 
              border: '3px solid #0a0a0a',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Table size="small" className="comic-table">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0a0a0a' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"', color: '#fff' }}>AGENT EMAIL</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"', color: '#fff' }}>ASSIGNED BASES</TableCell>
                    <TableCell sx={{ color: '#fff' }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaff.length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center">No staff yet.</TableCell></TableRow>
                  )}
                  {filteredStaff.map((v, index) => (
                    <motion.tr
                      key={v._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      component={TableRow}
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(252, 238, 10, 0.2)' },
                        borderBottom: '2px solid #e0e0e0'
                      }}
                    >
                      <TableCell sx={{ fontFamily: '"Space Grotesk"' }}>{v.email}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {dataCenters.filter((dc) => isStaffInDc(v._id, dc._id)).map((dc) => (
                            <Chip key={dc._id} size="small" label={dc.name} sx={{ bgcolor: '#fcee0a', fontWeight: 'bold', border: '2px solid #0a0a0a' }} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => deleteStaff(v._id)}
                            sx={{ fontWeight: 'bold', border: '2px solid', borderRadius: 1 }}
                          >
                            Delete
                          </Button>
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </MemeLayout>
  );
};

export default StaffPage;
