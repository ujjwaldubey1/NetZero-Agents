import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, Stack, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, useSpring, useTransform } from 'framer-motion';
import api from '../../api';
import DashboardCards from '../../components/DashboardCards';
import MemeLayout from '../../components/MemeLayout';
import { ASSETS } from '../../assets';

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const OperatorDashboard = () => {
  const [report, setReport] = useState(null);
  const [trend, setTrend] = useState([]);
  const [error, setError] = useState(null);
  const period = '2025-Q4';

  const load = async () => {
    try {
      const rep = await api.get('/api/reports/current', { params: { period } });
      setReport(rep.data);
      const emissions = await api.get('/api/emissions/by-period');
      const map = {};
      emissions.data.forEach((r) => {
        map[r.period] = map[r.period] || { period: r.period, scope1: 0, scope2: 0, scope3: 0 };
        map[r.period][`scope${r.scope}`] +=
          r.extractedData?.[`scope${r.scope}`]?.diesel_co2_tons ||
          r.extractedData?.[`scope${r.scope}`]?.electricity_co2_tons ||
          r.extractedData?.[`scope${r.scope}`]?.upstream_co2_tons ||
          0;
      });
      setTrend(Object.values(map));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardHover = {
    scale: 1.02,
    boxShadow: '15px 15px 0px #0a0a0a',
    transition: { type: "spring", stiffness: 300, damping: 20 }
  };

  return (
    <MemeLayout
      bgPattern={`
        linear-gradient(135deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(225deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
        linear-gradient(315deg, #f5f5f5 25%, transparent 25%)
      `}
      bgSize="40px 40px"
      bgPosition="0 0, 0 0, 20px 20px, 20px 20px"
      sx={{ animation: 'moveHorizontal 10s linear infinite' }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
          <motion.div 
            whileHover={cardHover}
            style={{ 
              border: '3px solid #0a0a0a', 
              padding: '24px', 
              backgroundColor: '#ffffff', 
              boxShadow: '10px 10px 0px #0a0a0a',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
              overflow: 'visible',
              borderRadius: '4px'
            }}
          >
            <Box 
              component="img" 
              src={ASSETS.HOSKY_MEME} 
              sx={{ 
                position: 'absolute', 
                top: -40, 
                left: -20, 
                width: 100, 
                transform: 'rotate(-10deg)', 
                zIndex: 10,
                filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))',
                display: { xs: 'none', md: 'block' }
              }} 
            />
            <Box sx={{ ml: { xs: 0, md: 8 } }}>
              <Typography variant="h3" sx={{ color: '#0a0a0a', transform: 'rotate(-1deg)', textShadow: '3px 3px 0px #00f0ff', fontFamily: '"Bangers", sans-serif', letterSpacing: 2 }}>
                OPERATOR COMMAND
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold', bgcolor: '#fcee0a', color: '#0a0a0a', display: 'inline-block', px: 1, transform: 'rotate(1deg)', border: '2px solid #0a0a0a' }}>
                MISSION: ZERO CARBON
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="contained" color="primary" onClick={() => alert('Vendor invite bot triggered')} sx={{ fontWeight: 'bold', border: '2px solid #0a0a0a' }}>Vendor Invite Bot</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outlined" sx={{ color: '#0a0a0a', borderColor: '#0a0a0a', fontWeight: 'bold', border: '2px solid #0a0a0a', '&:hover': { bgcolor: '#fcee0a', borderColor: '#0a0a0a' } }} onClick={() => alert('Report checks bot triggered')}>Report Checks Bot</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="contained" color="secondary" onClick={() => alert('Agent triggered')} sx={{ fontWeight: 'bold', border: '2px solid #0a0a0a' }}>Agent</Button>
              </motion.div>
            </Stack>
          </motion.div>
        </motion.div>

        {error && <Alert severity="error" sx={{ mt: 2, border: '3px solid #0a0a0a', boxShadow: '5px 5px 0px #0a0a0a' }}>{error}</Alert>}

        <motion.div variants={itemVariants}>
          {report && <DashboardCards totals={report.scopeTotals || {}} />}
        </motion.div>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Chart Section */}
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants} style={{ height: '100%' }}>
              <motion.div 
                whileHover={cardHover}
                style={{ 
                  height: '100%', 
                  border: '3px solid #0a0a0a', 
                  backgroundColor: '#ffffff', 
                  padding: '24px',
                  boxShadow: '10px 10px 0px #0a0a0a',
                  position: 'relative',
                  overflow: 'visible',
                  borderRadius: '4px'
                }}
              >
                <Box 
                  component="img" 
                  src={ASSETS.VILLAIN_BUG} 
                  sx={{ 
                    position: 'absolute', 
                    top: -30, 
                    right: -10, 
                    width: 80, 
                    transform: 'rotate(15deg)', 
                    zIndex: 10,
                    filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
                  }} 
                />
                <Typography variant="h5" gutterBottom sx={{ borderBottom: '3px solid #fcee0a', display: 'inline-block', mb: 2, color: '#0a0a0a', fontFamily: '"Bangers", sans-serif', letterSpacing: 1 }}>
                  EMISSIONS TREND
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trend}>
                    <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
                    <XAxis dataKey="period" stroke="#0a0a0a" tick={{ fontFamily: 'Space Grotesk' }} />
                    <YAxis stroke="#0a0a0a" tick={{ fontFamily: 'Space Grotesk' }} />
                    <Tooltip 
                      contentStyle={{ border: '3px solid #0a0a0a', borderRadius: 0, boxShadow: '5px 5px 0px #0a0a0a', backgroundColor: '#ffffff', color: '#0a0a0a' }}
                      itemStyle={{ fontFamily: 'Space Grotesk', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="scope1" stroke="#00f0ff" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 2, stroke: '#0a0a0a' }} />
                    <Line type="monotone" dataKey="scope2" stroke="#ff0055" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 2, stroke: '#0a0a0a' }} />
                    <Line type="monotone" dataKey="scope3" stroke="#fcee0a" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 2, stroke: '#0a0a0a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>
          </Grid>

          {/* Status Section */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants} style={{ height: '100%' }}>
              <motion.div 
                whileHover={{ ...cardHover, boxShadow: '15px 15px 0px #00f0ff' }}
                style={{ 
                  height: '100%', 
                  border: '3px solid #0a0a0a', 
                  backgroundColor: '#0a0a0a', 
                  color: '#fff',
                  padding: '24px',
                  boxShadow: '10px 10px 0px #00f0ff',
                  borderRadius: '4px'
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ color: '#fff', textShadow: '2px 2px 0px #ff0055', fontFamily: '"Bangers", sans-serif', letterSpacing: 1 }}>
                  MISSION LOG
                </Typography>
                <Box sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.1rem', lineHeight: 2 }}>
                  <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #333" py={1}>
                    <span>STATUS:</span>
                    <span style={{ color: '#fcee0a', fontWeight: 'bold' }}>{report?.status || 'DRAFT'}</span>
                  </Box>
                  <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #333" py={1}>
                    <span>PERIOD:</span>
                    <span>{report?.period || 'N/A'}</span>
                  </Box>
                  <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #333" py={1}>
                    <span>RECORDS:</span>
                    <span style={{ fontWeight: 'bold', color: '#00f0ff' }}>
                      <AnimatedCounter value={report?.details?.records?.length || 0} />
                    </span>
                  </Box>
                </Box>
                
                <Stack spacing={2} mt={4}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      component={Link} 
                      to="/operator/reports" 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      sx={{ 
                        '&:hover': { bgcolor: '#fff' },
                        fontWeight: 'bold',
                        border: '2px solid #fff'
                      }}
                    >
                      FREEZE / NARRATIVE
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      component={Link} 
                      to="/operator/certificates" 
                      fullWidth 
                      variant="outlined" 
                      sx={{ 
                        borderColor: '#fff', 
                        color: '#fff',
                        fontWeight: 'bold',
                        border: '2px solid #fff',
                        '&:hover': { borderColor: '#00f0ff', color: '#00f0ff', bgcolor: 'rgba(0, 240, 255, 0.1)' }
                      }}
                    >
                      ISSUE CERTIFICATE
                    </Button>
                  </motion.div>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </MemeLayout>
  );
};

export default OperatorDashboard;
