import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography, Alert } from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const UploadForm = ({ defaultScope = 1, defaultPeriod = '2025-Q4', allowedScopes = [1, 2, 3], onUploaded }) => {
  const { user } = useAuth();
  const [scope, setScope] = useState(defaultScope || allowedScopes[0]);
  const [period, setPeriod] = useState(defaultPeriod);
  const [file, setFile] = useState(null);
  const [dataCenters, setDataCenters] = useState([]);
  const [dataCenterId, setDataCenterId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const needsDatacenter = ['vendor', 'staff'].includes(user?.role);
  const blocked = needsDatacenter && !dataCenters.length;

  useEffect(() => {
    if (!allowedScopes.includes(scope)) {
      setScope(allowedScopes[0]);
    }
  }, [allowedScopes, scope]);

  useEffect(() => {
    api.get('/api/datacenters')
      .then((res) => {
        const list = res.data || [];
        setDataCenters(list);
        if (list.length === 1) {
          setDataCenterId(list[0]._id);
        } else if (!list.find((dc) => dc._id === dataCenterId)) {
          setDataCenterId('');
        }
      })
      .catch(() => {
        setDataCenters([]);
        setDataCenterId('');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please choose a file');
    if (dataCenters.length && !dataCenterId) return setError('Select a datacenter');
    if (needsDatacenter && !dataCenters.length) return setError('No datacenter assigned yet.');
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    form.append('scope', scope);
    form.append('period', period);
    if (dataCenterId) form.append('dataCenterId', dataCenterId);
    try {
      const res = await api.post('/api/emissions/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      onUploaded && onUploaded(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Upload data</Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" gap={2} flexWrap="wrap" alignItems="center" mt={2}>
          <TextField select label="Scope" value={scope} onChange={(e) => setScope(e.target.value)} sx={{ minWidth: 160 }}>
            {allowedScopes.includes(1) && <MenuItem value={1}>Scope 1</MenuItem>}
            {allowedScopes.includes(2) && <MenuItem value={2}>Scope 2</MenuItem>}
            {allowedScopes.includes(3) && <MenuItem value={3}>Scope 3</MenuItem>}
          </TextField>
          <TextField label="Period" value={period} onChange={(e) => setPeriod(e.target.value)} sx={{ minWidth: 160 }} />
          <TextField
            select
            label="Datacenter"
            value={dataCenterId}
            onChange={(e) => setDataCenterId(e.target.value)}
            sx={{ minWidth: 200 }}
            helperText={dataCenters.length ? 'Choose where this upload belongs' : 'No datacenter set, using default'}
          >
            <MenuItem value="">Select</MenuItem>
            {dataCenters.map((dc) => <MenuItem key={dc._id} value={dc._id}>{dc.name}</MenuItem>)}
          </TextField>
          <Button variant="contained" component="label">
            Choose file
            <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
          </Button>
          <Button type="submit" variant="contained" disabled={loading || blocked}>{loading ? 'Uploading...' : 'Upload & AI-parse'}</Button>
        </Box>
        {blocked && <Alert severity="warning" sx={{ mt: 2 }}>Ask the operator to assign you to a datacenter before uploading.</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {result && (
          <Box mt={3}>
            <Typography variant="subtitle1">AI Summary</Typography>
            <Typography variant="body2">{result.summary}</Typography>
            <Typography variant="subtitle2" mt={2}>Structured data</Typography>
            <pre style={{ background: '#0b1223', padding: 12, borderRadius: 8, overflow: 'auto' }}>{JSON.stringify(result.structured, null, 2)}</pre>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadForm;
