import React from 'react';
import { Box, Typography, Stack, Grid, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { CloudUpload, Science, Bolt } from '@mui/icons-material';
import UploadForm from '../../components/UploadForm';
import MemeLayout from '../../components/MemeLayout';
import { ASSETS } from '../../assets';

const ScopeCard = ({ scope, title, subtitle, color, delay }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#ffffff',
          border: '4px solid #0a0a0a',
          boxShadow: isHovered ? `12px 12px 0px ${color}` : `8px 8px 0px ${color}`,
          p: 3,
          transform: isHovered ? 'translate(-4px, -4px)' : 'none',
          transition: 'all 0.3s',
          overflow: 'visible',
          minHeight: 450,
        }}
      >
        {/* Scope Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 70,
            height: 70,
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
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Bangers", sans-serif',
              color: scope === 1 ? '#0a0a0a' : '#ffffff',
              transform: isHovered ? 'rotate(-180deg)' : 'none',
              transition: 'transform 0.4s',
            }}
          >
            {scope}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Bangers", sans-serif',
            mb: 1,
            pr: 6,
            letterSpacing: 1.5,
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            color: '#666',
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </Typography>

        <Box
          sx={{
            border: `3px dashed ${color}`,
            borderRadius: 2,
            p: 2,
            bgcolor: `${color}10`,
          }}
        >
          <UploadForm allowedScopes={[scope]} />
        </Box>
      </Box>
    </motion.div>
  );
};

const UploadDataPage = () => {
  return (
    <MemeLayout title="STAFF UPLOAD HQ" subtitle="Upload two files: one for Scope 1 and one for Scope 2. Assigned datacenter required.">
      
      {/* MISSION BRIEFING */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Box
          sx={{
            bgcolor: '#ffffff',
            border: '4px solid #0a0a0a',
            boxShadow: '8px 8px 0px #00f0ff',
            p: 3,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glow */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              bgcolor: 'rgba(0,240,255,0.1)',
              filter: 'blur(60px)',
            }}
          />
          
          <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#fcee0a',
                border: '4px solid #0a0a0a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '4px 4px 0px #0a0a0a',
              }}
            >
              <Bolt sx={{ fontSize: 35, color: '#0a0a0a' }} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Bangers", sans-serif',
                  letterSpacing: 2,
                  color: '#0a0a0a',
                  textShadow: '2px 2px 0px #00f0ff',
                }}
              >
                ⚡ DATA UPLOAD MISSION ⚡
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: '#666',
                  mt: 0.5,
                }}
              >
                Upload emissions data for Scope 1 (direct) and Scope 2 (electricity). AI will parse and validate automatically!
              </Typography>
            </Box>
            
            <Chip
              icon={<Science />}
              label="AI POWERED"
              sx={{
                bgcolor: '#ff0055',
                color: '#ffffff',
                fontFamily: '"Bangers", sans-serif',
                fontSize: '1rem',
                border: '2px solid #0a0a0a',
                px: 1,
              }}
            />
          </Stack>
        </Box>
      </motion.div>

      {/* HERO SECTION */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={7}>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(252,238,10,0.1)',
                border: '3px dashed #fcee0a',
                borderRadius: 3,
                p: 4,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: 'rgba(252,238,10,0.15)',
                  filter: 'blur(40px)',
                }}
              />
              
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Bangers", sans-serif',
                  mb: 2,
                  color: '#0a0a0a',
                  textShadow: '3px 3px 0px #fcee0a',
                  letterSpacing: 2,
                }}
              >
                📊 UPLOAD GUIDE 📊
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Bangers", sans-serif',
                      color: '#ff0055',
                      letterSpacing: 1,
                    }}
                  >
                    SCOPE 1 - DIRECT EMISSIONS
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', color: '#666' }}>
                    Fuel combustion, company vehicles, on-site generators
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Bangers", sans-serif',
                      color: '#00f0ff',
                      letterSpacing: 1,
                    }}
                  >
                    SCOPE 2 - ELECTRICITY
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', color: '#666' }}>
                    Purchased electricity, heat, steam, cooling
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'relative', height: { xs: 300, md: 400 } }}>
            <motion.img
              src={ASSETS.BLOCK_PUSHING}
              alt="Data Upload Hero"
              animate={{
                y: [0, -10, 0],
                x: [0, 5, 0],
              }}
              transition={{
                duration: 4,
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
                filter: 'drop-shadow(0px 10px 30px rgba(252,238,10,0.6))',
                zIndex: 2,
              }}
            />

            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
              style={{
                position: 'absolute',
                top: '15%',
                left: -30,
                background: '#ff0055',
                color: '#ffffff',
                padding: '20px 30px',
                borderRadius: '50%',
                fontFamily: '"Bangers", sans-serif',
                fontSize: '1.2rem',
                border: '4px solid #0a0a0a',
                boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
                zIndex: 3,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              UPLOAD<br />THE DATA!
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -15,
                  right: 25,
                  width: 25,
                  height: 25,
                  bgcolor: '#ff0055',
                  borderRight: '4px solid #0a0a0a',
                  borderBottom: '4px solid #0a0a0a',
                  transform: 'rotate(45deg)',
                }}
              />
            </motion.div>
          </Box>
        </Grid>
      </Grid>

      {/* UPLOAD CARDS */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ScopeCard
            scope={1}
            title="SCOPE 1 UPLOAD"
            subtitle="Direct emissions from sources owned or controlled by your organization. Upload fuel combustion data, vehicle emissions, and on-site generation records."
            color="#fcee0a"
            delay={0.6}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ScopeCard
            scope={2}
            title="SCOPE 2 UPLOAD"
            subtitle="Indirect emissions from purchased electricity, steam, heat, and cooling. Upload utility bills and energy consumption data for your assigned datacenter."
            color="#00f0ff"
            delay={0.8}
          />
        </Grid>
      </Grid>

      {/* AI Assistant decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
        style={{
          position: 'fixed',
          bottom: 30,
          left: 30,
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 100,
            height: 100,
          }}
        >
          <motion.img
            src={ASSETS.ANIME_ROBOT}
            alt="AI Assistant"
            animate={{
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.3))',
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              bgcolor: '#ffffff',
              border: '3px solid #0a0a0a',
              borderRadius: '20px',
              padding: '8px 12px',
              fontFamily: '"Bangers", sans-serif',
              fontSize: '0.9rem',
              boxShadow: '4px 4px 0px #0a0a0a',
              whiteSpace: 'nowrap',
            }}
          >
            AI READY! 🤖
            <Box
              sx={{
                position: 'absolute',
                bottom: -10,
                left: 20,
                width: 15,
                height: 15,
                bgcolor: '#ffffff',
                borderRight: '3px solid #0a0a0a',
                borderBottom: '3px solid #0a0a0a',
                transform: 'rotate(45deg)',
              }}
            />
          </Box>
        </Box>
      </motion.div>
    </MemeLayout>
  );
};

export default UploadDataPage;
