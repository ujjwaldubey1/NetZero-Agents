import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { getComplianceLogs, getPeriodDetails, fetchDataCenters } from '../../api';
import ReportTable from '../../components/ReportTable';
import ReportViewModal from '../../components/ReportViewModal';
import MemeLayout from '../../components/MemeLayout';
import { ASSETS } from '../../assets';

const ReportsPage = () => {
  const [tableRows, setTableRows] = useState([]);
  const [viewPayloads, setViewPayloads] = useState({});
  const [datacenters, setDatacenters] = useState([]);
  const [selectedDatacenter, setSelectedDatacenter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState(null);

  // Load datacenters
  useEffect(() => {
    const loadDatacenters = async () => {
      try {
        const res = await fetchDataCenters();
        const dcData = res.data?.data || res.data || [];
        const dcList = Array.isArray(dcData) ? dcData : [];
        setDatacenters(dcList);
        
        // Auto-select first datacenter
        if (dcList.length > 0) {
          setSelectedDatacenter(dcList[0].name || dcList[0]._id);
        }
      } catch (err) {
        console.error('Failed to load datacenters:', err);
        setError('Failed to load datacenters');
      }
    };
    
    loadDatacenters();
  }, []);

  // Load compliance logs when datacenter is selected
  useEffect(() => {
    if (selectedDatacenter) {
      loadComplianceLogs();
    }
  }, [selectedDatacenter]);

  const loadComplianceLogs = async () => {
    if (!selectedDatacenter) {
      setError('Please select a datacenter');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const res = await getComplianceLogs(selectedDatacenter);
      
      if (res.data.success) {
        setTableRows(res.data.tableRows || []);
        setViewPayloads(res.data.viewPayloads || {});
        
        if (res.data.tableRows.length === 0) {
          setMessage(`No compliance logs found for datacenter: ${selectedDatacenter}`);
        }
      } else {
        setError(res.data.error || 'Failed to load compliance logs');
      }
    } catch (err) {
      console.error('Failed to load compliance logs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load compliance logs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (period) => {
    try {
      setSelectedPeriod(period);
      setLoading(true);
      setError(null);

      // First try to get from viewPayloads (already loaded)
      if (viewPayloads[period]) {
        setSelectedReportData(viewPayloads[period]);
        setViewModalOpen(true);
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      const res = await getPeriodDetails(period, selectedDatacenter);
      
      if (res.data) {
        setSelectedReportData(res.data);
        setViewModalOpen(true);
      } else {
        setError('Report details not found');
      }
    } catch (err) {
      console.error('Failed to load report details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedReportData(null);
    setSelectedPeriod(null);
  };

  return (
    <MemeLayout
      title="COMPLIANCE REPORTS"
      subtitle="View all emissions reports and compliance logs."
      bgPattern="conic-gradient(from 0deg at 50% 50%, #f0f0f0 0deg, #ffffff 60deg, #f0f0f0 120deg, #ffffff 180deg, #f0f0f0 240deg, #ffffff 300deg)"
      bgSize="60px 60px"
      sx={{ animation: 'spinSlow 60s linear infinite' }}
    >
      <Card
        sx={{
          p: 3,
          mb: 2,
          bgcolor: '#ffffff',
          borderColor: '#0a0a0a',
          boxShadow: '8px 8px 0px #0a0a0a',
          position: 'relative',
          overflow: 'visible',
        }}
      >
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
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))',
          }}
        />
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Chip
            label="Reports"
            sx={{ bgcolor: '#00f0ff', color: '#000', fontWeight: 'bold', border: '1px solid #000' }}
          />
          <Typography variant="h5" fontWeight={800} fontFamily='"Bangers", sans-serif' letterSpacing={1}>
            COMPLIANCE LOGS
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 2, fontFamily: '"Space Grotesk", sans-serif' }}>
          Official records of carbon emissions. Select a datacenter to view compliance logs.
        </Typography>

        {/* Datacenter Selection */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="datacenter-select-label" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Select Datacenter
          </InputLabel>
          <Select
            labelId="datacenter-select-label"
            value={selectedDatacenter}
            label="Select Datacenter"
            onChange={(e) => setSelectedDatacenter(e.target.value)}
            sx={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {datacenters.map((dc) => (
              <MenuItem key={dc._id || dc.name} value={dc.name || dc._id}>
                {dc.name || dc._id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Refresh Button */}
        {selectedDatacenter && (
          <Button
            variant="contained"
            onClick={loadComplianceLogs}
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: '#0a0a0a',
              color: '#fff',
              fontFamily: '"Space Grotesk", sans-serif',
              '&:hover': { bgcolor: '#333' },
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
        )}
      </Card>

      {message && (
        <Alert sx={{ mt: 2, bgcolor: '#00f0ff', color: '#000', border: '2px solid #000' }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2, bgcolor: '#ff0055', color: '#fff', border: '2px solid #0a0a0a' }}>
          {error}
        </Alert>
      )}

      {/* Compliance Logs Table */}
      {selectedDatacenter && (
        <Box
          sx={{
            mt: 4,
            border: '3px solid #0a0a0a',
            p: 2,
            bgcolor: '#fff',
            boxShadow: '5px 5px 0px #0a0a0a',
          }}
        >
          {loading && tableRows.length === 0 ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <ReportTable tableRows={tableRows} onView={handleViewReport} />
          )}
        </Box>
      )}

      {/* Report View Modal */}
      <ReportViewModal
        open={viewModalOpen}
        onClose={handleCloseModal}
        reportData={selectedReportData}
      />
    </MemeLayout>
  );
};

export default ReportsPage;
