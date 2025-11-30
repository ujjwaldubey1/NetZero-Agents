import React, { useState, useMemo, useRef } from 'react';
import { Box, Typography, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Grid, Card, CardContent, Button } from '@mui/material';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Lock, CloudUpload, Shield, Verified, ExpandMore, ExpandLess, ContentCopy, OpenInNew, AccountBalanceWallet, Token } from '@mui/icons-material';
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

const getDatacenter = (event) => {
  // 1. Prefer explicit datacenter field
  if (event.datacenter) return event.datacenter;
  
  // 2. Fallback to parsing detail string
  const match = event.detail?.match(/DC-(\w+)/);
  if (match) return `DC-${match[1]}`;
  
  // 3. Fallback to parsing "DC-Name" from detail if format is different
  if (event.detail && event.detail.includes('DC-')) {
     const parts = event.detail.split(' ');
     const dcPart = parts.find(p => p.startsWith('DC-'));
     if (dcPart) return dcPart.replace(/[^a-zA-Z0-9-]/g, '');
  }

  return 'DC-Unknown';
};

const extractEmissions = (detail) => {
  if (!detail) return 0;
  const match = detail.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*tons/i);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
};

const extractTxId = (event) => {
  if (event.cardanoTxHash) return { type: 'Cardano', id: event.cardanoTxHash };
  if (event.hydraTxId) return { type: 'Hydra', id: event.hydraTxId };
  if (event.reportHash) return { type: 'IPFS', id: event.reportHash };
  if (event.proofHash) return { type: 'ZK Proof', id: event.proofHash };
  return null;
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
  const emissions = extractEmissions(event.detail);
  const tx = extractTxId(event);
  
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
        marginBottom: '140px', // Increased spacing for larger blocks
        marginLeft: position.x,
        width: 'fit-content',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ 
          scale: isHovered ? 1.3 : 1,
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
            width: isHovered ? '320px' : '180px', // Larger blocks
            height: isHovered ? '320px' : '180px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotate(${position.rotate}deg)`,
            transition: 'width 0.3s, height 0.3s',
          }}
        >
          {/* Front Face - NOW SHOWING DATA ALWAYS */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bgcolor: '#ffffff',
              border: '4px solid #0a0a0a',
              boxShadow: `8px 8px 0px ${assignedColor}`,
              transform: 'translateZ(90px)', // Adjusted for larger size
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              transition: 'all 0.3s',
            }}
          >
            {getEventIcon(event.type)}
            
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: '"Bangers", sans-serif',
                mt: 1,
                textAlign: 'center',
                fontSize: isHovered ? '1.2rem' : '0.9rem',
                letterSpacing: 1,
                lineHeight: 1.1,
              }}
            >
              {event.type.split('_')[0]}
            </Typography>

            {/* Always show CO2 if available */}
            {emissions > 0 && (
              <Chip 
                label={`${emissions}t CO2e`} 
                size="small" 
                sx={{ 
                  mt: 1, 
                  height: 24, 
                  fontSize: '0.75rem', 
                  bgcolor: '#fcee0a', 
                  fontWeight: 'bold',
                  border: '1px solid #000'
                }} 
              />
            )}

            {/* Always show TX ID if available (shortened) */}
            {tx && !isHovered && (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  mt: 1,
                  bgcolor: '#f0f0f0',
                  px: 0.5,
                  borderRadius: 1,
                  border: '1px dashed #ccc'
                }}
              >
                TX: {tx.id.substring(0, 6)}...
              </Typography>
            )}

            {/* Expanded details on hover */}
            {isHovered && (
              <Box sx={{ mt: 1, textAlign: 'center', width: '100%' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: '0.75rem',
                    display: 'block',
                    maxHeight: '80px',
                    overflow: 'auto',
                    lineHeight: 1.3,
                    mb: 1
                  }}
                >
                  {event.detail}
                </Typography>
                {tx && (
                  <Chip 
                    icon={<ContentCopy sx={{ fontSize: '12px !important' }} />}
                    label={`${tx.type}: ${tx.id.substring(0, 8)}...`}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(tx.id);
                    }}
                    sx={{ 
                      bgcolor: '#e0e0e0', 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#d0d0d0' }
                    }} 
                  />
                )}
              </Box>
            )}
            
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                mt: 'auto',
                opacity: 0.7,
              }}
            >
              {new Date(event.timestamp).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Back Face */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: assignedColor, border: '4px solid #0a0a0a', transform: 'translateZ(-90px) rotateY(180deg)' }} />
          {/* Top Face */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: '#ffffff', border: '4px solid #0a0a0a', transform: 'rotateX(90deg) translateZ(90px)', opacity: 0.9 }} />
          {/* Bottom Face */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: '#f0f0f0', border: '4px solid #0a0a0a', transform: 'rotateX(-90deg) translateZ(90px)', opacity: 0.8 }} />
          {/* Left Face */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: '#f5f5f5', border: '4px solid #0a0a0a', transform: 'rotateY(-90deg) translateZ(90px)', opacity: 0.9 }} />
          {/* Right Face */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: '#f5f5f5', border: '4px solid #0a0a0a', transform: 'rotateY(90deg) translateZ(90px)', opacity: 0.9 }} />
        </Box>
      </motion.div>
    </motion.div>
  );
};

