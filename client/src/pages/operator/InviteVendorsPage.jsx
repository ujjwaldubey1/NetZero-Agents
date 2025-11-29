import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Divider, Select, Chip } from '@mui/material';
import { motion } from 'framer-motion';
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
            {showForm ? 'Hide invite form' : 'Add vendor'}
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
            mt: 4, 
            bgcolor: '#ffffff', 
            border: '4px solid #00f0ff',
            boxShadow: '10px 10px 0px #00f0ff', 
            position: 'relative', 
            overflow: 'visible',
            background: `
              repeating-linear-gradient(
                45deg,
                #ffffff,
                #ffffff 10px,
                #f0ffff 10px,
                #f0ffff 20px
              )
            `
          }}>
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
              <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1} sx={{ color: '#0a0a0a', textShadow: '2px 2px 0px #00f0ff' }}>
                NEW VENDOR
              </Typography>
              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                <TextField 
                  label="Email" 
                  size="small" 
                  value={form.vendorEmail} 
                  onChange={(e) => setForm({ ...form, vendorEmail: e.target.value })} 
                  sx={{ bgcolor: '#fff', border: '2px solid #0a0a0a', borderRadius: 1 }}
                />
                <TextField 
                  label="Vendor Name" 
                  size="small" 
                  value={form.vendorName} 
                  onChange={(e) => setForm({ ...form, vendorName: e.target.value })} 
                  sx={{ bgcolor: '#fff', border: '2px solid #0a0a0a', borderRadius: 1 }}
                />
                <Select
                  multiple
                  size="small"
                  value={vendorDcSelection}
                  onChange={(e) => setVendorDcSelection(e.target.value)}
                  displayEmpty
                  sx={{ bgcolor: '#fff', minWidth: 200, border: '2px solid #0a0a0a', borderRadius: 1 }}
                  renderValue={(selected) => selected.length ? selected.map((id) => dataCenters.find((d) => d._id === id)?.name || id).join(', ') : 'Assign datacenters'}
                >
                  {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
                </Select>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="contained" 
                    onClick={inviteVendor} 
                    color="primary"
                    sx={{ fontWeight: 'bold', border: '2px solid #0a0a0a' }}
                  >
                    Invite
                  </Button>
                </motion.div>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {link && <Alert sx={{ mt: 2, bgcolor: '#00f0ff', color: '#000', border: '3px solid #000', fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>Invite link: {link}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>{error}</Alert>}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card sx={{ 
          mt: 4, 
          bgcolor: '#ffffff', 
          border: '4px solid #ff0055',
          boxShadow: '10px 10px 0px #ff0055',
          position: 'relative', 
          overflow: 'visible',
          background: `
            radial-gradient(circle at 10% 20%, rgba(255, 0, 85, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
            linear-gradient(to bottom, #ffffff 0%, #fffaf0 100%)
          `
        }}>
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
            <Typography variant="h6" fontFamily='"Bangers", sans-serif' letterSpacing={1} sx={{ color: '#0a0a0a', textShadow: '2px 2px 0px #ff0055' }}>
              ALLIES LIST
            </Typography>
            <Divider sx={{ my: 1, borderColor: '#0a0a0a', borderWidth: 2 }} />
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Typography variant="body2" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif'>FILTER BY BASE:</Typography>
              <TextField
                select
                size="small"
                value={filterDc}
                onChange={(e) => setFilterDc(e.target.value)}
                sx={{ minWidth: 180, bgcolor: '#fff', border: '2px solid #0a0a0a', borderRadius: 1 }}
                className="comic-input"
              >
                <MenuItem value="all">All</MenuItem>
                {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
              </TextField>
            </Stack>
            <Box sx={{ 
              border: '3px solid #0a0a0a',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Table size="small" className="comic-table">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0a0a0a' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"', color: '#fff' }}>EMAIL</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"', color: '#fff' }}>NAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"', color: '#fff' }}>ASSIGNED BASES</TableCell>
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
                    .map((v, index) => (
                      <motion.tr
                        key={v._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        component={TableRow}
                        sx={{ 
                          '&:hover': { bgcolor: 'rgba(255, 0, 85, 0.1)' },
                          borderBottom: '2px solid #e0e0e0'
                        }}
                      >
                        <TableCell sx={{ fontFamily: '"Space Grotesk"' }}>{v.email}</TableCell>
                        <TableCell sx={{ fontFamily: '"Space Grotesk"' }}>{v.vendorName || '—'}</TableCell>
                        <TableCell>
                          {(v.dataCenterIds || []).map((id) => {
                            const dc = dataCenters.find((d) => d._id === id);
                            return dc ? <Chip key={id} label={dc.name} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: '#fcee0a', color: '#000', fontWeight: 'bold', border: '2px solid #0a0a0a' }} /> : id;
                          })}
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

export default InviteVendorsPage;
