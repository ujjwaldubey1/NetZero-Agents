import React, { useState, useMemo, useRef } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Lock, CloudUpload, Shield, Verified, ExpandMore, ExpandLess } from '@mui/icons-material';
import { colors } from '../utils/color';

const getEventIcon = (type) => {
  switch (type) {
    case 'CERTIFICATE_ISSUED':
      return <Verified sx={{ fontSize: 28, color: '#00f0ff' }} />;
    case 'REPORT_FROZEN':
      return <Lock sx={{ fontSize: 28, color: '#ff0055' }} />;
    case 'EMISSIONS_UPLOADED':
      return <CloudUpload sx={{ fontSize: 28, color: '#fcee0a' }} />;
    case 'ZK_PROOF_VERIFIED':
      return <Shield sx={{ fontSize: 28, color: '#00f0ff' }} />;
    default:
      return null;
  }
};

const getDatacenter = (detail) => {
  const match = detail?.match(/DC-(\w+)/);
  return match ? `DC-${match[1]}` : 'DC-Unknown';
};

const getZigzagPosition = (index) => {
  const positions = [
    { x: '20%', rotate: -5 },
    { x: '70%', rotate: 5 },
    { x: '15%', rotate: -3 },
    { x: '75%', rotate: 4 },
    { x: '25%', rotate: -4 },
    { x: '65%', rotate: 3 },
  ];
  return positions[index % positions.length];
};

const ParallaxBackground = ({ containerRef, eventCount }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  
  // Calculate how many repetitions we need based on event count
  // Use a larger divisor since we want fewer, larger images covering the background
  const repetitions = Math.max(Math.ceil((eventCount * 120) / 1000), 2);
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: -200,
        left: 0,
        right: 0,
        y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: 0.1, // Very low opacity to not block content
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: repetitions }).map((_, i) => (
        <React.Fragment key={i}>
          <Box
            component="img"
            src="/assets/manga_bg_1.png"
            sx={{
              width: '100%',
              maxWidth: '1200px', // Limit max width but allow full coverage on smaller screens
              height: 'auto',
              mb: 0,
              filter: 'grayscale(100%)',
              transform: i % 2 === 0 ? 'scaleX(1)' : 'scaleX(-1)',
              objectFit: 'cover',
            }}
          />
          <Box
            component="img"
            src="/assets/manga_bg_2.png"
            sx={{
              width: '100%',
              maxWidth: '1200px',
              height: 'auto',
              mb: 0,
              filter: 'grayscale(100%)',
              transform: i % 2 === 0 ? 'scaleX(1)' : 'scaleX(-1)',
              objectFit: 'cover',
            }}
          />
        </React.Fragment>
      ))}
    </motion.div>
  );
};

