import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ComicCard = ({ title, value, subtitle, color, rotate }) => (
  <motion.div
    whileHover={{ scale: 1.05, rotate: 0 }}
    initial={{ rotate: rotate }}
  >
    <Box sx={{
      bgcolor: '#fff',
      border: '3px solid #0a0a0a',
      boxShadow: '8px 8px 0px #0a0a0a',
      p: 3,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '8px',
        bgcolor: color
      }} />
      
      <Typography variant="h6" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: color, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </Typography>
      
      <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1, textShadow: '2px 2px 0px #e0e0e0' }}>
        {value}
      </Typography>
      
      <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold', bgcolor: '#0a0a0a', color: '#fff', display: 'inline-block', px: 1, transform: 'skew(-10deg)' }}>
        {subtitle}
      </Typography>
      
      {/* Halftone dot overlay for texture */}
      <Box sx={{
        position: 'absolute',
        bottom: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `radial-gradient(${color} 20%, transparent 20%)`,
        backgroundSize: '10px 10px',
        opacity: 0.2
      }} />
    </Box>
  </motion.div>
);

const DashboardCards = ({ totals }) => {
  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12} md={4}>
        <ComicCard 
          title="Scope 1" 
          color="#00f0ff" 
          value={(totals.scope1?.diesel_co2_tons || 0).toFixed(2)} 
          subtitle="Combustion" 
          rotate={-2}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <ComicCard 
          title="Scope 2" 
          color="#ff0055" 
          value={(totals.scope2?.electricity_co2_tons || 0).toFixed(2)} 
          subtitle="Electricity" 
          rotate={1}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <ComicCard 
          title="Scope 3" 
          color="#fcee0a" 
          value={(totals.scope3?.upstream_co2_tons || 0).toFixed(2)} 
          subtitle="Supply Chain" 
          rotate={-1}
        />
      </Grid>
    </Grid>
  );
};

export default DashboardCards;
