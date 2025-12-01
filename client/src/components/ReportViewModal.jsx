import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Security,
  Description,
  Folder,
  Link as LinkIcon,
} from '@mui/icons-material';

const ReportViewModal = ({ open, onClose, reportData }) => {
  if (!reportData) return null;

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'MINTED':
        return 'success';
      case 'FROZEN':
        return 'info';
      case 'ANALYZED':
        return 'warning';
      case 'PENDING':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          border: '3px solid #0a0a0a',
          boxShadow: '10px 10px 0px #0a0a0a',
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: '#00f0ff', borderBottom: '2px solid #0a0a0a' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" fontWeight={800} fontFamily='"Bangers", sans-serif' letterSpacing={1}>
            REPORT DETAILS
          </Typography>
          <Chip
            label={reportData.status || 'PENDING'}
            color={getStatusColor(reportData.status)}
            sx={{ fontWeight: 'bold' }}
          />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1, fontFamily: '"Space Grotesk", sans-serif' }}>
          Period: {reportData.period} | Datacenter: {reportData.datacenter}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Stack spacing={3}>
          {/* Emissions Summary */}
          <Paper sx={{ p: 2, border: '2px solid #0a0a0a', bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif' mb={2}>
              📊 EMISSIONS SUMMARY
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" fontFamily='"Space Grotesk", sans-serif'>
                  Scope 1
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {typeof reportData.scope1 === 'number' ? reportData.scope1.toFixed(2) : reportData.scope1 || '0.00'} tCO2e
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" fontFamily='"Space Grotesk", sans-serif'>
                  Scope 2
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {typeof reportData.scope2 === 'number' ? reportData.scope2.toFixed(2) : reportData.scope2 || '0.00'} tCO2e
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" fontFamily='"Space Grotesk", sans-serif'>
                  Scope 3
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {typeof reportData.scope3 === 'number' ? reportData.scope3.toFixed(2) : reportData.scope3 || '0.00'} tCO2e
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Cryptographic Proofs */}
          {reportData.reportHash && (
            <Accordion sx={{ border: '2px solid #0a0a0a' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Security color="primary" />
                  <Typography variant="h6" fontFamily='"Space Grotesk", sans-serif'>
                    Cryptographic Proofs
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {reportData.reportHash && (
                    <Box>
                      <Typography variant="caption" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif'>
                        Report Hash:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          bgcolor: '#f5f5f5',
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        {reportData.reportHash}
                      </Typography>
                    </Box>
                  )}
                  {reportData.merkleRoot && (
                    <Box>
                      <Typography variant="caption" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif'>
                        Merkle Root:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          bgcolor: '#f5f5f5',
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        {reportData.merkleRoot}
                      </Typography>
                    </Box>
                  )}
                  {reportData.evidenceHashes && reportData.evidenceHashes.length > 0 && (
                    <Box>
                      <Typography variant="caption" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif'>
                        Evidence Hashes ({reportData.evidenceHashes.length}):
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
                        {reportData.evidenceHashes.map((hash, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              wordBreak: 'break-all',
                              bgcolor: '#f5f5f5',
                              p: 0.5,
                              borderRadius: 0.5,
                              mb: 0.5,
                            }}
                          >
                            {hash}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Evidence */}
          {reportData.evidence && reportData.evidence.length > 0 && (
            <Accordion sx={{ border: '2px solid #0a0a0a' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Folder color="primary" />
                  <Typography variant="h6" fontFamily='"Space Grotesk", sans-serif'>
                    Evidence ({reportData.evidence.length} items)
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {reportData.evidence.map((item, idx) => (
                    <Paper key={idx} sx={{ p: 2, border: '1px solid #0a0a0a', bgcolor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif'>
                        {item.type || 'Unknown Type'}
                      </Typography>
                      {item.vendor && (
                        <Typography variant="body2" fontFamily='"Space Grotesk", sans-serif'>
                          Vendor: {item.vendor}
                        </Typography>
                      )}
                      {item.total_co2e !== undefined && (
                        <Typography variant="body2" fontFamily='"Space Grotesk", sans-serif'>
                          Total CO2e: {parseFloat(item.total_co2e).toFixed(2)} tCO2e
                        </Typography>
                      )}
                      {item.anomalies && item.anomalies.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif'>
                            Anomalies ({item.anomalies.length}):
                          </Typography>
                          {item.anomalies.map((anomaly, aIdx) => (
                            <Chip
                              key={aIdx}
                              label={`${anomaly.type}: ${anomaly.reason}`}
                              size="small"
                              color="warning"
                              sx={{ mr: 0.5, mt: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Narrative */}
          {reportData.narrative && (
            <Accordion sx={{ border: '2px solid #0a0a0a' }} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Description color="primary" />
                  <Typography variant="h6" fontFamily='"Space Grotesk", sans-serif'>
                    Narrative
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                  }}
                >
                  {reportData.narrative}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Additional Information */}
          <Paper sx={{ p: 2, border: '2px solid #0a0a0a', bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" fontWeight="bold" fontFamily='"Space Grotesk", sans-serif' mb={2}>
              ℹ️ ADDITIONAL INFORMATION
            </Typography>
            <Table size="small">
              <TableBody>
                {reportData.jobId && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
                      Job ID
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {reportData.jobId}
                    </TableCell>
                  </TableRow>
                )}
                {reportData.timestamp && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
                      Generated At
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {new Date(reportData.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )}
                {reportData.masumiTxCount > 0 && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
                      Masumi Transactions
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {reportData.masumiTxCount}
                    </TableCell>
                  </TableRow>
                )}
                {reportData.certificateTxHash && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
                      Certificate TX Hash
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        fontSize: '0.875rem',
                      }}
                    >
                      {reportData.certificateTxHash}
                    </TableCell>
                  </TableRow>
                )}
                {reportData.ipfs_bundle && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk", sans-serif' }}>
                      IPFS Bundle
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        href={`https://gateway.pinata.cloud/ipfs/${reportData.ipfs_bundle.replace('ipfs://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on IPFS
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#f5f5f5', borderTop: '2px solid #0a0a0a', p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#0a0a0a', color: '#fff', '&:hover': { bgcolor: '#333' } }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportViewModal;