const CubeBlock = ({ event, index, mousePosition, onPositionChange, containerRef, assignedColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cubeRef, setCubeRef] = useState(null);
  const position = getZigzagPosition(index);
  
  const updatePosition = React.useCallback(() => {
    if (!cubeRef || !containerRef?.current) return;
    const cubeRect = cubeRef.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    onPositionChange?.(event._id, {
      x: cubeRect.left + cubeRect.width / 2 - containerRect.left,
      y: cubeRect.top + cubeRect.height / 2 - containerRect.top,
    });
  }, [cubeRef, containerRef, event._id, onPositionChange]);

  React.useEffect(() => {
    updatePosition();
  }, [updatePosition, isHovered, mousePosition]);
  
  const getMouseRotation = () => {
    if (!cubeRef || !mousePosition) return { rotateX: -15, rotateY: 15 };
    
    const rect = cubeRef.getBoundingClientRect();
    const cubeCenterX = rect.left + rect.width / 2;
    const cubeCenterY = rect.top + rect.height / 2;
    
    const deltaX = (mousePosition.x - cubeCenterX) / 50;
    const deltaY = (mousePosition.y - cubeCenterY) / 50;
    
    return {
      rotateX: -15 + deltaY,
      rotateY: 15 + deltaX,
    };
  };

  const getMouseOffset = () => {
    if (!cubeRef || !mousePosition) return { x: 0, y: 0 };
    const rect = cubeRef.getBoundingClientRect();
    const cubeCenterX = rect.left + rect.width / 2;
    const cubeCenterY = rect.top + rect.height / 2;
    const deltaX = (mousePosition.x - cubeCenterX) / 10;
    const deltaY = (mousePosition.y - cubeCenterY) / 10;
    return { x: Math.max(Math.min(deltaX, 20), -20), y: Math.max(Math.min(deltaY, 20), -20) };
  };
  
  const rotation = getMouseRotation();
  const hoverOffset = getMouseOffset();
  
  return (
    <motion.div
      ref={setCubeRef}
      initial={{ opacity: 0, scale: 0, y: -100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.15,
        duration: 0.6,
        type: "spring",
        stiffness: 120
      }}
      style={{
        position: 'relative',
        marginBottom: '120px',
        marginLeft: position.x,
        width: 'fit-content',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ 
          scale: isHovered ? 1.5 : 1,
          z: isHovered ? 100 : 0,
          rotateY: isHovered ? 0 : rotation.rotateY,
          rotateX: isHovered ? 0 : rotation.rotateX,
          x: isHovered ? hoverOffset.x : 0,
          y: isHovered ? hoverOffset.y : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
          zIndex: isHovered ? 10 : 1,
        }}
      >
        <Box
          sx={{
            width: isHovered ? '300px' : '150px',
            height: isHovered ? '300px' : '150px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotate(${position.rotate}deg)`,
            transition: 'width 0.3s, height 0.3s',
          }}
        >
          {/* Front Face */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: '#ffffff',
              border: '4px solid #0a0a0a',
              boxShadow: `8px 8px 0px ${assignedColor}`,
              transform: 'translateZ(75px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              transition: 'all 0.3s',
            }}
          >
            {getEventIcon(event.type)}
            
            {!isHovered ? (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: '"Bangers", sans-serif',
                  mt: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                }}
              >
                {event.type.split('_')[0]}
              </Typography>
            ) : (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
               <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: '"Bangers", sans-serif',
                    fontSize: '1rem',
                    display: 'block',
                    letterSpacing: 1,
                  }}
                >
                  {event.type.replace(/_/g, ' ')}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: '0.7rem',
                    display: 'block',
                    mt: 1,
                    maxHeight: '100px',
                    overflow: 'auto',
                    lineHeight: 1.3,
                  }}
                >
                  {event.detail}
                </Typography>
                {event.cardanoTxHash && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.6rem',
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                    }}
                  >
                    TX: {event.cardanoTxHash.substring(0, 12)}...
                  </Typography>
                )}
              </Box>
            )}
            
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'monospace',
                fontSize: isHovered ? '0.7rem' : '0.6rem',
                mt: isHovered ? 1 : 0.5,
                opacity: 0.7,
                position: isHovered ? 'relative' : 'absolute',
                bottom: isHovered ? 'auto' : '8px',
              }}
            >
              {new Date(event.timestamp).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Back Face */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: assignedColor,
              border: '4px solid #0a0a0a',
              transform: 'translateZ(-75px) rotateY(180deg)',
            }}
          />
          {/* Top Face */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: '#ffffff',
              border: '4px solid #0a0a0a',
              transform: 'rotateX(90deg) translateZ(75px)',
              opacity: 0.9,
            }}
          />
          {/* Bottom Face */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: '#f0f0f0',
              border: '4px solid #0a0a0a',
              transform: 'rotateX(-90deg) translateZ(75px)',
              opacity: 0.8,
            }}
          />
          {/* Left Face */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: '#f5f5f5',
              border: '4px solid #0a0a0a',
              transform: 'rotateY(-90deg) translateZ(75px)',
              opacity: 0.9,
            }}
          />
          {/* Right Face */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: '#f5f5f5',
              border: '4px solid #0a0a0a',
              transform: 'rotateY(90deg) translateZ(75px)',
              opacity: 0.9,
            }}
          />
        </Box>
      </motion.div>
    </motion.div>
  );
};

