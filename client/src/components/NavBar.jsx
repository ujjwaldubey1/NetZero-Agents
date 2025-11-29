import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const NavButton = ({ to, children }) => {
  return (
    <Button
      component={Link}
      to={to}
      sx={{
        mx: 0.5,
        bgcolor: '#fff',
        color: '#0a0a0a',
        border: '2px solid #0a0a0a',
        boxShadow: '3px 3px 0px #0a0a0a',
        '&:hover': {
          bgcolor: '#00f0ff',
          transform: 'translate(-2px, -2px)',
          boxShadow: '5px 5px 0px #0a0a0a',
        },
      }}
    >
      {children}
    </Button>
  );
};

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const navConfig = {
    operator: [
      { to: '/operator/dashboard', label: 'Dashboard' },
      { to: '/operator/datacenters', label: 'Data centers' },
      { to: '/operator/vendors', label: 'Vendors' },
      { to: '/operator/staff', label: 'Staff' },
      { to: '/operator/reports', label: 'Reports' },
      { to: '/operator/certificates', label: 'Certs' },
      { to: '/operator/chain', label: 'Chain' },
      { to: '/operator/privacy', label: 'Privacy' },
    ],
    admin: [
      { to: '/operator/dashboard', label: 'Dashboard' },
      { to: '/operator/datacenters', label: 'Data centers' },
      { to: '/operator/vendors', label: 'Vendors' },
      { to: '/operator/staff', label: 'Staff' },
      { to: '/operator/reports', label: 'Reports' },
      { to: '/operator/certificates', label: 'Certs' },
      { to: '/operator/chain', label: 'Chain' },
      { to: '/operator/privacy', label: 'Privacy' },
    ],
    vendor: [
      { to: '/vendor/dashboard', label: 'Dashboard' },
      { to: '/vendor/upload', label: 'Upload' },
      { to: '/vendor/chain', label: 'Chain' },
      { to: '/vendor/privacy', label: 'Privacy' },
    ],
    staff: [
      { to: '/staff/dashboard', label: 'Dashboard' },
      { to: '/staff/upload', label: 'Upload' },
      { to: '/operator/chain', label: 'Chain' },
      { to: '/operator/privacy', label: 'Privacy' },
    ],
  };

  const navItems = navConfig[role] || [];

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0} 
      sx={{ 
        pt: 2, 
        pb: 2,
        background: 'transparent',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
          >
            <Typography 
              variant="h4" 
              className="glitch-text" 
              data-text="NetZero Agents"
              sx={{ 
                color: '#0a0a0a', 
                transform: 'rotate(-2deg)',
                bgcolor: '#fcee0a',
                px: 2,
                border: '3px solid #0a0a0a',
                boxShadow: '5px 5px 0px #0a0a0a'
              }}
            >
              NetZero Agents
            </Typography>
          </motion.div>
          
          <Box sx={{ 
            bgcolor: '#0a0a0a', 
            color: '#fff', 
            px: 1, 
            py: 0.5, 
            fontFamily: '"Bebas Neue", sans-serif',
            transform: 'rotate(2deg)'
          }}>
            Cardano • CIP-68 Carbon • Mausami
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: 'flex-end' }}>
          {navItems.map((item) => (
            <NavButton key={item.to} to={item.to}>{item.label}</NavButton>
          ))}
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => { logout(); navigate('/login'); }}
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
