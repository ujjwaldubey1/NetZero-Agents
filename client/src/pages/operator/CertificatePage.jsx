import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import { WorkspacePremium, CloudDone, Security, Block } from '@mui/icons-material';
import api, { fetchDataCenters, mintCertificateFromAnalysis, getOrchestratorResults } from '../../api';
import MemeLayout from '../../components/MemeLayout';
import { ASSETS } from '../../assets';

const CertificatePage = () => {
  const [reports, setReports] = useState([]);
  const [orchestratorResults, setOrchestratorResults] = useState([]);
  const [certs, setCerts] = useState([]);
  const [datacenters, setDatacenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('report'); // 'report' or 'orchestrator'
  const [selectedReportId, setSelectedReportId] = useState('');
  const [selectedAnalysisResult, setSelectedAnalysisResult] = useState(null);
  const [selectedDatacenter, setSelectedDatacenter] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [minting, setMinting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reportsRes, certsRes, datacentersRes, orchestratorRes] = await Promise.all([
        api.get('/api/reports').catch(() => ({ data: [] })),
        api.get('/api/certificates').catch(() => ({ data: [] })),
        fetchDataCenters().catch(() => ({ data: { data: [] } })),
        api.get('/api/orchestrator/results').catch(() => ({ data: { results: [] } })),
      ]);

      // Filter for validated/frozen reports (ready for certificate issuance)
      const allReports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
      const validatedReports = allReports.filter(
        (r) => r.status === 'validated' || r.status === 'frozen'
      );
      setReports(validatedReports);
      console.log(`📊 Loaded ${validatedReports.length} validated reports`);

      // Load certificates
      const certificates = Array.isArray(certsRes.data) ? certsRes.data : [];
      setCerts(certificates);
      console.log(`📜 Loaded ${certificates.length} certificates`);
      
      // Load datacenters
      const dcData = datacentersRes.data?.data || datacentersRes.data || [];
      setDatacenters(Array.isArray(dcData) ? dcData : []);

      // Load orchestrator results from backend
      const backendResults = orchestratorRes.data?.results || [];
      
      // Also check localStorage for recent results (from current session)
      const storedResults = JSON.parse(localStorage.getItem('orchestratorResults') || '[]');
      
      // Combine and deduplicate results (prioritize localStorage for full results)
      const allResults = [];
      const seen = new Set();
      
      // First add localStorage results (they have full data)
      storedResults.forEach(stored => {
        const key = `${stored.datacenter}-${stored.period}`;
        if (!seen.has(key)) {
          allResults.push(stored);
          seen.add(key);
        }
      });
      
      // Then add backend results that aren't already in localStorage
      backendResults.forEach(backend => {
        const key = `${backend.datacenter}-${backend.period}`;
        if (!seen.has(key)) {
          allResults.push(backend);
          seen.add(key);
        }
      });
      
      setOrchestratorResults(allResults);
      console.log(`🎯 Loaded ${allResults.length} orchestrator results`);

      // Auto-select first available option
      if (validatedReports.length > 0) {
        setSelectedReportId(validatedReports[0]._id);
        setSelectedType('report');
        console.log('✅ Auto-selected first validated report');
      } else if (allResults.length > 0) {
        setSelectedAnalysisResult(allResults[0]);
        setSelectedType('orchestrator');
        console.log('✅ Auto-selected first orchestrator result');
      } else {
        // Default to orchestrator type if no reports available
        setSelectedType('orchestrator');
        console.log('⚠️  No reports or results available');
      }
    } catch (err) {
      console.error('❌ Load error:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Listen for orchestrator analysis completion and refresh results
  useEffect(() => {
    const handleStorageChange = () => {
      const storedResults = JSON.parse(localStorage.getItem('orchestratorResults') || '[]');
      if (Array.isArray(storedResults) && storedResults.length > 0) {
        setOrchestratorResults(prev => {
          // Merge with existing results
          const combined = [...prev];
          storedResults.forEach(stored => {
            const exists = combined.find(r => 
              r.datacenter === stored.datacenter && r.period === stored.period
            );
            if (!exists && stored.cryptographic_proofs) {
              combined.push(stored);
            }
          });
          return combined;
        });
      }
    };

    // Check localStorage periodically and on storage events
    const interval = setInterval(() => {
      handleStorageChange();
    }, 2000); // Check every 2 seconds

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Initial check

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const issueOldCertificate = async () => {
    if (!selectedReportId) {
      setError('Please select a frozen report');
      return;
    }

    try {
      setMinting(true);
      setError(null);
      setMessage(null);
      
      // Try to issue certificate, with auto-validate enabled
      const res = await api.post('/api/certificates/issue', { 
        reportId: selectedReportId,
        autoValidate: true, // Auto-validate if needed
      });
      
      setMessage(`Certificate issued. tx ${res.data.cardanoTxHash || res.data.masumiTxHash || 'pending'}`);
      setCerts((prev) => [res.data, ...prev]);
      setSelectedReportId(''); // Clear selection
      
      // Reload reports to refresh status
      const reportsRes = await api.get('/api/reports').catch(() => ({ data: [] }));
      const allReports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
      const validatedReports = allReports.filter(
        (r) => r.status === 'validated' || r.status === 'frozen'
      );
      setReports(validatedReports);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Certificate issuance failed';
      setError(errorMsg);
      
      // If error suggests freezing, provide helpful message
      if (errorMsg.includes('must be validated') || errorMsg.includes('must be frozen')) {
        setError(`${errorMsg}. The report will be auto-validated on the next attempt, or you can manually freeze it from the Reports page.`);
      }
    } finally {
      setMinting(false);
    }
  };

  const issueFromOrchestrator = async () => {
    if (!selectedAnalysisResult) {
      setError('Please select an orchestrator analysis result');
      return;
    }

    // Construct cryptographic_proofs if not present but we have the data
    let resultToMint = selectedAnalysisResult;
    
    if (!resultToMint.cryptographic_proofs) {
      // Try to construct from available fields
      if (resultToMint.reportHash && resultToMint.merkleRoot) {
        resultToMint = {
          ...resultToMint,
          cryptographic_proofs: {
            report_hash: resultToMint.reportHash,
            evidence_merkle_root: resultToMint.merkleRoot,
            evidence_hashes: [], // Empty array if not available
          },
        };
      } else {
        setError('Selected analysis result does not have cryptographic proofs. Please re-run the analysis to generate certificates.');
        return;
      }
    }

    try {
      setMinting(true);
      setError(null);
      setMessage(null);
      const res = await mintCertificateFromAnalysis(resultToMint);
      setMessage(`Certificate minted successfully! Certificate ID: ${res.data.certificateId}`);
      setCerts((prev) => [{ ...res.data, period: selectedAnalysisResult.period }, ...prev]);
      setSelectedAnalysisResult(null); // Clear selection
      
      // Reload certificates to get full details
      const certsRes = await api.get('/api/certificates');
      setCerts(certsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Certificate minting failed');
    } finally {
      setMinting(false);
    }
  };

  const handleIssue = () => {
    if (selectedType === 'report') {
      issueOldCertificate();
    } else {
      issueFromOrchestrator();
    }
  };

  if (loading) {
    return (
      <MemeLayout title="CERTIFICATES" subtitle="Loading certificates...">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </MemeLayout>
    );
  }

  return (
    <MemeLayout
      title="CERTIFICATES"
      subtitle="Mint proof of compliance on Cardano / Masumi."
      bgPattern="repeating-linear-gradient(90deg, #f0f0f0, #f0f0f0 1px, transparent 1px, transparent 20px)"
      bgSize="20px 20px"
      sx={{ animation: 'moveHorizontal 20s linear infinite' }}
    >
      {message && (
        <Alert
          sx={{
            mt: 2,
            bgcolor: '#00f0ff',
            color: '#000',
            border: '2px solid #000',
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            bgcolor: '#ff0055',
            color: '#fff',
            border: '2px solid #0a0a0a',
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          {error}
        </Alert>
      )}

      <Card
        sx={{
          mt: 4,
          bgcolor: '#ffffff',
          border: '3px solid #fcee0a',
          boxShadow: '10px 10px 0px #fcee0a',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <Box
          component="img"
          src={ASSETS.CARDANO_MEME}
          sx={{
            position: 'absolute',
            top: -30,
            right: -20,
            width: 70,
            transform: 'rotate(15deg)',
            zIndex: 10,
            filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))',
          }}
        />
        <CardContent>
          <Stack spacing={3}>
            {/* Source Type Selection */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>Certificate Source</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setError(null);
                  setMessage(null);
                }}
                label="Certificate Source"
                sx={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                <MenuItem value="report">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Block sx={{ fontSize: 20 }} />
                    <Typography>Validated Report (Legacy)</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="orchestrator">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CloudDone sx={{ fontSize: 20 }} />
                    <Typography>Orchestrator Analysis Result (New)</Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Report Selection (Legacy) */}
            {selectedType === 'report' && (
              <>
                <FormControl fullWidth required>
                  <InputLabel 
                    id="frozen-report-label"
                    sx={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    FROZEN REPORT
                  </InputLabel>
                  <Select
                    labelId="frozen-report-label"
                    value={selectedReportId || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedReportId(value);
                      setError(null);
                      setMessage(null);
                      console.log('Selected report ID:', value);
                    }}
                    label="FROZEN REPORT"
                    sx={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    displayEmpty
                  >
                    {reports.length === 0 ? (
                      <MenuItem disabled value="">
                        <Typography sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                          No validated reports available. Run an orchestrator analysis first.
                        </Typography>
                      </MenuItem>
                    ) : (
                      reports.map((r) => (
                        <MenuItem key={r._id} value={r._id}>
                          <Stack>
                            <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
                              {r.period || 'Unknown Period'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: '"Space Grotesk", sans-serif', opacity: 0.7 }}
                            >
                              Facility: {r.facilityId || 'N/A'} | Status: {r.status} | Hash: {r.reportHash?.substring(0, 16) || 'N/A'}...
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                {reports.length > 0 && !selectedReportId && (
                  <Alert severity="warning" sx={{ border: '2px solid #0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}>
                    Please select a frozen report from the dropdown above.
                  </Alert>
                )}
              </>
            )}

            {/* Orchestrator Result Selection (New) */}
            {selectedType === 'orchestrator' && (
              <>
                {orchestratorResults.length === 0 ? (
                  <Alert
                    sx={{
                      bgcolor: '#fff3cd',
                      border: '2px solid #0a0a0a',
                      fontFamily: '"Space Grotesk", sans-serif',
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      No orchestrator analysis results available.
                    </Typography>
                    <Typography variant="body2">
                      Please run an analysis from the Orchestrator page first, then return here to mint a certificate.
                    </Typography>
                  </Alert>
                ) : (
                  <FormControl fullWidth required>
                    <InputLabel 
                      id="orchestrator-analysis-label"
                      sx={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      ORCHESTRATOR ANALYSIS
                    </InputLabel>
                    <Select
                      labelId="orchestrator-analysis-label"
                      value={
                        selectedAnalysisResult
                          ? orchestratorResults.findIndex(
                              (r) => r.datacenter === selectedAnalysisResult.datacenter && 
                                     r.period === selectedAnalysisResult.period
                            )
                          : ''
                      }
                      onChange={(e) => {
                        const index = parseInt(e.target.value, 10);
                        if (isNaN(index) || index < 0 || index >= orchestratorResults.length) {
                          setSelectedAnalysisResult(null);
                          setError(null);
                          setMessage(null);
                          return;
                        }
                        
                        const result = orchestratorResults[index];
                        if (result) {
                          setSelectedAnalysisResult(result);
                          setError(null);
                          setMessage(null);
                          console.log('Selected orchestrator result:', { 
                            index,
                            datacenter: result.datacenter, 
                            period: result.period 
                          });
                        } else {
                          console.warn('Could not find result at index:', index);
                          setSelectedAnalysisResult(null);
                        }
                      }}
                      label="ORCHESTRATOR ANALYSIS"
                      sx={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      displayEmpty
                    >
                      {orchestratorResults.map((result, idx) => {
                        // Check if we have cryptographic proofs (either as object or as separate fields)
                        const hasProofs = !!(
                          result.cryptographic_proofs || 
                          (result.reportHash && result.merkleRoot)
                        );
                        
                        // Get report hash from either structure
                        const reportHash = result.cryptographic_proofs?.report_hash || result.reportHash;
                        const masumiCount = result.masumiTransactionCount || result.masumi_transactions?.length || 0;
                        
                        return (
                          <MenuItem
                            key={idx}
                            value={idx}
                            // Make all items selectable - we'll construct proofs if needed
                            disabled={false}
                          >
                            <Stack>
                              <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
                                {result.datacenter} - {result.period}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ 
                                  fontFamily: '"Space Grotesk", sans-serif', 
                                  opacity: hasProofs ? 0.7 : 0.5,
                                  fontStyle: hasProofs ? 'normal' : 'italic',
                                }}
                              >
                                {hasProofs ? (
                                  <>
                                    Hash: {reportHash?.substring(0, 16) || 'N/A'}... |{' '}
                                    {masumiCount} Masumi transactions
                                  </>
                                ) : (
                                  '⚠️ No cryptographic proofs available - may need to re-run analysis'
                                )}
                              </Typography>
                            </Stack>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}
                {orchestratorResults.length > 0 && !selectedAnalysisResult && (
                  <Alert severity="warning" sx={{ border: '2px solid #0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}>
                    Please select an orchestrator analysis result from the dropdown above.
                  </Alert>
                )}
              </>
            )}

            <Divider sx={{ borderColor: '#0a0a0a', borderWidth: 2 }} />

            {/* Issue Button */}
            <Button
              variant="contained"
              onClick={handleIssue}
              disabled={
                minting ||
                (selectedType === 'report' && !selectedReportId) ||
                (selectedType === 'orchestrator' && !selectedAnalysisResult)
              }
              startIcon={minting ? <CircularProgress size={20} /> : <WorkspacePremium />}
              sx={{
                height: '56px',
                bgcolor: '#00f0ff',
                color: '#0a0a0a',
                fontWeight: 'bold',
                border: '3px solid #0a0a0a',
                boxShadow: '4px 4px 0px #0a0a0a',
                fontFamily: '"Space Grotesk", sans-serif',
                '&:hover': {
                  bgcolor: '#00d0ef',
                  transform: 'translate(2px, 2px)',
                  boxShadow: '2px 2px 0px #0a0a0a',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#666',
                },
              }}
            >
              {minting
                ? 'Minting Certificate...'
                : selectedType === 'report'
                  ? 'Issue Certificate (Cardano)'
                  : 'Mint Certificate (Masumi)'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h5" mt={6} fontFamily='"Bangers", sans-serif' letterSpacing={1}>ISSUED CERTIFICATES</Typography>
      {certs.map((c) => (
        <Card key={c._id} sx={{ mt: 2, bgcolor: '#ffffff', borderColor: '#0a0a0a', boxShadow: '5px 5px 0px #0a0a0a', position: 'relative', overflow: 'visible' }}>
          <Box 
            component="img" 
            src={ASSETS.HERO_AWAKENING} 
            sx={{ 
              position: 'absolute', 
              bottom: -10, 
              right: 10, 
              width: 80, 
              opacity: 0.8,
              transform: 'rotate(-5deg)', 
              zIndex: 10
            }} 
          />
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">PERIOD {c.period || ''}</Typography>
            
            {/* Report Hash Block */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', border: '2px solid #0a0a0a', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>REPORT HASH</Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', wordBreak: 'break-all', mt: 0.5 }}>
                {c.reportHash || 'N/A'}
              </Typography>
            </Box>
            
            {/* Blockchain Transaction Block */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', border: '2px solid #0a0a0a', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>BLOCKCHAIN TRANSACTION</Typography>
              {c.cardanoTxHash ? (
                <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', wordBreak: 'break-all', mt: 0.5 }}>
                  Cardano tx: {c.cardanoTxHash}
                </Typography>
              ) : c.masumiTxHash ? (
                <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', wordBreak: 'break-all', mt: 0.5 }}>
                  Masumi tx: {c.masumiTxHash}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', mt: 0.5 }}>
                  Blockchain tx: not submitted
                </Typography>
              )}
            </Box>
            
            {/* Certificate/Token ID Block */}
            {(c.hydraTxId || c.masumiCertificateId) && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f3e5f5', border: '2px solid #0a0a0a', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  {c.hydraTxId ? 'CIP-68 CARBON TOKEN' : 'MASUMI CERTIFICATE ID'}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', wordBreak: 'break-all', mt: 0.5 }}>
                  {c.hydraTxId || c.masumiCertificateId || 'n/a'}
                </Typography>
              </Box>
            )}
            
            {/* Network Information Block */}
            {(c.masumiNetwork || c.mausamiFeeAda !== null) && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3e0', border: '2px solid #0a0a0a', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>NETWORK</Typography>
                {c.mausamiFeeAda !== null && c.mausamiFeeAda !== undefined ? (
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', mt: 0.5 }}>
                    Mausami fee (ADA): {c.mausamiFeeAda}
                  </Typography>
                ) : c.masumiNetwork ? (
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', mt: 0.5 }}>
                    Masumi Network: {c.masumiNetwork}
                  </Typography>
                ) : null}
              </Box>
            )}
            
            {/* Block Information Block */}
            {(c.masumiBlockNumber || c.masumiBlockHash || c.masumiBlockTimestamp) && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#e8f5e9', border: '2px solid #0a0a0a', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>BLOCK INFORMATION</Typography>
                {c.masumiBlockNumber && (
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', mt: 0.5 }}>
                    Block Number: {c.masumiBlockNumber.toLocaleString()}
                  </Typography>
                )}
                {c.masumiBlockHash && (
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', wordBreak: 'break-all', mt: 0.5 }}>
                    Block Hash: {c.masumiBlockHash}
                  </Typography>
                )}
                {c.masumiBlockTimestamp && (
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', mt: 0.5 }}>
                    Block Timestamp: {new Date(c.masumiBlockTimestamp).toLocaleString()}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Additional Information Block */}
            {(c.mausamiNote || c.masumiTransactionCount > 0) && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#fce4ec', border: '2px solid #0a0a0a', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>ADDITIONAL INFO</Typography>
                {c.mausamiNote && (
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', mt: 0.5 }}>
                    Agent note: {c.mausamiNote}
                  </Typography>
                )}
                {c.masumiTransactionCount > 0 && (
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', mt: 0.5 }}>
                    Masumi transactions: {c.masumiTransactionCount}
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </MemeLayout>
  );
};

export default CertificatePage;