const DatacenterBlock = ({ datacenter, events, isExpanded, isOtherExpanded, onToggle }) => {
  const eventCount = events.length;
  const [mousePosition, setMousePosition] = useState(null);
  const [positions, setPositions] = useState({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef(null);

  // Assign colors ensuring no two linked blocks have the same color
  const eventColors = useMemo(() => {
    const colorMap = {};
    let lastColorIndex = -1;
    
    events.forEach(event => {
      let newColorIndex;
      do {
        newColorIndex = Math.floor(Math.random() * colors.length);
      } while (newColorIndex === lastColorIndex && colors.length > 1);
      
      colorMap[event._id] = colors[newColorIndex];
      lastColorIndex = newColorIndex;
    });
    return colorMap;
  }, [events]);

  const handlePositionChange = (id, pos) => {
    setPositions((prev) => ({ ...prev, [id]: pos }));
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (isOtherExpanded && !isExpanded) {
    return null;
  }
  
  return (
    <Box sx={{ mb: 4 }}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} layout>
        <Box
          onClick={onToggle}
          sx={{
            bgcolor: '#ffffff',
            border: '4px solid #0a0a0a',
            boxShadow: isExpanded ? '10px 10px 0px #00f0ff' : '8px 8px 0px #fcee0a',
            p: 3,
            cursor: 'pointer',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-1deg)',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'rotate(0deg)',
              boxShadow: '12px 12px 0px #ff0055',
            },
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 2, color: '#0a0a0a', textShadow: '2px 2px 0px #fcee0a' }}>
                {datacenter}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, opacity: 0.7, mt: 0.5 }}>
                {eventCount} blockchain event{eventCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Chip
              label={isExpanded ? 'COLLAPSE' : 'EXPAND'}
              icon={isExpanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ bgcolor: isExpanded ? '#00f0ff' : '#fcee0a', color: '#0a0a0a', fontWeight: 'bold', border: '2px solid #0a0a0a', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.9rem', px: 1 }}
            />
          </Stack>
        </Box>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ overflow: 'visible' }}
          >
            <Box
              sx={{
                mt: 6,
                pt: 4,
                position: 'relative',
                bgcolor: '#1a1a1a', // Darker background for contrast
                borderRadius: 3,
                p: { xs: 2, md: 4 },
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 3px #0a0a0a',
              }}
            >
              {/* Parallax Background */}
              <ParallaxBackground containerRef={containerRef} eventCount={eventCount} />

              {/* Animated Background Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  backgroundImage: `
                    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                  zIndex: 0,
                }}
              />
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                  zIndex: 0,
                }}
              />

              <Typography variant="h5" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 2, textAlign: 'center', mb: 6, color: '#ffffff', textShadow: '2px 2px 0px #00f0ff', position: 'relative', zIndex: 1 }}>
                🎮 BLOCKCHAIN MAZE 🎮
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', textAlign: 'center', mb: 4, color: '#cccccc', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                Hover over any cube to zoom and reveal details!
              </Typography>
              
              <Box 
                sx={{ 
                  perspective: '2000px', 
                  minHeight: '600px', 
                  position: 'relative',
                  zIndex: 1,
                }}
                ref={containerRef}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setMousePosition(null)}
              >
                {containerSize.width > 0 && containerSize.height > 0 && (
                  <svg
                    width={containerSize.width}
                    height={containerSize.height}
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  >
                    <defs>
                      {events.map((event, idx) => {
                        const next = events[idx + 1];
                        if (!next) return null;
                        const id = `grad-${event._id}-${next._id}`;
                        const color1 = eventColors[event._id];
                        const color2 = eventColors[next._id];
                        return (
                          <linearGradient key={id} id={id} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color1} />
                            <stop offset="100%" stopColor={color2} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    {events.map((event, idx) => {
                      const next = events[idx + 1];
                      if (!next) return null;
                      const from = positions[event._id];
                      const to = positions[next._id];
                      if (!from || !to) return null;
                      
                      return (
                        <line
                          key={`${event._id}-${next._id}`}
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke={`url(#grad-${event._id}-${next._id})`}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray="8 8"
                          opacity="0.8"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="-200"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </line>
                      );
                    })}
                  </svg>
                )}
                {events.map((event, index) => (
                  <CubeBlock
                    key={event._id}
                    event={event}
                    index={index}
                    mousePosition={mousePosition}
                    onPositionChange={handlePositionChange}
                    containerRef={containerRef}
                    assignedColor={eventColors[event._id]}
                  />
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

const BlockchainVisualization = ({ events }) => {
  const [expandedDatacenter, setExpandedDatacenter] = useState(null);

  const datacenterGroups = events.reduce((acc, event) => {
    const dc = getDatacenter(event.detail);
    if (!acc[dc]) acc[dc] = [];
    acc[dc].push(event);
    return acc;
  }, {});

  const toggleDatacenter = (dc) => {
    setExpandedDatacenter(expandedDatacenter === dc ? null : dc);
  };

  if (!events || events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" fontFamily='"Bangers", sans-serif' color="#0a0a0a">NO BLOCKS YET</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>Blockchain events will appear here as they occur</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {Object.entries(datacenterGroups).map(([datacenter, dcEvents]) => (
        <DatacenterBlock
          key={datacenter}
          datacenter={datacenter}
          events={dcEvents}
          isExpanded={expandedDatacenter === datacenter}
          isOtherExpanded={expandedDatacenter !== null}
          onToggle={() => toggleDatacenter(datacenter)}
        />
      ))}
    </Box>
  );
};

export default BlockchainVisualization;
