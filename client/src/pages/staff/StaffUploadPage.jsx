import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import UploadForm from '../../components/UploadForm';
import { ASSETS } from '../../assets';

const StaffUploadPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const blastVariant = {
        hidden: { scale: 0, opacity: 0, rotate: -10 },
        visible: {
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
            }
        }
    };

    const shakeVariant = {
        hover: {
            x: [0, -5, 5, -5, 5, 0],
            transition: { duration: 0.4 }
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: { xs: 2, md: 4 },
                background: '#fff',
                backgroundImage: `
                  radial-gradient(circle at 100% 50%, transparent 20%, #f5f5f5 21%, #f5f5f5 34%, transparent 35%, transparent),
                  radial-gradient(circle at 0% 50%, transparent 20%, #f5f5f5 21%, #f5f5f5 34%, transparent 35%, transparent)
                `,
                backgroundSize: '40px 40px',
                animation: 'moveHorizontal 15s linear infinite',
                backgroundPosition: '0 0, 0 20px',
                overflow: 'hidden'
            }}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Blast */}
                <motion.div variants={blastVariant}>
                    <Box
                        sx={{
                            mb: 6,
                            p: 4,
                            bgcolor: '#ff0055',
                            border: '4px solid #000',
                            boxShadow: '15px 15px 0px #000',
                            transform: 'skew(-2deg)',
                            position: 'relative'
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontFamily: '"Bangers", cursive',
                                color: '#fff',
                                textShadow: '4px 4px 0 #000',
                                textTransform: 'uppercase',
                                textAlign: 'center'
                            }}
                        >
                            UPLOAD ZONE
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: '"Permanent Marker", cursive',
                                color: '#fff',
                                textAlign: 'center',
                                mt: 1
                            }}
                        >
                            Drop the data! Boom! 💥
                        </Typography>
                    </Box>
                </motion.div>

                <Grid container spacing={4}>
                    {/* Scope 1 Blast */}
                    <Grid item xs={12} md={6}>
                        <motion.div variants={blastVariant} whileHover="hover">
                            <motion.div variants={shakeVariant}>
                                <Card
                                    sx={{
                                        border: '4px solid #000',
                                        boxShadow: '10px 10px 0px #00f0ff',
                                        bgcolor: '#fff',
                                        overflow: 'visible'
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ position: 'absolute', top: -20, right: -20, bgcolor: '#00f0ff', border: '3px solid #000', px: 2, py: 0.5, transform: 'rotate(5deg)' }}>
                                            <Typography sx={{ fontFamily: '"Bangers", cursive', fontSize: '1.5rem' }}>SCOPE 1</Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontFamily: '"Bangers", cursive', mb: 2, color: '#000' }}>
                                            COMBUSTION
                                        </Typography>
                                        <UploadForm allowedScopes={[1]} defaultScope={1} onUploaded={() => { }} />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </Grid>

                    {/* Scope 2 Blast */}
                    <Grid item xs={12} md={6}>
                        <motion.div variants={blastVariant} whileHover="hover">
                            <motion.div variants={shakeVariant}>
                                <Card
                                    sx={{
                                        border: '4px solid #000',
                                        boxShadow: '10px 10px 0px #fcee0a',
                                        bgcolor: '#fff',
                                        overflow: 'visible'
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ position: 'absolute', top: -20, right: -20, bgcolor: '#fcee0a', border: '3px solid #000', px: 2, py: 0.5, transform: 'rotate(-5deg)' }}>
                                            <Typography sx={{ fontFamily: '"Bangers", cursive', fontSize: '1.5rem' }}>SCOPE 2</Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontFamily: '"Bangers", cursive', mb: 2, color: '#000' }}>
                                            ELECTRICITY
                                        </Typography>
                                        <UploadForm allowedScopes={[2]} defaultScope={2} onUploaded={() => { }} />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default StaffUploadPage;
