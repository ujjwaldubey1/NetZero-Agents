import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, Grid, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bolt, CloudUpload, History, ArrowForward } from '@mui/icons-material';
import api from '../../api';
import { ASSETS } from '../../assets';

const StaffDashboard = () => {
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  const loadRecent = async () => {
    try {
      const res = await api.get('/api/emissions/by-period');
      const filtered = res.data.filter((r) => [1, 2].includes(Number(r.scope)));
      setRecent(filtered.slice(0, 6)); // Show top 6 as widgets
    } catch (error) {
      console.error("Failed to load recent uploads", error);
    }
  };

  useEffect(() => { loadRecent(); }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const widgetVariant = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    hover: {
      y: -5,
      boxShadow: "10px 10px 0px #0a0a0a",
      transition: { duration: 0.2 }
    }
  };



  // ... inside component ...

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        bgcolor: '#ffffff',
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.05) 0px, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 20px),
          repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 0px, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 20px),
          linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)),
          url(${ASSETS.ANIME_DASHBOARD_BG})
        `,
        backgroundSize: 'auto, auto, cover, cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#0a0a0a',
        overflowX: 'hidden'
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h2" sx={{ fontFamily: '"Bangers", sans-serif', textShadow: '4px 4px 0px #00f0ff', lineHeight: 0.8 }}>
              STAFF HQ
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold', bgcolor: '#0a0a0a', color: '#fff', display: 'inline-block', px: 1, transform: 'rotate(-2deg)', mt: 1 }}>
              MISSION CONTROL
            </Typography>
          </Box>
          <Chip
            icon={<Bolt sx={{ color: '#0a0a0a !important' }} />}
            label="ONLINE"
            sx={{
              bgcolor: '#fcee0a',
              fontFamily: '"Bangers", sans-serif',
              fontSize: '1.2rem',
              border: '3px solid #0a0a0a',
              boxShadow: '4px 4px 0px #0a0a0a'
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* Navigation Widgets */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <motion.div variants={widgetVariant} whileHover="hover" onClick={() => navigate('/staff/upload')}>
                  <Card sx={{
                    height: '100%',
                    border: '4px solid #0a0a0a',
                    borderRadius: 4,
                    bgcolor: '#00f0ff',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <Box>
                        <CloudUpload sx={{ fontSize: 60, mb: 2, color: '#0a0a0a' }} />
                        <Typography variant="h4" sx={{ fontFamily: '"Bangers", sans-serif' }}>UPLOAD INTEL</Typography>
                        <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold' }}>Scope 1 & 2 Data</Typography>
                      </Box>
                      <Box sx={{ alignSelf: 'flex-end', bgcolor: '#0a0a0a', borderRadius: '50%', p: 1 }}>
                        <ArrowForward sx={{ color: '#fff' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={widgetVariant} whileHover="hover">
                  <Card sx={{
                    height: '100%',
                    border: '4px solid #0a0a0a',
                    borderRadius: 4,
                    bgcolor: '#ff0055',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <History sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h4" sx={{ fontFamily: '"Bangers", sans-serif' }}>ACTIVITY LOG</Typography>
                      <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold' }}>{recent.length} Recent Drops</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Changes Widgets */}
          <Grid item xs={12} md={12}>
            <Typography variant="h4" sx={{ fontFamily: '"Bangers", sans-serif', mb: 3, display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ width: 20, height: 20, bgcolor: '#0a0a0a', mr: 2, transform: 'rotate(45deg)' }} />
              RECENT TRANSMISSIONS
            </Typography>

            <Grid container spacing={3}>
              {recent.length === 0 ? (
                <Grid item xs={12}>
                  <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontStyle: 'italic', opacity: 0.6 }}>No recent data found.</Typography>
                </Grid>
              ) : (
                recent.map((r, i) => (
                  <Grid item xs={12} sm={6} md={4} key={r._id}>
                    <motion.div
                      variants={widgetVariant}
                      whileHover="hover"
                      custom={i}
                    >
                      <Card sx={{
                        border: '3px solid #0a0a0a',
                        borderRadius: 3,
                        boxShadow: '6px 6px 0px #e0e0e0',
                        bgcolor: '#fff',
                        height: '100%'
                      }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Chip
                              label={`SCOPE ${r.scope}`}
                              sx={{
                                bgcolor: r.scope === '1' ? '#00f0ff' : '#fcee0a',
                                fontFamily: '"Bangers", sans-serif',
                                border: '2px solid #0a0a0a',
                                fontWeight: 'bold'
                              }}
                            />
                            <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold' }}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" sx={{ fontFamily: '"Bangers", sans-serif', lineHeight: 1.2, mb: 1 }}>
                            {r.dataCenterName || 'UNKNOWN CENTER'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', color: '#666' }}>
                            Period: {r.period || 'N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default StaffDashboard;
