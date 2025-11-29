import React from 'react';
import { Box, Typography, Chip, Stack, Divider } from '@mui/material';
import { CheckCircle, Lock, CloudUpload, Shield, Verified } from '@mui/icons-material';

const getEventIcon = (type) => {
  switch (type) {
    case 'CERTIFICATE_ISSUED':
      return <Verified sx={{ fontSize: 32, color: '#00f0ff' }} />;
    case 'REPORT_FROZEN':
      return <Lock sx={{ fontSize: 32, color: '#ff0055' }} />;
    case 'EMISSIONS_UPLOADED':
      return <CloudUpload sx={{ fontSize: 32, color: '#fcee0a' }} />;
    case 'ZK_PROOF_VERIFIED':
      return <Shield sx={{ fontSize: 32, color: '#00f0ff' }} />;
    default:
      return <CheckCircle sx={{ fontSize: 32, color: '#0a0a0a' }} />;
  }
};

const getEventColor = (type) => {
  switch (type) {
    case 'CERTIFICATE_ISSUED':
      return '#00f0ff';
    case 'REPORT_FROZEN':
      return '#ff0055';
    case 'EMISSIONS_UPLOADED':
      return '#fcee0a';
    case 'ZK_PROOF_VERIFIED':
      return '#00f0ff';
    default:
      return '#0a0a0a';
  }
};

const LedgerTimeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" fontFamily='"Bangers", sans-serif' color="#0a0a0a">
          NO BLOCKS YET
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
          Blockchain events will appear here as they occur
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Vertical timeline line */}
      <Box
        sx={{
          position: 'absolute',
          left: '24px',
          top: '40px',
          bottom: '40px',
          width: '4px',
          bgcolor: '#0a0a0a',
          zIndex: 0,
        }}
      />

      {events.map((e, index) => (
        <Box
          key={e._id}
          sx={{
            position: 'relative',
            mb: 3,
            ml: 8,
            '&:last-child': { mb: 0 },
          }}
        >
          {/* Icon circle */}
          <Box
            sx={{
              position: 'absolute',
              left: -56,
              top: 8,
              width: 64,
              height: 64,
              bgcolor: '#ffffff',
              border: '4px solid #0a0a0a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              boxShadow: '4px 4px 0px #0a0a0a',
            }}
          >
            {getEventIcon(e.type)}
          </Box>

          {/* Event block */}
          <Box
            sx={{
              bgcolor: '#ffffff',
              border: '3px solid #0a0a0a',
              boxShadow: `6px 6px 0px ${getEventColor(e.type)}`,
              p: 2.5,
              transform: index % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'rotate(0deg) scale(1.02)',
                boxShadow: `8px 8px 0px ${getEventColor(e.type)}`,
              },
            }}
          >
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Chip
                label={e.type.replace(/_/g, ' ')}
                sx={{
                  bgcolor: getEventColor(e.type),
                  color: e.type === 'EMISSIONS_UPLOADED' ? '#0a0a0a' : '#ffffff',
                  fontWeight: 'bold',
                  border: '2px solid #0a0a0a',
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Space Grotesk", monospace',
                  fontWeight: 600,
                  color: '#0a0a0a',
                  opacity: 0.7,
                }}
              >
                {new Date(e.timestamp).toLocaleString()}
              </Typography>
            </Stack>

            {/* Detail */}
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 600,
                color: '#0a0a0a',
                mb: 1.5,
                lineHeight: 1.5,
              }}
            >
              {e.detail || 'Blockchain event'}
            </Typography>

            {/* Additional info */}
            {(e.cardanoTxHash || e.hydraTxId || e.reportHash || e.proofHash) && (
              <Box>
                <Divider sx={{ mb: 1.5, borderColor: '#0a0a0a', borderWidth: 1 }} />
                <Stack spacing={0.5}>
                  {e.cardanoTxHash && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Bangers", sans-serif',
                          letterSpacing: '0.5px',
                          color: '#0a0a0a',
                          minWidth: 80,
                        }}
                      >
                        CARDANO TX:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          color: '#0a0a0a',
                          opacity: 0.8,
                          wordBreak: 'break-all',
                        }}
                      >
                        {e.cardanoTxHash.substring(0, 20)}...{e.cardanoTxHash.substring(e.cardanoTxHash.length - 10)}
                      </Typography>
                    </Stack>
                  )}
                  {e.hydraTxId && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Bangers", sans-serif',
                          letterSpacing: '0.5px',
                          color: '#0a0a0a',
                          minWidth: 80,
                        }}
                      >
                        HYDRA TX:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          color: '#0a0a0a',
                          opacity: 0.8,
                        }}
                      >
                        {e.hydraTxId}
                      </Typography>
                    </Stack>
                  )}
                  {e.reportHash && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Bangers", sans-serif',
                          letterSpacing: '0.5px',
                          color: '#0a0a0a',
                          minWidth: 80,
                        }}
                      >
                        IPFS HASH:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          color: '#0a0a0a',
                          opacity: 0.8,
                        }}
                      >
                        {e.reportHash}
                      </Typography>
                    </Stack>
                  )}
                  {e.proofHash && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Bangers", sans-serif',
                          letterSpacing: '0.5px',
                          color: '#0a0a0a',
                          minWidth: 80,
                        }}
                      >
                        PROOF HASH:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          color: '#0a0a0a',
                          opacity: 0.8,
                        }}
                      >
                        {e.proofHash}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default LedgerTimeline;
