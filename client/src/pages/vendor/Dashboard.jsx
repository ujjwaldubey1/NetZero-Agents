import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, TextField, Alert, Stack, Grid, LinearProgress, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Shield, CheckCircle, Bolt, Star } from '@mui/icons-material';
import gsap from 'gsap';
import UploadForm from '../../components/UploadForm';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import MemeLayout from '../../components/MemeLayout';
import { ASSETS } from '../../assets';

const HERO_IMG = ASSETS.ANIME_SPIDERMAN;
const AI_IMG = ASSETS.ANIME_IRONMAN;
const VILLAIN_IMG = ASSETS.VENDOR_VILLAIN;

const PowerBar = ({ value, max, label, color }) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
      <Typography variant="caption" sx={{ fontFamily: '"Bangers", sans-serif', fontSize: '0.9rem', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 'bold' }}>
        {value}/{max}
      </Typography>
    </Stack>
    <Box sx={{ position: 'relative', height: 20, bgcolor: '#0a0a0a', border: '2px solid #0a0a0a' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: ` linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </Box>
  </Box>
);

const ActionCard = ({ icon: Icon, title, subtitle, onClick, color, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Box
        onClick={onClick}
        sx={{
          position: 'relative',
          bgcolor: '#ffffff',
          border: '4px solid #0a0a0a',
          boxShadow: isHovered ? `12px 12px 0px ${color}` : `8px 8px 0px ${color}`,
          p: 3,
          cursor: onClick ? 'pointer' : 'default',
          transform: isHovered ? 'translate(-4px, -4px)' : 'none',
          transition: 'all 0.3s',
          overflow: 'visible',
        }}
      >
        {/* Icon Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 60,
            height: 60,
            bgcolor: color,
            border: '4px solid #0a0a0a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 4px 0px #0a0a0a',
            transform: isHovered ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg)',
            transition: 'transform 0.4s',
          }}
        >
          <Icon sx={{ fontSize: 30, color: '#ffffff' }} />
        </Box>

        <Typography variant="h5" sx={{ fontFamily: '"Bangers", sans-serif', mb: 1, pr: 5, letterSpacing: 1.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', color: '#666' }}>
          {subtitle}
        </Typography>
      </Box>
    </motion.div>
  );
};

const VendorDashboard = () => {
  const { user } = useAuth();
  const [latestProof, setLatestProof] = useState(null);
  const [value, setValue] = useState(50);
  const [threshold, setThreshold] = useState(100);
  const [message, setMessage] = useState(null);
  const [missionProgress, setMissionProgress] = useState(0);
  const [uploads, setUploads] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    // Animate hero entrance
    if (heroRef.current) {
      gsap.fromTo(heroRef.current,
        { y: -200, rotation: -45, opacity: 0 },
        { y: 0, rotation: 0, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.6)' }
      );
    }
  }, []);

  const prove = async () => {
    try {
      const res = await api.post('/api/zk/prove', { value, threshold });
      setLatestProof(res.data);
      setMessage('🛡️ SHIELD ACTIVATED! PROOF GENERATED!');
      setMissionProgress(prev => Math.min(prev + 30, 100));
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || err.message}`);
    }
  };

  const handleUpload = () => {
    setMessage('📡 INTEL UPLOADED SUCCESSFULLY!');
    setUploads(prev => prev + 1);
    setMissionProgress(prev => Math.min(prev + 25, 100));
  };

  return (
    <MemeLayout title="VENDOR HQ" subtitle={`Welcome back, ${user?.vendorName?.toUpperCase() || 'HERO'}`}>
      
      {/* MISSION STATUS BAR */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Box
          sx={{
            bgcolor: '#ffffff',
            border: '4px solid #0a0a0a',
            boxShadow: '8px 8px 0px #ff0055',
            p: 3,
            mb: 4,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Bolt sx={{ fontSize: 40, color: '#fcee0a' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 2 }}>
                MISSION PROGRESS
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk", sans-serif', opacity: 0.7 }}>
                Complete missions to save the world!
              </Typography>
            </Box>
            <Chip
              icon={<Star />}
              label={`LEVEL ${Math.floor (missionProgress / 20) + 1}`}
              sx={{
                bgcolor: '#00f0ff',
                color: '#0a0a0a',
                fontFamily: '"Bangers", sans-serif',
                fontSize: '1rem',
                border: '2px solid #0a0a0a',
                px: 1,
              }}
            />
          </Stack>
          <PowerBar value={missionProgress} max={100} label="HERO POWER" color="#00f0ff" />
          <PowerBar value={uploads * 2} max={10} label="DATA UPLOADS" color="#fcee0a" />
        </Box>
      </motion.div>

      {/* HERO SECTION */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={7}>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(0,240,255,0.1)',
                border: '3px dashed #00f0ff',
                borderRadius: 3,
                p: 4,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0,240,255,0.1)',
                  filter: 'blur(40px)',
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Bangers", sans-serif',
                  mb: 2,
                  color: '#0a0a0a',
                  textShadow: '3px 3px 0px #00f0ff',
                  letterSpacing: 2,
                }}
              >
                🦸 YOUR MISSION 🦸
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '1.1rem',
                  lineHeight: 1.7,
                  color: '#0a0a0a',
                }}
              >
                The city needs your clean data! Upload emission intel and generate zero-knowledge proofs to keep your
                secret identity safe while saving the planet. Every upload brings us closer to victory! 🌍✨
              </Typography>
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'relative', height: { xs: 300, md: 400 } }}>
            <motion.img
              ref={heroRef}
              src={HERO_IMG}
              alt="Hero"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 2, 0, -2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 30px rgba(0,240,255,0.6))',
                zIndex: 2,
              }}
            />
            
            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
              style={{
                position: 'absolute',
                top: '5%',
                left: -40,
                background: '#fcee0a',
                color: '#0a0a0a',
                padding: '20px 30px',
                borderRadius: '50%',
                fontFamily: '"Bangers", sans-serif',
                fontSize: '1.3rem',
                border: '4px solid #0a0a0a',
                boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
                zIndex: 3,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              TIME TO<br />SAVE THE<br />WORLD!
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -15,
                  right: 25,
                  width: 25,
                  height: 25,
                  bgcolor: '#fcee0a',
                  borderRight: '4px solid #0a0a0a',
                  borderBottom: '4px solid #0a0a0a',
                  transform: 'rotate(45deg)',
                }}
              />
            </motion.div>
          </Box>
        </Grid>
      </Grid>

      {/* ACTION CARDS */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <ActionCard
            icon={CloudUpload}
            title="UPLOAD INTEL"
            subtitle="Submit your emissions data to the mainframe"
            color="#00f0ff"
            delay={0.7}
          />
          
          <Box sx={{ mt: 3, p: 3, bgcolor: '#ffffff', border: '3px solid #00f0ff', borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <motion.img
                src={AI_IMG}
                alt="AI Sidekick"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '3px solid #0a0a0a',
                  objectFit: 'cover',
                }}
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontFamily: '"Bangers", sans-serif' }}>
                  AI SIDEKICK ONLINE
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Ready to analyze your data!
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ border: '2px dashed #00f0ff', p: 2, bgcolor: 'rgba(0,240,255,0.05)', borderRadius: 1 }}>
              <UploadForm defaultScope={3} onUploaded={handleUpload} />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <ActionCard
            icon={Shield}
            title="ZK PROOF SHIELD"
            subtitle="Generate cryptographic proof while keeping data secret"
            color="#fcee0a"
            delay={0.9}
          />
          
          <Box sx={{ mt: 3, p: 3, bgcolor: '#ffffff', border: '3px solid #fcee0a', borderRadius: 2, position: 'relative' }}>
            {/* Villain watermark */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                opacity: 0.08,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            >
              <img src={VILLAIN_IMG} alt="Villain" style={{ width: 200 }} />
            </Box>

            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <TextField
                label="⚡ ACTUAL VALUE (SECRET)"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fffef0',
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 'bold',
                    '& fieldset': { borderColor: '#0a0a0a', borderWidth: 2 },
                  },
                  '& label': { fontFamily: '"Bangers", sans-serif', fontSize: '1.1rem' },
                }}
              />
              
              <TextField
                label="🎯 COMPLIANCE THRESHOLD"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fffef0',
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 'bold',
                    '& fieldset': { borderColor: '#0a0a0a', borderWidth: 2 },
                  },
                  '& label': { fontFamily: '"Bangers", sans-serif', fontSize: '1.1rem' },
                }}
              />

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="contained"
                  onClick={prove}
                  fullWidth
                  size="large"
                  startIcon={<Shield />}
                  sx={{
                    bgcolor: '#ff0055',
                    color: '#ffffff',
                    fontFamily: '"Bangers", sans-serif',
                    fontSize: '1.8rem',
                    letterSpacing: 2,
                    py: 2,
                    border: '4px solid #0a0a0a',
                    boxShadow: '8px 8px 0px #0a0a0a',
                    '&:hover': {
                      bgcolor: '#d00045',
                      boxShadow: '4px 4px 0px #0a0a0a',
                      transform: 'translate(4px, 4px)',
                    },
                  }}
                >
                  ACTIVATE SHIELD
                </Button>
              </motion.div>

              <AnimatePresence>
                {latestProof && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Box
                      sx={{
                        bgcolor: '#0a0a0a',
                        p: 2,
                        border: '3px solid #00f0ff',
                        borderRadius: 1,
                        boxShadow: '0 0 20px rgba(0,240,255,0.5)',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <CheckCircle sx={{ color: '#00f0ff' }} />
                        <Typography variant="caption" sx={{ color: '#ffffff', fontFamily: '"Bangers", sans-serif', fontSize: '1rem' }}>
                          PROOF GENERATED!
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#00f0ff',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          fontSize: '0.75rem',
                        }}
                      >
                        {latestProof.proofId}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Floating Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ x: 300, opacity: 0, rotate: 10 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: 300, opacity: 0, rotate: -10 }}
            transition={{ type: 'spring', stiffness: 120 }}
            style={{
              position: 'fixed',
              bottom: 30,
              right: 30,
              zIndex: 1000,
            }}
          >
            <Alert
              severity="success"
              icon={false}
              onClose={() => setMessage(null)}
              sx={{
                bgcolor: '#fcee0a',
                color: '#0a0a0a',
                border: '4px solid #0a0a0a',
                boxShadow: '10px 10px 0px #0a0a0a',
                fontFamily: '"Bangers", sans-serif',
                fontSize: '1.3rem',
                letterSpacing: 1,
                px: 3,
                py: 2,
                '& .MuiAlert-action': {
                  color: '#0a0a0a',
                },
              }}
            >
              {message}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </MemeLayout>
  );
};

export default VendorDashboard;
