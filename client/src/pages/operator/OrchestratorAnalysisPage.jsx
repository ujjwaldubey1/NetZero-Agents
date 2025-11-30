import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { PlayArrow, Download, Verified, Security, CloudUpload, WorkspacePremium } from '@mui/icons-material';
import { analyzeEmissions, getOrchestratorStatus, fetchDataCenters, mintCertificateFromAnalysis } from '../../api';
import BootLoader from '../../components/BootLoader';
import DashboardCards from '../../components/DashboardCards';
import LedgerTimeline from '../../components/LedgerTimeline';
import VendorAnalysisTable from '../../components/VendorAnalysisTable';

const OrchestratorAnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [datacenters, setDatacenters] = useState([]);
  const [selectedDatacenter, setSelectedDatacenter] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [mintingCertificate, setMintingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState(null);

  // Load orchestrator status and datacenters
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [statusRes, datacentersRes] = await Promise.all([
          getOrchestratorStatus(),
          fetchDataCenters().catch(() => ({ data: { data: [] } }))
        ]);
        setStatus(statusRes.data);
        const dcData = datacentersRes.data?.data || datacentersRes.data || [];
        setDatacenters(Array.isArray(dcData) ? dcData : []);
        
        // Auto-select first datacenter and current quarter
        if (dcData.length > 0 && Array.isArray(dcData)) {
          setSelectedDatacenter(dcData[0].name || dcData[0]._id);
        }
        
        // Set current quarter
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const quarter = Math.ceil(month / 3);
        setSelectedPeriod(`${year}-Q${quarter}`);
      } catch (err) {
        console.error('Failed to load status:', err);
      } finally {
        setStatusLoading(false);
      }
    };
    
    loadStatus();
  }, []);

  const runAnalysis = async () => {
    if (!selectedDatacenter || !selectedPeriod) {
      setError('Please select a datacenter and period');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeEmissions(selectedDatacenter, selectedPeriod);
      setResult(response.data);
      
      // Save to localStorage for certificate page
      if (response.data && response.data.cryptographic_proofs) {
        const storedResults = JSON.parse(localStorage.getItem('orchestratorResults') || '[]');
        const newResult = {
          ...response.data,
          savedAt: new Date().toISOString(),
        };
        
        // Check if this result already exists
        const exists = storedResults.find(
          r => r.datacenter === response.data.datacenter && r.period === response.data.period
        );
        
        if (!exists) {
          storedResults.unshift(newResult); // Add to beginning
          // Keep only last 20 results
          const limited = storedResults.slice(0, 20);
          localStorage.setItem('orchestratorResults', JSON.stringify(limited));
          console.log('💾 Saved orchestrator result to localStorage for certificate minting');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };


  const getDashboardTotals = () => {
    if (!result) return { scope1: {}, scope2: {}, scope3: {} };
    
    return {
      scope1: {
        diesel_co2_tons: parseFloat(result.staff_summary?.staff?.scope1?.total_co2e) || 0,
      },
      scope2: {
        electricity_co2_tons: parseFloat(result.staff_summary?.staff?.scope2?.total_co2e) || 0,
      },
      scope3: {
        upstream_co2_tons: parseFloat(result.vendors_summary?.summary?.total_scope3) || 0,
      },
    };
  };

  const getTimelineEvents = () => {
    if (!result?.masumi_transactions) return [];
    
    return result.masumi_transactions.map((tx, idx) => ({
      _id: tx.txId || `tx-${idx}`,
      type: tx.type?.toUpperCase().replace(/_/g, '_') || 'TRANSACTION',
      timestamp: tx.timestamp || new Date().toISOString(),
      detail: `${tx.agentId} - ${tx.action || tx.type}`,
      txId: tx.txId,
      amount: tx.amount ? `${tx.amount} tokens` : null,
    }));
  };

  const exportReport = () => {
    if (!result) return;
    
    const reportData = {
      ...result,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netzero-report-${selectedDatacenter}-${selectedPeriod}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMintCertificate = async () => {
    if (!result || !result.cryptographic_proofs) {
      setCertificateError('No analysis result available to mint certificate');
      return;
    }

    setMintingCertificate(true);
    setCertificateError(null);
    setCertificate(null);

    try {
      const response = await mintCertificateFromAnalysis(result);
      setCertificate(response.data);
      console.log('✅ Certificate minted:', response.data);
    } catch (err) {
      setCertificateError(err.response?.data?.message || err.message || 'Certificate minting failed');
      console.error('Certificate minting error:', err);
    } finally {
      setMintingCertificate(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Bangers", sans-serif',
            letterSpacing: 2,
            color: '#0a0a0a',
            textShadow: '3px 3px 0px #00f0ff',
            mb: 2,
          }}
        >
          🎯 AI EMISSIONS ORCHESTRATOR
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', opacity: 0.8 }}>
          Complete emissions analysis with multi-agent AI, cryptographic proofs, and blockchain integration
        </Typography>
      </Box>

      {/* Status Card */}
      {statusLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : status && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            border: '3px solid #0a0a0a',
            boxShadow: '6px 6px 0px #00f0ff',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Chip
                  label={status.llm_provider || 'Not configured'}
                  color={status.llm_configured ? 'success' : 'warning'}
                  size="small"
                />
                <Chip
                  label={status.masumi_blockchain?.enabled ? 'Masumi Enabled' : 'Masumi Disabled'}
                  color={status.masumi_blockchain?.enabled ? 'success' : 'default'}
                  size="small"
                />
              </Stack>
              <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {status.message}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                Service: {status.service}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                Architecture: {status.architecture}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Analysis Controls */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          border: '3px solid #0a0a0a',
          boxShadow: '6px 6px 0px #fcee0a',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Datacenter</InputLabel>
              <Select
                value={selectedDatacenter}
                onChange={(e) => setSelectedDatacenter(e.target.value)}
                label="Datacenter"
              >
                {datacenters.map((dc) => (
                  <MenuItem key={dc._id || dc.name} value={dc.name || dc._id}>
                    {dc.name || dc._id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                label="Period"
              >
                {['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2024-Q4'].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={runAnalysis}
              disabled={loading || !selectedDatacenter || !selectedPeriod}
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              sx={{
                bgcolor: '#00f0ff',
                color: '#0a0a0a',
                fontWeight: 'bold',
                border: '3px solid #0a0a0a',
                boxShadow: '4px 4px 0px #0a0a0a',
                '&:hover': {
                  bgcolor: '#00d0ef',
                  transform: 'translate(2px, 2px)',
                  boxShadow: '2px 2px 0px #0a0a0a',
                },
              }}
            >
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, border: '2px solid #0a0a0a' }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BootLoader />
          <Typography variant="h6" sx={{ mt: 4, fontFamily: '"Bangers", sans-serif' }}>
            Analyzing Emissions...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Summary Cards */}
          <Box sx={{ mb: 4 }}>
            <DashboardCards totals={getDashboardTotals()} />
          </Box>

          {/* Cryptographic Proofs */}
          {result.cryptographic_proofs && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                border: '3px solid #0a0a0a',
                boxShadow: '6px 6px 0px #ff0055',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Security sx={{ fontSize: 32, color: '#ff0055' }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Bangers", sans-serif',
                    letterSpacing: 1,
                  }}
                >
                  CRYPTOGRAPHIC PROOFS
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ border: '2px solid #0a0a0a', mb: 2 }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ fontFamily: '"Bangers", sans-serif' }}>
                        REPORT HASH
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', mt: 1 }}
                      >
                        {result.cryptographic_proofs.report_hash}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ border: '2px solid #0a0a0a', mb: 2 }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ fontFamily: '"Bangers", sans-serif' }}>
                        MERKLE ROOT
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', mt: 1 }}
                      >
                        {result.cryptographic_proofs.evidence_merkle_root}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk", sans-serif', opacity: 0.7 }}>
                    Evidence Items: {result.cryptographic_proofs.evidence_hashes?.length || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* IPFS Links */}
          {result.ipfs_links && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                border: '3px solid #0a0a0a',
                boxShadow: '6px 6px 0px #fcee0a',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <CloudUpload sx={{ fontSize: 32, color: '#fcee0a' }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Bangers", sans-serif',
                    letterSpacing: 1,
                  }}
                >
                  IPFS STORAGE
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                {result.ipfs_links.report_bundle && (
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      href={result.ipfs_links.gateway_urls?.report}
                      target="_blank"
                      sx={{ border: '2px solid #0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      View Report Bundle
                    </Button>
                  </Grid>
                )}
                {result.ipfs_links.evidence_package && (
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      href={result.ipfs_links.gateway_urls?.evidence}
                      target="_blank"
                      sx={{ border: '2px solid #0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      View Evidence Package
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {/* Masumi Transactions Timeline */}
          {result.masumi_transactions && result.masumi_transactions.length > 0 && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                border: '3px solid #0a0a0a',
                boxShadow: '6px 6px 0px #00f0ff',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Bangers", sans-serif',
                  letterSpacing: 1,
                  mb: 3,
                }}
              >
                🔗 MASUMI BLOCKCHAIN TIMELINE
              </Typography>
              <LedgerTimeline events={getTimelineEvents()} />
            </Paper>
          )}

          {/* Vendors Table */}
          {result.vendors_summary?.vendors && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                border: '3px solid #0a0a0a',
                boxShadow: '6px 6px 0px #fcee0a',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Bangers", sans-serif',
                  letterSpacing: 1,
                  mb: 3,
                }}
              >
                📊 VENDORS ANALYSIS
              </Typography>
              <VendorAnalysisTable vendors={result.vendors_summary.vendors} />
              
              {/* Anomalies Details */}
              {result.anomalies && result.anomalies.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Bangers", sans-serif',
                      letterSpacing: 1,
                      mb: 2,
                    }}
                  >
                    ⚠️ ANOMALIES DETECTED
                  </Typography>
                  {result.anomalies.map((anomaly, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        mb: 1,
                        bgcolor: '#fff3cd',
                        border: '2px solid #0a0a0a',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {anomaly.type} - {anomaly.vendor || anomaly.scope}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          opacity: 0.8,
                          mt: 0.5,
                        }}
                      >
                        {anomaly.reason}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          )}

          {/* Certificate Minting */}
          {result && result.cryptographic_proofs && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                border: '3px solid #0a0a0a',
                boxShadow: '6px 6px 0px #00f0ff',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <WorkspacePremium sx={{ fontSize: 32, color: '#00f0ff' }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Bangers", sans-serif',
                    letterSpacing: 1,
                  }}
                >
                  CERTIFICATE MINTING
                </Typography>
              </Stack>
              
              {certificate ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2, border: '2px solid #0a0a0a' }}>
                    Certificate minted successfully!
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ border: '2px solid #0a0a0a', mb: 2 }}>
                        <CardContent>
                          <Typography variant="caption" sx={{ fontFamily: '"Bangers", sans-serif' }}>
                            CERTIFICATE ID
                          </Typography>
                          <Typography variant="body1" sx={{ fontFamily: 'monospace', mt: 1, fontWeight: 'bold' }}>
                            {certificate.certificateId}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ border: '2px solid #0a0a0a', mb: 2 }}>
                        <CardContent>
                          <Typography variant="caption" sx={{ fontFamily: '"Bangers", sans-serif' }}>
                            TRANSACTION HASH
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', mt: 1 }}>
                            {certificate.txHash}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    {certificate.verifyUrl && (
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="contained"
                          href={certificate.verifyUrl}
                          target="_blank"
                          startIcon={<Verified />}
                          sx={{
                            bgcolor: '#00f0ff',
                            color: '#0a0a0a',
                            fontWeight: 'bold',
                            border: '2px solid #0a0a0a',
                          }}
                        >
                          View on Blockchain Explorer
                        </Button>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk", sans-serif', opacity: 0.7 }}>
                        Network: {certificate.network} | Issued: {new Date(certificate.issuedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box>
                  {certificateError && (
                    <Alert severity="error" sx={{ mb: 2, border: '2px solid #0a0a0a' }}>
                      {certificateError}
                    </Alert>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleMintCertificate}
                    disabled={mintingCertificate || !result}
                    startIcon={mintingCertificate ? <CircularProgress size={20} /> : <WorkspacePremium />}
                    sx={{
                      bgcolor: '#00f0ff',
                      color: '#0a0a0a',
                      fontWeight: 'bold',
                      border: '3px solid #0a0a0a',
                      boxShadow: '4px 4px 0px #0a0a0a',
                      '&:hover': {
                        bgcolor: '#00d0ef',
                        transform: 'translate(2px, 2px)',
                        boxShadow: '2px 2px 0px #0a0a0a',
                      },
                    }}
                  >
                    {mintingCertificate ? 'Minting Certificate...' : 'Mint Compliance Certificate'}
                  </Button>
                  <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk", sans-serif', opacity: 0.7, display: 'block', mt: 2, textAlign: 'center' }}>
                    This will mint a blockchain-certified compliance certificate for this emissions report
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Final Report */}
          {result.final_report && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                border: '3px solid #0a0a0a',
                boxShadow: '6px 6px 0px #ff0055',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Bangers", sans-serif',
                    letterSpacing: 1,
                  }}
                >
                  📄 FINAL REPORT
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={exportReport}
                  sx={{
                    bgcolor: '#00f0ff',
                    color: '#0a0a0a',
                    fontWeight: 'bold',
                    border: '2px solid #0a0a0a',
                  }}
                >
                  Export JSON
                </Button>
              </Stack>
              <Divider sx={{ mb: 3, borderColor: '#0a0a0a', borderWidth: 2 }} />
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f5f5f5',
                  border: '2px solid #0a0a0a',
                  fontFamily: '"Space Grotesk", sans-serif',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '600px',
                  overflow: 'auto',
                }}
              >
                {result.final_report}
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default OrchestratorAnalysisPage;

