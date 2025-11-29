import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const BootLoader = ({ onComplete }) => {
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);

    const bootSequence = [
        "INITIALIZING NETZERO KERNEL...",
        "LOADING NEURAL MODULES...",
        "CONNECTING TO BLOCKCHAIN...",
        "VERIFYING ZK-PROOFS...",
        "ESTABLISHING SECURE UPLINK...",
        "SYSTEM READY."
    ];

    useEffect(() => {
        let currentLog = 0;

        // Log sequence
        const logInterval = setInterval(() => {
            if (currentLog < bootSequence.length) {
                setLogs(prev => [...prev, bootSequence[currentLog]]);
                currentLog++;
            } else {
                clearInterval(logInterval);
            }
        }, 400);

        // Progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(onComplete, 500); // Wait a bit after 100% before finishing
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        return () => {
            clearInterval(logInterval);
            clearInterval(progressInterval);
        };
    }, [onComplete]);

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: '#000',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"Space Mono", monospace',
                color: '#00f0ff'
            }}
        >
            <Box sx={{ width: '300px', mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 1, color: '#ff0055', fontWeight: 'bold', letterSpacing: 2 }}>
                    SYSTEM BOOT
                </Typography>

                {/* Progress Bar */}
                <Box sx={{ width: '100%', height: '4px', bgcolor: '#1a1a1a', mb: 2 }}>
                    <motion.div
                        style={{ height: '100%', background: '#00f0ff' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </Box>

                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {progress}%
                </Typography>
            </Box>

            {/* Terminal Logs */}
            <Box sx={{ height: '150px', width: '300px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <AnimatePresence>
                    {logs.map((log, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Typography variant="caption" sx={{ display: 'block', color: index === logs.length - 1 ? '#fff' : 'rgba(0, 240, 255, 0.7)' }}>
                                {`> ${log}`}
                            </Typography>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </Box>
        </Box>
    );
};

export default BootLoader;
