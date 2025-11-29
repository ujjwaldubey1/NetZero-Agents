import React from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { ASSETS } from '../assets';

const MemeLayout = ({ children, title, subtitle }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        backgroundImage: `radial-gradient(#e0e0e0 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        color: '#0a0a0a',
        pb: 8,
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* Interactive Foreground Memes */}

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
