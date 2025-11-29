import React from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { ASSETS } from '../assets';

const MemeLayout = ({ children, title, subtitle, bgPattern, bgImage, bgSize, bgPosition, sx }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        backgroundImage: bgImage ? `url(${bgImage})` : (bgPattern || `radial-gradient(#e0e0e0 1px, transparent 1px)`),
        backgroundSize: bgSize || (bgImage ? 'cover' : (bgPattern ? 'auto' : '20px 20px')),
        backgroundPosition: bgPosition || (bgImage ? 'center' : '0 0'),
        color: '#0a0a0a',
        pb: 8,
        overflowX: 'hidden',
        position: 'relative',
        ...sx
      }}
    >
      {/* Interactive Foreground Memes */}
      <Box
        component={motion.div}
        initial="rest"
        animate="rest"
        whileHover="hover"
        sx={{ position: 'fixed', bottom: 0, right: 20, zIndex: 10, pointerEvents: 'auto', p: 4 }}
      >
        <motion.img
          src={ASSETS.HERO_DEV}
          alt="Hero Dev"
          style={{ width: '200px', height: 'auto', display: 'block' }}
          variants={{
            rest: { x: 0, y: 0, opacity: 1, scale: 1 },
            hover: { x: 220, y: 140, opacity: 0.3, scale: 0.5 },
          }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        />
        <motion.div
          variants={{
            rest: { x: 0, opacity: 1, scale: 1 },
            hover: { x: 220, opacity: 0.3, scale: 0.7 },
          }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          style={{
            position: 'absolute',
            top: -60,
            right: 150,
            background: '#fff',
            border: '3px solid #0a0a0a',
            padding: '10px',
            borderRadius: '20px',
            boxShadow: '5px 5px 0px #0a0a0a',
            fontFamily: '"Permanent Marker", cursive',
            whiteSpace: 'nowrap'
          }}
        >
          Ship it! 🚀
        </motion.div>
      </Box>

      <Box
        component={motion.div}
        initial="rest"
        animate="rest"
        whileHover="hover"
        sx={{ position: 'fixed', bottom: 0, left: 20, zIndex: 9, pointerEvents: 'auto', display: { xs: 'none', md: 'block' }, p: 4 }}
      >
        <motion.img
          src={ASSETS.SNAKE_MEME}
          alt="Villain Bug"
          style={{ width: '150px', height: 'auto', display: 'block', transform: 'scaleX(-1)' }}
          variants={{
            rest: { x: 0, y: 0, opacity: 1, scale: 1 },
            hover: { x: -220, y: -140, opacity: 0.3, scale: 0.5 },
          }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 4 }}>
        {(title || subtitle) && (
          <Box mb={4} sx={{ position: 'relative', display: 'inline-block' }}>
            {title && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 style={{
                  fontFamily: '"Bebas Neue", "Bangers", sans-serif',
                  fontSize: '4rem',
                  color: '#0a0a0a',
                  textShadow: '3px 3px 0px #00f0ff',
                  margin: 0,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {title}
                </h1>
                {/* Decoration behind title */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: -10,
                  width: '100%',
                  height: '20px',
                  bgcolor: '#fcee0a',
                  zIndex: -1,
                  transform: 'rotate(-1deg)'
                }} />
              </motion.div>
            )}
            {subtitle && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '1.5rem',
                  color: '#0a0a0a',
                  marginTop: '10px',
                  fontWeight: 500,
                  background: '#fff',
                  display: 'inline-block',
                  padding: '5px 10px',
                  border: '2px solid #0a0a0a',
                  boxShadow: '4px 4px 0px #0a0a0a'
                }}>
                  {subtitle}
                </p>
              </motion.div>
            )}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
};

export default MemeLayout;
