import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Container, Typography, Grid, Paper, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { ASSETS } from '../assets';

// Asset paths
const BG_IMG = ASSETS.BG_CITY;
const HERO_IMG = ASSETS.HERO_DEV;
const BUG_IMG = ASSETS.VILLAIN_BUG;
const AI_IMG = ASSETS.SIDEKICK_AI;
const MANGA_STRESS = ASSETS.STRESSED_MANAGER;
const MANGA_HERO = ASSETS.HERO_AWAKENING;

// Cover Page Component
const CoverPage = () => {
  const coverRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!coverRef.current || !contentRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cover = coverRef.current;
    const content = contentRef.current;

    // Shatter effect for cover page
    ScrollTrigger.create({
      trigger: cover,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Shatter transformations
        const scale = 1 + (progress * 0.5);
        const rotation = progress * 20;
        const skewX = progress * 25;
        const blur = progress * 20;
        const opacity = 1 - progress;
        const y = progress * -150;

        gsap.set(content, {
          scale: scale,
          rotation: rotation,
          skewX: skewX,
          filter: `blur(${blur}px)`,
          opacity: opacity,
          y: y,
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === cover) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <Box
      ref={coverRef}
      sx={{
        position: 'sticky',
        top: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10, // Above all chapters
      }}
    >
      <Box
        ref={contentRef}
        sx={{
          position: 'relative',
          width: { xs: '95%', md: '90%' },
          maxWidth: '1300px',
          minHeight: { xs: '85vh', md: '90vh' },
          bgcolor: '#0a0a0a',
          border: { xs: '4px solid #00f0ff', md: '6px solid #00f0ff' },
          boxShadow: '0px 0px 100px rgba(0,240,255,0.5), inset 0px 0px 50px rgba(0,240,255,0.2)',
          p: { xs: 3, sm: 4, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          background: `
            radial-gradient(circle at 50% 50%, transparent 0%, transparent 20%, rgba(0, 240, 255, 0.05) 20%, rgba(0, 240, 255, 0.05) 21%, transparent 21%),
            radial-gradient(circle at 50% 50%, transparent 0%, transparent 40%, rgba(255, 0, 85, 0.05) 40%, rgba(255, 0, 85, 0.05) 41%, transparent 41%),
            linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)
          `,
        }}
      >
        {/* Decorative Halftone Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(#00f0ff 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px',
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Glitched CARDANO Title - Spider-Verse Style */}
          <Box sx={{ position: 'relative', mb: 4 }}>
            {/* Main Title */}
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: { xs: '3rem', sm: '4.5rem', md: '8rem' },
                color: '#fff',
                lineHeight: 0.9,
                letterSpacing: { xs: '4px', md: '8px' },
                position: 'relative',
                zIndex: 3,
              }}
            >
              CARDANO
            </Typography>

            {/* Red Channel Offset */}
            <Typography
              variant="h1"
              aria-hidden="true"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: { xs: '3rem', sm: '4.5rem', md: '8rem' },
                color: '#ff0055',
                lineHeight: 0.9,
                letterSpacing: { xs: '4px', md: '8px' },
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
                mixBlendMode: 'screen',
                animation: 'glitch-red 0.3s infinite',
                '@keyframes glitch-red': {
                  '0%': { transform: 'translateX(-50%) translateX(-2px) skewX(1deg)' },
                  '20%': { transform: 'translateX(-50%) translateX(1px) skewX(-0.5deg)' },
                  '40%': { transform: 'translateX(-50%) translateX(-1px) skewX(0.5deg)' },
                  '60%': { transform: 'translateX(-50%) translateX(1px) skewX(-1deg)' },
                  '80%': { transform: 'translateX(-50%) translateX(-1px) skewX(0.5deg)' },
                  '100%': { transform: 'translateX(-50%) translateX(0px) skewX(0deg)' },
                },
              }}
            >
              CARDANO
            </Typography>

            {/* Cyan Channel Offset */}
            <Typography
              variant="h1"
              aria-hidden="true"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: { xs: '3rem', sm: '4.5rem', md: '8rem' },
                color: '#00f0ff',
                lineHeight: 0.9,
                letterSpacing: { xs: '4px', md: '8px' },
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                mixBlendMode: 'screen',
                animation: 'glitch-cyan 0.3s infinite',
                '@keyframes glitch-cyan': {
                  '0%': { transform: 'translateX(-50%) translateX(2px) skewX(-1deg)' },
                  '20%': { transform: 'translateX(-50%) translateX(-1px) skewX(0.5deg)' },
                  '40%': { transform: 'translateX(-50%) translateX(1px) skewX(-0.5deg)' },
                  '60%': { transform: 'translateX(-50%) translateX(-1px) skewX(1deg)' },
                  '80%': { transform: 'translateX(-50%) translateX(1px) skewX(-0.5deg)' },
                  '100%': { transform: 'translateX(-50%) translateX(0px) skewX(0deg)' },
                },
              }}
            >
              CARDANO
            </Typography>

            {/* Yellow Accent Offset */}
            <Typography
              variant="h1"
              aria-hidden="true"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: { xs: '3rem', sm: '4.5rem', md: '8rem' },
                color: '#fcee0a',
                lineHeight: 0.9,
                letterSpacing: { xs: '4px', md: '8px' },
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 0,
                opacity: 0.5,
                animation: 'glitch-yellow 0.5s infinite',
                '@keyframes glitch-yellow': {
                  '0%': { transform: 'translateX(-50%) translateY(0px) scale(1)' },
                  '25%': { transform: 'translateX(-50%) translateY(-1px) scale(1.005)' },
                  '50%': { transform: 'translateX(-50%) translateY(1px) scale(0.995)' },
                  '75%': { transform: 'translateX(-50%) translateY(-0.5px) scale(1.005)' },
                  '100%': { transform: 'translateX(-50%) translateY(0px) scale(1)' },
                },
              }}
            >
              CARDANO
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '3.5rem' },
              color: '#fff',
              mb: { xs: 3, md: 6 },
              letterSpacing: { xs: '2px', md: '4px' },
            }}
          >
            ESG COMPLIANCE AUTOMATION
          </Typography>

          {/* Glitched Subtitle - Distortion Style */}
          <Box sx={{ position: 'relative', mb: 8 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.5rem' },
                color: '#00f0ff',
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 2,
                textShadow: '0px 0px 10px rgba(0,240,255,0.5)',
                px: { xs: 2, md: 0 },
              }}
            >
              Transforming data center carbon compliance from fragmented chaos into streamlined, blockchain-verified certainty.
            </Typography>

            {/* Scanline overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px)',
                pointerEvents: 'none',
                animation: 'scan 8s linear infinite',
                '@keyframes scan': {
                  '0%': { transform: 'translateY(0%)' },
                  '100%': { transform: 'translateY(100%)' },
                },
              }}
            />
          </Box>

          {/* Scroll Indicator - Hidden on very small screens */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-20px)' },
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                color: '#fcee0a',
                letterSpacing: '3px',
                mb: 2,
              }}
            >
              ↓ SCROLL TO BEGIN ↓
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

