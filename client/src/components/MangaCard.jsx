import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';

const MangaCard = ({ 
  children, 
  className = '',
  variant = 'cut', // 'cut', 'tech', 'rect'
  bgColor = '#fff',
  borderColor = '#0a0a0a',
  shadowColor = '#0a0a0a',
  sx = {},
  delay = 0
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initial animation
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, delay: delay, ease: 'power3.out' }
    );

    // Random glitch function
    const runGlitch = () => {
      if (!cardRef.current) return;
      const tl = gsap.timeline();
      tl.to(cardRef.current, { skewX: 15, x: -5, duration: 0.05, ease: 'power4.inOut' })
        .to(cardRef.current, { skewX: -15, x: 5, duration: 0.05, ease: 'power4.inOut' })
        .to(cardRef.current, { skewX: 5, x: -2, opacity: 0.9, duration: 0.05 })
        .to(cardRef.current, { skewX: 0, x: 0, opacity: 1, duration: 0.05 });
    };

    // Start random glitch loop
    const randomLoop = () => {
      if (Math.random() > 0.85) { // 15% chance to glitch
        runGlitch();
      }
      gsap.delayedCall(2 + Math.random() * 4, randomLoop); // Check again in 2-6 seconds
    };
    
    gsap.delayedCall(1 + Math.random(), randomLoop); // Start after initial delay

    return () => {
      gsap.killTweensOf(cardRef.current);
    };
  }, [delay]);

  // Clip paths for different variants
  const getClipPath = () => {
    switch (variant) {
      case 'cut':
        // Cut corners: top-left and bottom-right
        return 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)';
      case 'tech':
        // Tech/Cyber look: angled cuts
        return 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))';
      case 'rect':
      default:
        return 'none';
    }
  };

  return (
    <Box
      ref={cardRef}
      className={`manga-card ${className}`}
      sx={{
        position: 'relative',
        zIndex: 1,
        filter: `drop-shadow(10px 10px 0px ${shadowColor})`,
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          filter: `drop-shadow(15px 15px 0px ${shadowColor})`,
        },
        ...sx
      }}
    >
      <Box
        sx={{
          bgcolor: bgColor,
          border: `3px solid ${borderColor}`,
          clipPath: getClipPath(),
          p: { xs: 3, md: 4 },
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MangaCard;
