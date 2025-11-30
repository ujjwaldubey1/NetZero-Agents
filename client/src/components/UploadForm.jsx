import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography, Alert, Stack } from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const UploadForm = ({ defaultScope = 1, defaultPeriod = '2025-Q4', allowedScopes = [1, 2, 3], onUploaded }) => {
  const { user } = useAuth();
  const [scope, setScope] = useState(defaultScope || allowedScopes[0]);
  const getInitialYearQuarter = (value) => {
    const match = `${value}`.match(/(\d{4})-Q([1-4])/);
    if (match) return { year: match[1], quarter: match[2] };
    const now = new Date();
    const year = now.getFullYear().toString();
    const quarter = Math.ceil((now.getMonth() + 1) / 3).toString();
    return { year, quarter };
  };
  const initial = getInitialYearQuarter(defaultPeriod);
  const [year, setYear] = useState(initial.year);
  const [quarter, setQuarter] = useState(initial.quarter);
  const [period, setPeriod] = useState(`${initial.year}-Q${initial.quarter}`);
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

  useEffect(() => {
    setPeriod(`${year}-Q${quarter}`);
  }, [year, quarter]);

  const handlePeriodChange = (value) => {
    setPeriod(value);
    const match = value.match(/(\d{4})-Q([1-4])/);
    if (match) {
      setYear(match[1]);
      setQuarter(match[2]);
    }
  };

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
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
          Manual trigger: pick the exact year and quarter you want to send with this upload (expected format: YYYY-Q#).
        </Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" gap={2} flexWrap="wrap" alignItems="center" mt={2}>
          <TextField select label="Scope" value={scope} onChange={(e) => setScope(e.target.value)} sx={{ minWidth: 160 }}>
            {allowedScopes.includes(1) && <MenuItem value={1}>Scope 1</MenuItem>}
            {allowedScopes.includes(2) && <MenuItem value={2}>Scope 2</MenuItem>}
            {allowedScopes.includes(3) && <MenuItem value={3}>Scope 3</MenuItem>}
          </TextField>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value || '')}
              sx={{ width: 120 }}
              inputProps={{ min: 2000, max: 2100, placeholder: '2025' }}
            />
            <TextField
              select
              label="Quarter"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              sx={{ width: 140 }}
            >
              <MenuItem value="1">Q1 (Jan-Mar)</MenuItem>
              <MenuItem value="2">Q2 (Apr-Jun)</MenuItem>
              <MenuItem value="3">Q3 (Jul-Sep)</MenuItem>
              <MenuItem value="4">Q4 (Oct-Dec)</MenuItem>
            </TextField>
          </Stack>
          <TextField
            label="Period (auto)"
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            sx={{ minWidth: 200 }}
            placeholder="2025-Q1"
            helperText="We expect YYYY-Q# (e.g., 2025-Q1). Adjust above if you need a different quarter."
          />
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
            <Alert severity="success">Upload successful!</Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadForm;