// Hand-drawn Manga Page Component with Shatter Effect
const MangaChapter = ({
  chapterNumber,
  title,
  subtitle,
  children,
  direction = 'right',
  bgColor = '#ffffff',
  textColor = '#0a0a0a',
  totalChapters = 7
}) => {
  const chapterRef = useRef(null);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!chapterRef.current || !pageRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const chapter = chapterRef.current;
    const page = pageRef.current;

    // Find the next chapter to control its visibility
    const nextChapter = document.querySelector(`.chapter-${chapterNumber + 1} .manga-page-frame`);

    // Shatter effect: disintegrate the current chapter to reveal the next one
    // Start shatter when chapter center hits viewport center (don't wait till end)
    ScrollTrigger.create({
      trigger: chapter,
      start: 'bottom 80%', // Start when bottom of chapter is at 80% - requires a bit more scrolling
      end: 'bottom top', // End shatter when bottom of chapter hits top of viewport
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Shatter transformations for current page
        const scale = 1 + (progress * 0.3); // Scale up
        const rotation = progress * 15; // Rotate slightly
        const skewX = progress * 20; // Skew horizontal
        const blur = progress * 15; // Blur effect
        const opacity = 1 - progress; // Fade out
        const y = progress * -100; // Move up

        gsap.set(page, {
          scale: scale,
          rotation: rotation,
          skewX: skewX,
          filter: `blur(${blur}px)`,
          opacity: opacity,
          y: y,
        });

        // Fade in the next chapter early (at 40% progress) for cinematic effect
        if (nextChapter) {
          const nextOpacity = progress > 0.4 ? (progress - 0.4) / 0.6 : 0;
          gsap.set(nextChapter, {
            opacity: nextOpacity,
          });
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === chapter) {
          trigger.kill();
        }
      });
    };
  }, [chapterNumber]);

  return (
    <Box
      ref={chapterRef}
      className={`manga-chapter-page chapter-${chapterNumber}`}
      sx={{
        position: 'sticky',
        top: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: totalChapters - chapterNumber + 1, // Reverse z-index: Chapter 1 = 7, Chapter 7 = 1
        perspective: '2000px',
        py: { xs: 2, md: 0 }, // Add padding on mobile
      }}
    >
      <Box
        ref={pageRef}
        className="manga-page-frame"
        data-chapter={chapterNumber}
        sx={{
          position: 'relative',
          width: '90%',
          maxWidth: '1300px',
          minHeight: '90vh',
          bgcolor: bgColor,
          border: '4px solid #0a0a0a',
          boxShadow: '0px 30px 60px rgba(0,0,0,0.5)',
          p: { xs: 4, md: 8 },
          overflow: 'auto',
          transformStyle: 'preserve-3d',
          opacity: chapterNumber === 1 ? 1 : 0, // Hide all chapters except the first
        }}
      >
        {/* Page Number / Corner Marker */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            p: { xs: 1.5, md: 2 },
            bgcolor: '#0a0a0a',
            color: '#fff',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            zIndex: 10,
          }}
        >
          PAGE {chapterNumber.toString().padStart(2, '0')}
        </Box>

        {/* Decorative Texture */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.03,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                letterSpacing: { xs: '3px', md: '6px' },
                fontSize: { xs: '0.9rem', md: '1.25rem' },
                color: textColor,
                opacity: 0.7,
                mb: 1,
              }}
            >
              CHAPTER {chapterNumber}
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '6rem' },
                color: textColor,
                textShadow: textColor === '#0a0a0a' ? '5px 5px 0px #00f0ff' : '5px 5px 0px #0a0a0a',
                mb: { xs: 2, md: 3 },
                lineHeight: 0.9,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  color: textColor,
                  opacity: 0.9,
                  maxWidth: '900px',
                  mx: 'auto',
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box>
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