const WalletPanel = ({ events, datacenter }) => {
  // Calculate credits based on a hypothetical threshold (e.g., 1000t per quarter)
  // In a real app, this would come from the backend's carbonCreditsAgent
  const totalEmissions = events.reduce((sum, event) => sum + extractEmissions(event.detail), 0);
  const threshold = 1500; // Example threshold
  const creditBalance = threshold - totalEmissions;
  const isSurplus = creditBalance >= 0;

  return (
    <Card sx={{ mb: 4, border: '4px solid #0a0a0a', boxShadow: '8px 8px 0px #00f0ff', bgcolor: '#fff' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" sx={{ fontFamily: '"Bangers", sans-serif', letterSpacing: 1 }}>
              CARBON CREDIT WALLET
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', opacity: 0.7 }}>
              {datacenter} • Q4 2025
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={4} alignItems="center">
            <Box textAlign="center">
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>THRESHOLD</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{threshold}t</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>USED</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: isSurplus ? 'success.main' : 'error.main' }}>
                {totalEmissions.toLocaleString()}t
              </Typography>
            </Box>
            <Box 
              sx={{ 
                bgcolor: isSurplus ? '#e8f5e9' : '#ffebee', 
                p: 2, 
                borderRadius: 2, 
                border: '2px solid',
                borderColor: isSurplus ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Token sx={{ fontSize: 40, color: isSurplus ? 'success.main' : 'error.main' }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: isSurplus ? 'success.dark' : 'error.dark' }}>
                  {isSurplus ? 'AVAILABLE CREDITS' : 'CREDIT DEFICIT'}
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: '"Bangers", sans-serif', color: isSurplus ? 'success.main' : 'error.main' }}>
                  {Math.abs(creditBalance).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const LedgerTable = ({ events }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 4, bgcolor: '#ffffff', border: '2px solid #0a0a0a', boxShadow: '4px 4px 0px #0a0a0a' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f0f0f0' }}>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>EVENT TYPE</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>TIMESTAMP</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>EMISSIONS</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>TX REF</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Space Grotesk"' }}>DETAILS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => {
            const emissions = extractEmissions(event.detail);
            const tx = extractTxId(event);
            return (
              <TableRow key={event._id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {getEventIcon(event.type)}
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {event.type.replace(/_/g, ' ')}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>
                  {new Date(event.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  {emissions > 0 ? (
                    <Chip label={`${emissions}t`} size="small" sx={{ bgcolor: '#fcee0a', fontWeight: 'bold' }} />
                  ) : (
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {tx ? (
                    <Tooltip title={`Copy ${tx.type} ID`}>
                      <Chip 
                        icon={<ContentCopy sx={{ fontSize: '14px !important' }} />}
                        label={`${tx.type}: ${tx.id.substring(0, 8)}...`} 
                        size="small" 
                        onClick={() => navigator.clipboard.writeText(tx.id)}
                        sx={{ 
                          bgcolor: '#e0e0e0', 
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#d0d0d0' }
                        }} 
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>Pending</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.detail}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DatacenterBlock = ({ datacenter, allEvents, isExpanded, isOtherExpanded, onToggle }) => {
  const INITIAL_BLOCK_COUNT = 20;
  const [visibleBlockCount, setVisibleBlockCount] = useState(INITIAL_BLOCK_COUNT);
  
  // Sort and slice events to show only visible ones
  const sortedEvents = useMemo(() => {
    return [...allEvents].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeB - timeA; // Most recent first
    });
  }, [allEvents]);
  
  const events = sortedEvents.slice(0, visibleBlockCount);
  const hasMoreBlocks = sortedEvents.length > visibleBlockCount;
  const totalEventCount = sortedEvents.length;
  
  const [mousePosition, setMousePosition] = useState(null);
  const [positions, setPositions] = useState({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef(null);
  
  const handleLoadMore = () => {
    setVisibleBlockCount(prev => prev + 20);
  };

  const totalEmissions = useMemo(() => {
    return sortedEvents.reduce((sum, event) => sum + extractEmissions(event.detail), 0);
  }, [sortedEvents]);

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
              <Stack direction="row" spacing={2} mt={0.5}>
                <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, opacity: 0.7 }}>
                  {totalEventCount} blockchain event{totalEventCount !== 1 ? 's' : ''} ({events.length} shown)
                </Typography>
                {totalEmissions > 0 && (
                  <Chip 
                    label={`Total: ${totalEmissions.toLocaleString()}t CO2e`} 
                    size="small" 
                    sx={{ bgcolor: '#00f0ff', fontWeight: 'bold', border: '1px solid #000' }} 
                  />
                )}
              </Stack>
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
              <ParallaxBackground containerRef={containerRef} eventCount={events.length} />

              {/* Wallet Panel */}
              <Box sx={{ position: 'relative', zIndex: 2, mb: 4 }}>
                <WalletPanel events={events} datacenter={datacenter} />
              </Box>

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
              
              {/* Show More Button */}
              {hasMoreBlocks && (
                <Box sx={{ position: 'relative', zIndex: 1, mt: 4, textAlign: 'center' }}>
                  <Button
                    onClick={handleLoadMore}
                    variant="contained"
                    sx={{
                      bgcolor: '#00f0ff',
                      color: '#0a0a0a',
                      border: '3px solid #0a0a0a',
                      boxShadow: '8px 8px 0px #0a0a0a',
                      borderRadius: 0,
                      px: 4,
                      py: 1.5,
                      fontFamily: '"Bangers", sans-serif',
                      fontSize: '1.2rem',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: '#ff0055',
                        color: '#fff',
                        boxShadow: '10px 10px 0px #0a0a0a',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Show More ({sortedEvents.length - visibleBlockCount} remaining)
                  </Button>
                </Box>
              )}

            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

const BlockchainVisualization = ({ events, datacenters = [] }) => {
  const [expandedDatacenter, setExpandedDatacenter] = useState(null);

  // Group events by datacenter (don't limit here - let DatacenterBlock handle it)
  const datacenterGroups = useMemo(() => {
    const groups = {};
    
    // Initialize with fetched datacenters
    datacenters.forEach(dc => {
      groups[dc.name] = [];
    });

    // Add events to groups
    if (events) {
      events.forEach(event => {
        // Pass the whole event object now
        let dcName = getDatacenter(event);
        
        // If still unknown, try to match against known datacenters
        if (dcName === 'DC-Unknown') {
           const knownDc = datacenters.find(d => event.detail?.includes(d.name));
           if (knownDc) dcName = knownDc.name;
        }

        if (!groups[dcName]) {
          // If the datacenter group doesn't exist (and wasn't in fetched datacenters), create it
          groups[dcName] = [];
        }
        groups[dcName].push(event);
      });
    }
    
    // Sort events by timestamp (most recent first) but don't limit here
    Object.keys(groups).forEach(dcName => {
      groups[dcName] = groups[dcName].sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
        const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
        return timeB - timeA; // Most recent first
      });
    });
    
    return groups;
  }, [events, datacenters]);

  const toggleDatacenter = (dc) => {
    setExpandedDatacenter(expandedDatacenter === dc ? null : dc);
  };

  if ((!events || events.length === 0) && datacenters.length === 0) {
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
          allEvents={dcEvents}
          isExpanded={expandedDatacenter === datacenter}
          isOtherExpanded={expandedDatacenter !== null}
          onToggle={() => toggleDatacenter(datacenter)}
        />
      ))}
    </Box>
  );
};

export default BlockchainVisualization;
