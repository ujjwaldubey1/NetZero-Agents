import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Grid, Typography, Stack, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api';
import DashboardCards from '../../components/DashboardCards';
import MemeLayout from '../../components/MemeLayout';
import gsap from 'gsap';

import { ASSETS } from '../../assets';

const OperatorDashboard = () => {
  const [report, setReport] = useState(null);
  const [trend, setTrend] = useState([]);
  const [error, setError] = useState(null);
  const period = '2025-Q4';
  const containerRef = useRef(null);

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-item", {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, [report]);

  return (
    <MemeLayout>
      <Box ref={containerRef}>
        {/* Header Section */}
        <Box className="dashboard-item" mb={4}>
          <Box sx={{ 
            border: '3px solid #0a0a0a', 
            p: 3, 
            bgcolor: '#ffffff', 
            boxShadow: '10px 10px 0px #0a0a0a',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box 
              component="img" 
              src={ASSETS.HERO_DEV} 
              sx={{ 
                position: 'absolute', 
                top: -40, 
                left: -20, 
                width: 100, 
                transform: 'rotate(-10deg)', 
                zIndex: 10,
                filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.2))'
              }} 
            />
            <Box sx={{ ml: { xs: 0, md: 8 } }}>
              <Typography variant="h3" sx={{ color: '#0a0a0a', transform: 'rotate(-1deg)', textShadow: '3px 3px 0px #00f0ff' }}>
                OPERATOR COMMAND
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold', bgcolor: '#fcee0a', color: '#0a0a0a', display: 'inline-block', px: 1, transform: 'rotate(1deg)', border: '2px solid #0a0a0a' }}>
                MISSION: ZERO CARBON
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" color="primary" onClick={() => alert('Vendor invite bot triggered')}>Vendor Invite Bot</Button>
              <Button variant="outlined" sx={{ color: '#0a0a0a', borderColor: '#0a0a0a', '&:hover': { bgcolor: '#fcee0a' } }} onClick={() => alert('Report checks bot triggered')}>Report Checks Bot</Button>
              <Button variant="contained" color="secondary" onClick={() => alert('Agent triggered')}>Agent</Button>
            </Stack>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2, border: '3px solid #0a0a0a', boxShadow: '5px 5px 0px #0a0a0a' }}>{error}</Alert>}

        <Box className="dashboard-item">
          {report && <DashboardCards totals={report.scopeTotals || {}} />}
        </Box>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Chart Section */}
          <Grid item xs={12} md={8}>
            <Box className="dashboard-item" sx={{ 
              height: '100%', 
              border: '3px solid #0a0a0a', 
              bgcolor: '#ffffff', 
              p: 3,
              boxShadow: '10px 10px 0px #0a0a0a',
              position: 'relative',
              overflow: 'visible'
            }}>
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
              <Typography variant="h5" gutterBottom sx={{ borderBottom: '3px solid #fcee0a', display: 'inline-block', mb: 2, color: '#0a0a0a' }}>
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
            </Box>
          </Grid>

          {/* Status Section */}
          <Grid item xs={12} md={4}>
            <Box className="dashboard-item" sx={{ 
              height: '100%', 
              border: '3px solid #0a0a0a', 
              bgcolor: '#0a0a0a', 
              color: '#fff',
              p: 3,
              boxShadow: '10px 10px 0px #00f0ff' // Cyan shadow for contrast
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#fff', textShadow: '2px 2px 0px #ff0055' }}>
                MISSION LOG
              </Typography>
              <Box sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.1rem', lineHeight: 2 }}>
                <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #333" py={1}>
                  <span>STATUS:</span>
                  <span style={{ color: '#fcee0a' }}>{report?.status || 'DRAFT'}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #333" py={1}>
                  <span>PERIOD:</span>
                  <span>{report?.period || 'N/A'}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #333" py={1}>
                  <span>RECORDS:</span>
                  <span>{report?.details?.records?.length || 0}</span>
                </Box>
              </Box>
              
              <Stack spacing={2} mt={4}>
                <Button 
                  component={Link} 
                  to="/operator/reports" 
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  sx={{ 
                    '&:hover': { bgcolor: '#fff' }
                  }}
                >
                  FREEZE / NARRATIVE
                </Button>
                <Button 
                  component={Link} 
                  to="/operator/certificates" 
                  fullWidth 
                  variant="outlined" 
                  sx={{ 
                    borderColor: '#fff', 
                    color: '#fff',
                    '&:hover': { borderColor: '#00f0ff', color: '#00f0ff' }
                  }}
                >
                  ISSUE CERTIFICATE
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MemeLayout>
  );
};

export default OperatorDashboard;