// New Manga Card Component (Replaces SlantedPanel)
const MangaCard = ({
  children,
  className = '',
  variant = 'cut', // 'cut', 'tech', 'rect'
  bgColor = '#fff',
  borderColor = '#0a0a0a',
  shadowColor = '#0a0a0a',
  sx = {}
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

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
      if (Math.random() > 0.7) { // 30% chance to glitch
        runGlitch();
      }
      gsap.delayedCall(0.5 + Math.random() * 1.5, randomLoop); // Check again in 0.5-2 seconds
    };

    gsap.delayedCall(0.5, randomLoop); // Start after 0.5 seconds

    return () => {
      gsap.killTweensOf(cardRef.current);
    };
  }, []);

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
        filter: `drop-shadow(10px 10px 0px ${shadowColor})`, // Drop shadow works with clip-path
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

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax Background Effect
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: '100vh',
        bgcolor: '#1a1a1a',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Fixed Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${BG_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            y: bgY,
            scale: bgScale,
            filter: 'grayscale(100%) contrast(120%) brightness(0.4)', // Darkened for content pop
          }}
        />
        {/* Speed Lines Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
            backgroundSize: '100% 100%',
          }}
        />
      </Box>

      {/* Content Container - Natural Scroll */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* COVER PAGE */}
        <CoverPage />

        {/* CHAPTER 1: THE PROBLEM */}
        <MangaChapter
          chapterNumber={1}
          title="THE FRAGMENTED REALITY"
          subtitle="Data centers are the digital backbone of modern business, yet their environmental reporting remains stuck in the past."
          bgColor="#ffffff"
          totalChapters={7}
        >
          <Grid container spacing={6} alignItems="center" sx={{ mb: 8 }}>
            <Grid item xs={12} md={6}>
              <MangaCard variant="cut" shadowColor="#0a0a0a">
                <Typography variant="h3" gutterBottom sx={{ color: '#ff0055', fontFamily: '"Bebas Neue", sans-serif' }}>
                  THE CHAOS
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  Every quarter, sustainability and facility teams wrestle with fragmented data—diesel logs in spreadsheets, refrigerant records in maintenance reports, electricity readings locked in DCIM dashboards, and supplier footprints scattered across emails.
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Scope 1 fuel and refrigerant data is collected manually.</Typography></li>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Scope 2 electricity data is highly automated but siloed within infrastructure systems.</Typography></li>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Scope 3 supplier data requires weeks of follow-ups and inconsistent formats.</Typography></li>
                </Box>
              </MangaCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <MangaCard variant="tech" shadowColor="rgba(0,0,0,0.3)" bgColor="transparent" borderColor="transparent" sx={{ p: 0 }}>
                <Box sx={{ position: 'relative' }}>
                  <motion.img
                    src={MANGA_STRESS}
                    alt="Stressed manager"
                    style={{
                      width: '100%',
                      border: '4px solid #0a0a0a',
                      display: 'block',
                    }}
                  />
                </Box>
              </MangaCard>
            </Grid>
          </Grid>

          <MangaCard variant="rect" bgColor="#0a0a0a" borderColor="#ff0055" shadowColor="#ff0055">
            <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#ff0055' }}>
              THE REGULATORY PRESSURE
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif', color: '#fff' }}>
              As global regulations such as the GHG Protocol, CSRD, and ISO 14064 raise the bar for accuracy and traceability, data centers urgently need a unified, automated, and verifiable way to compile, certify, and prove their carbon compliance.
            </Typography>
          </MangaCard>
        </MangaChapter>

        {/* CHAPTER 2: THE AWAKENING */}
        <MangaChapter
          chapterNumber={2}
          title="THE AWAKENING"
          subtitle="Our solution was designed to close that gap—transforming ESG reporting from a fragmented burden into a streamlined, trustworthy compliance workflow."
          bgColor="#0a0a0a"
          textColor="#ffffff"
        >
          <Grid container spacing={6} alignItems="center" sx={{ mb: 8 }}>
            <Grid item xs={12} md={6}>
              <MangaCard variant="tech" shadowColor="rgba(255,255,255,0.2)" bgColor="transparent" borderColor="transparent">
                <Box sx={{ position: 'relative' }}>
                  <motion.img
                    src={MANGA_HERO}
                    alt="Hero awakening"
                    style={{
                      width: '100%',
                      border: '4px solid #fff',
                      display: 'block',
                    }}
                  />
                </Box>
              </MangaCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <MangaCard variant="cut" bgColor="#fff" borderColor="#fff" shadowColor="#00f0ff">
                <Typography variant="h3" gutterBottom sx={{ color: '#00f0ff', fontFamily: '"Bebas Neue", sans-serif' }}>
                  UNIFIED PLATFORM
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  A unified compliance automation platform that collects and converts data from DCIM, PDFs, and Excel reports into a structured format.
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  Sends automated data requests to suppliers through a shared web portal. Uses AI to validate inputs, detect anomalies, and fill gaps.
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  Compiles a consolidated master emissions report aligned to global frameworks (GHG, CSRD, ISO 14064) and generates a verified compliance certificate, with every action recorded immutably on the Cardano blockchain.
                </Typography>
              </MangaCard>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {[
              { title: 'END-TO-END AUTOMATION', desc: 'Across Scopes 1–3', color: '#00f0ff' },
              { title: 'INTEGRATED VENDOR COLLAB', desc: 'No manual follow-ups', color: '#fcee0a' },
              { title: 'AI-ASSISTED VERIFICATION', desc: 'Ensures accuracy and consistency', color: '#ff0055' },
              { title: 'BLOCKCHAIN TRACEABILITY', desc: 'For audit and trust', color: '#0a0a0a', text: '#fff' },
            ].map((item, i) => (
              <Grid item xs={12} md={6} key={i}>
                <MangaCard
                  variant="tech"
                  delay={0.6 + i * 0.1}
                  bgColor={item.color}
                  borderColor="#0a0a0a"
                  shadowColor="#0a0a0a"
                >
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', color: item.text || '#0a0a0a' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.1rem', color: item.text || '#0a0a0a' }}>
                    {item.desc}
                  </Typography>
                </MangaCard>
              </Grid>
            ))}
          </Grid>
        </MangaChapter>

        {/* CHAPTER 3: THE FEATURES */}
        <MangaChapter
          chapterNumber={3}
          title="THE NINE PILLARS"
          subtitle="Nine powerful features that transform compliance from chaos to clarity."
          bgColor="#f0f0f0"
        >
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              {
                num: '01',
                title: 'UNIFIED DATA INGESTION',
                desc: 'Integrates data from multiple sources — DCIM systems, IoT meters, Excel sheets, and PDF reports — into a single structured database for Scope 1, 2, and 3 emissions.',
                color: '#00f0ff',
              },
              {
                num: '02',
                title: 'AUTOMATED VENDOR COLLABORATION',
                desc: 'Automatically sends secure data entry links to suppliers and vendors, allowing them to upload Scope 3 information through a standardized web interface.',
                color: '#fcee0a',
              },
              {
                num: '03',
                title: 'AI-BASED DATA EXTRACTION',
                desc: 'Uses AI models to extract key emissions data from uploaded files, verify accuracy, flag inconsistencies, and fill missing fields with relevant emission factors.',
                color: '#ff0055',
              },
              {
                num: '04',
                title: 'CENTRALIZED COMPLIANCE ENGINE',
                desc: 'Aggregates all validated data into a master emissions database aligned with international frameworks such as GHG Protocol, CSRD, and ISO 14064.',
                color: '#0a0a0a',
                text: '#fff',
              },
              {
                num: '05',
                title: 'MASTER REPORT GENERATION',
                desc: 'Automatically compiles a unified, audit-ready compliance report that consolidates all Scopes and vendor inputs, complete with insights and visual summaries.',
                color: '#00f0ff',
              },
              {
                num: '06',
                title: 'CERTIFICATE OF EMISSIONS',
                desc: 'Generates a digitally signed Certificate of Emission that reflects verified totals and compliance status for the reporting period.',
                color: '#fcee0a',
              },
              {
                num: '07',
                title: 'BLOCKCHAIN AUDIT TRAIL',
                desc: 'Stores every key event — uploads, validations, approvals, and certificate issuance — on the Cardano blockchain for immutable auditability and regulatory trust.',
                color: '#ff0055',
              },
              {
                num: '08',
                title: 'REAL-TIME MONITORING',
                desc: 'Provides a live overview of emissions trends, data completeness, and compliance readiness with drill-down capability for internal and regulatory audits.',
                color: '#0a0a0a',
                text: '#fff',
              },
              {
                num: '09',
                title: 'MODULAR INTEGRATION',
                desc: 'Built with flexibility to connect to IBM Watsonx, Maximo, and other enterprise systems for analytics, predictive insights, or external compliance submission.',
                color: '#00f0ff',
              },
            ].map((feature, i) => (
              <Grid item xs={12} md={6} key={i}>
                <MangaCard
                  variant="cut"
                  delay={i * 0.1}
                  bgColor={feature.color}
                  borderColor="#0a0a0a"
                  shadowColor="#0a0a0a"
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontFamily: '"Bebas Neue", sans-serif',
                      fontSize: '4rem',
                      opacity: 0.15,
                      position: 'absolute',
                      top: 10,
                      right: 20,
                      color: feature.text || '#0a0a0a',
                    }}
                  >
                    {feature.num}
                  </Typography>
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', position: 'relative', zIndex: 1, color: feature.text || '#0a0a0a' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', position: 'relative', zIndex: 1, fontSize: '1.1rem', color: feature.text || '#0a0a0a' }}>
                    {feature.desc}
                  </Typography>
                </MangaCard>
              </Grid>
            ))}
          </Grid>
        </MangaChapter>

        {/* CHAPTER 4: THE TECHNOLOGY STACK */}
        <MangaChapter
          chapterNumber={4}
          title="THE TECH STACK"
          subtitle="Built on modern, scalable technologies for enterprise-grade compliance automation."
          bgColor="#ffffff"
        >
          <Grid container spacing={4}>
            {[
              {
                category: 'FRONTEND',
                tech: ['React + TypeScript', 'OIDC Login', 'Atala PRISM DID Wallet'],
                color: '#00f0ff',
                icon: '⚛️',
              },
              {
                category: 'BACKEND / AI',
                tech: ['Node.js API Gateway', 'IBM watsonx (LLM/NLP)', 'Python Workers (OCR)', 'Validation Rules Engine'],
                color: '#fcee0a',
                icon: '🤖',
              },
              {
                category: 'DATA & INTEGRATIONS',
                tech: ['PostgreSQL / TimescaleDB', 'IBM Cloud Object Storage / IPFS', 'DCIM/IoT Connectors', 'Kafka/Redis Message Bus'],
                color: '#ff0055',
                icon: '💾',
              },
              {
                category: 'BLOCKCHAIN & IDENTITY',
                tech: ['Cardano Mainnet', 'Aiken/Plutus Smart Contracts', 'Atala PRISM DID', 'Midnight Privacy Sidechain'],
                color: '#0a0a0a',
                text: '#fff',
                icon: '⛓️',
              },
              {
                category: 'DEVOPS & SECURITY',
                tech: ['Docker, GitHub Actions', 'Terraform IaC', 'KMS/HSM Key Custody', 'End-to-End Encryption'],
                color: '#00f0ff',
                icon: '🔒',
              },
            ].map((stack, i) => (
              <Grid item xs={12} md={6} key={i}>
                <MangaCard
                  variant="tech"
                  delay={i * 0.15}
                  bgColor={stack.color}
                  borderColor="#0a0a0a"
                  shadowColor="#0a0a0a"
                >
                  <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', mb: 3, color: stack.text || '#0a0a0a' }}>
                    {stack.icon} {stack.category}
                  </Typography>
                  <Stack spacing={2}>
                    {stack.tech.map((item, idx) => (
                      <Chip
                        key={idx}
                        label={item}
                        sx={{
                          bgcolor: stack.text ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          color: stack.text || '#0a0a0a',
                          border: `2px solid ${stack.text || '#0a0a0a'}`,
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                        }}
                      />
                    ))}
                  </Stack>
                </MangaCard>
              </Grid>
            ))}
          </Grid>
        </MangaChapter>

        {/* CHAPTER 5: CARDANO INTEGRATION */}
        <MangaChapter
          chapterNumber={5}
          title="CARDANO: THE IMMUTABLE FOUNDATION"
          subtitle="Creating an immutable, publicly verifiable compliance trail and emission certificate on Cardano blockchain."
          bgColor="#0a0a0a"
          textColor="#ffffff"
        >
          <Grid container spacing={6} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <MangaCard variant="cut" bgColor="#fff" borderColor="#00f0ff" shadowColor="#00f0ff">
                <Typography variant="h3" gutterBottom sx={{ color: '#00f0ff', fontFamily: '"Bebas Neue", sans-serif' }}>
                  WHAT WE RECORD
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  <strong>Certificate NFT</strong> (non-transferable) for each reporting period/entity:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Period, org_did, scope totals, method/factor versions</Typography></li>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Report SHA256, evidence merkle root</Typography></li>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Midnight proof IDs (links to private ZK proofs)</Typography></li>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>Issuer/verifier DIDs, timestamps</Typography></li>
                </Box>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif', mt: 2 }}>
                  <strong>Workflow events:</strong> Dataset frozen, approvals, vendor attestations
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  <strong>Revocation/Replace:</strong> On detected errors, link old→new with reason hash
                </Typography>
              </MangaCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <MangaCard variant="cut" bgColor="#fff" borderColor="#fcee0a" shadowColor="#fcee0a">
                <Typography variant="h3" gutterBottom sx={{ color: '#0a0a0a', fontFamily: '"Bebas Neue", sans-serif' }}>
                  WHEN WE WRITE
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  <strong>1. After AI validation and human sign-off:</strong> We freeze the quarter's dataset and compute report_sha256, evidence_merkle_root, factor_pack_id
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  <strong>2. Smart Contracts:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>issueCertificate(snapshotHash, reportHash, merkleRoot, meta, midnightRefs)</Typography></li>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>attest(certId, attestorDID, role, statementHash)</Typography></li>
                  <li><Typography variant="body1" sx={{ fontSize: '1.1rem', fontFamily: '"Space Grotesk", sans-serif' }}>revokeAndReplace(certId, newCertId, reasonHash)</Typography></li>
                </Box>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                  <strong>3. Frontend shows a "View on Chain" link</strong> for auditors/clients.
                </Typography>
              </MangaCard>
            </Grid>
          </Grid>

          <MangaCard variant="rect" bgColor="#00f0ff" borderColor="#0a0a0a" shadowColor="#0a0a0a">
            <Typography variant="h3" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', mb: 3, color: '#0a0a0a' }}>
              WHY CARDANO?
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#0a0a0a' }}>
                  LOW-COST & LOW-ENERGY
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.1rem', color: '#0a0a0a' }}>
                  L1 aligns with ESG goals. Sustainable blockchain for sustainable reporting.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#0a0a0a' }}>
                  MATURE UTXO MODEL
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.1rem', color: '#0a0a0a' }}>
                  Deterministic compliance records. Predictable transaction outcomes.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Bebas Neue", sans-serif', color: '#0a0a0a' }}>
                  DID SUPPORT
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.1rem', color: '#0a0a0a' }}>
                  Atala PRISM for device/org identity. Self-sovereign identity for compliance.
                </Typography>
              </Grid>
            </Grid>
          </MangaCard>
        </MangaChapter>

        {/* CHAPTER 6: THE TEAM */}
        <MangaChapter
          chapterNumber={6}
          title="THE NETZERO SQUAD"
          subtitle="Operators, vendors, AI agents, and blockchain—united for zero carbon."
          bgColor="#ffffff"
        >
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                title: 'OPERATOR',
                subtitle: 'DATA COMMAND',
                desc: 'Connects DCIM, meters, and IoT feeds into one live stream. Monitors real-time emissions. Generates automated reports.',
                color: '#00f0ff',
                image: HERO_IMG,
              },
              {
                title: 'VENDOR',
                subtitle: 'SCOPE 3 NINJA',
                desc: 'Drops verified emissions data straight into your pipeline. Zero-knowledge proofs for privacy. Automated submissions.',
                color: '#fcee0a',
                image: AI_IMG,
              },
              {
                title: 'AI SIDEKICK',
                subtitle: 'ANOMALY HUNTER',
                desc: 'Flags leaks, gaps, and outliers before auditors do. Validates data quality. Ensures compliance standards.',
                color: '#ff0055',
                image: BUG_IMG,
              },
              {
                title: 'CARDANO',
                subtitle: 'ON-CHAIN LEDGER',
                desc: 'Freezes your reports in time on-chain for trust that sticks. Immutable proof. Permanent audit trail.',
                color: '#0a0a0a',
                text: '#fff',
                image: HERO_IMG,
              },
            ].map((member, i) => (
              <Grid item xs={12} md={6} key={i}>
                <MangaCard
                  variant="tech"
                  delay={i * 0.15}
                  bgColor={member.color}
                  borderColor="#0a0a0a"
                  shadowColor="#0a0a0a"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        border: '3px solid #0a0a0a',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        bgcolor: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      <motion.img
                        src={member.image}
                        alt={member.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontFamily: '"Bebas Neue", sans-serif', color: member.text || '#0a0a0a' }}>
                        {member.title}
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: '"Bebas Neue", sans-serif', opacity: 0.8, color: member.text || '#0a0a0a' }}>
                        {member.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.1rem', color: member.text || '#0a0a0a' }}>
                    {member.desc}
                  </Typography>
                </MangaCard>
              </Grid>
            ))}
          </Grid>
        </MangaChapter>

        {/* CHAPTER 7: THE FUTURE */}
        <MangaChapter
          chapterNumber={7}
          title="BEGIN YOUR JOURNEY"
          subtitle="Join the automated compliance revolution. Zero carbon. Zero hassle."
          bgColor="#0a0a0a"
          textColor="#ffffff"
        >
          <Box sx={{ textAlign: 'center', py: 8, position: 'relative', zIndex: 10 }}>
            <MangaCard variant="cut" bgColor="#fff" borderColor="#00f0ff" shadowColor="#00f0ff" sx={{ maxWidth: '900px', mx: 'auto' }}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  color: '#0a0a0a',
                  mb: 3,
                }}
              >
                READY TO DEPLOY?
              </Typography>
              <Typography
                variant="h5"
                paragraph
                sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: '#0a0a0a',
                  mb: 4,
                }}
              >
                Transform your ESG compliance from a manual nightmare into an automated pipeline. Join operators and vendors already using NetZero Agents.
              </Typography>
              <Button
                component={Link}
                to="/login"
                size="large"
                sx={{
                  fontSize: '2.5rem',
                  px: 8,
                  py: 2,
                  bgcolor: '#00f0ff',
                  color: '#0a0a0a',
                  border: '4px solid #0a0a0a',
                  boxShadow: '10px 10px 0px #0a0a0a',
                  borderRadius: 0,
                  fontFamily: '"Bebas Neue", sans-serif',
                  letterSpacing: '2px',
                  position: 'relative',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#ff0055',
                    color: '#fff',
                    boxShadow: '15px 15px 0px #0a0a0a',
                  },
                }}
              >
                START THE ENGINE
              </Button>
            </MangaCard>
          </Box>
        </MangaChapter>
      </Box>
    </Box>
  );
};

export default LandingPage;
