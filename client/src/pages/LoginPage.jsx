import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Container, TextField, Typography, Alert, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".comic-panel", {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
      });

      gsap.from(".hero-text", {
        x: -100,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handle = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else if (loggedInUser.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/operator/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        background: `
          radial-gradient(circle at 50% 50%, #e0e0e0 2px, transparent 2.5px)
        `,
        backgroundSize: '30px 30px',
        animation: 'pulseSize 4s ease-in-out infinite',
      }}
    >
      {/* Background Decor */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        bgcolor: '#00f0ff',
        opacity: 0.1,
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 300,
        height: 300,
        bgcolor: '#ff0055',
        opacity: 0.1,
        transform: 'rotate(45deg)',
        zIndex: 0
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side: Hero */}
          <Grid item xs={12} md={6}>
            <Box className="hero-text" sx={{ p: 4, border: '3px solid #0a0a0a', bgcolor: '#fff', boxShadow: '10px 10px 0px #0a0a0a', transform: 'rotate(-2deg)' }}>
              <Typography variant="h2" className="glitch-text" data-text="ENTER THE" sx={{ fontSize: { xs: '3rem', md: '4rem' }, lineHeight: 0.9 }}>
                ENTER THE
              </Typography>
              <Typography variant="h2" sx={{ color: '#ff0055', fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 0.9 }}>
                MULTIVERSE
              </Typography>
              <Typography variant="h5" sx={{ mt: 2, fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold' }}>
                Secure. Scalable. <span style={{ background: '#fcee0a', padding: '0 5px' }}>Zero Carbon.</span>
              </Typography>
            </Box>
          </Grid>

          {/* Right Side: Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              className="comic-panel"
              elevation={0}
              sx={{
                p: 4,
                bgcolor: '#fff',
                border: '3px solid #0a0a0a',
                boxShadow: '15px 15px 0px #0a0a0a',
                transform: 'rotate(1deg)'
              }}
            >
              <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', transform: 'rotate(-1deg)' }}>
                IDENTITY VERIFICATION
              </Typography>

              <Box component="form" onSubmit={handle} display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="AGENT ID (EMAIL)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ style: { fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '1px' } }}
                />
                <TextField
                  label="SECRET KEY (PASSWORD)"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ style: { fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '1px' } }}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.5,
                      fontSize: '1.5rem',
                      bgcolor: '#00f0ff',
                      color: '#0a0a0a',
                      border: '3px solid #0a0a0a',
                      boxShadow: '5px 5px 0px #0a0a0a',
                      '&:hover': {
                        bgcolor: '#ff0055',
                        color: '#fff',
                        boxShadow: '8px 8px 0px #0a0a0a',
                      }
                    }}
                  >
                    INITIATE LINK
                  </Button>
                </motion.div>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2, border: '2px solid #0a0a0a', borderRadius: 0, fontWeight: 'bold' }}>
                  {error}
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;
