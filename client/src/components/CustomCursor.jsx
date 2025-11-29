import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const canvasRef = React.useRef(null);
    const particles = React.useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const createParticle = (x, y) => {
            const colors = ['#00f0ff', '#ff0055', '#ffffff', '#fcee0a'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.current.push({
                x,
                y,
                size: Math.random() * 4 + 1, // Slightly larger particles
                speedX: Math.random() * 1 - 0.5, // Slower spread
                speedY: Math.random() * 1 - 0.5,
                color,
                life: 1,
                decay: Math.random() * 0.01 + 0.002 // Much slower decay for longer tail
            });
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.current.forEach((p, index) => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.life -= p.decay;
                p.size -= 0.02; // Slower shrink

                if (p.life <= 0 || p.size <= 0) {
                    particles.current.splice(index, 1);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            });

            animationFrameId = requestAnimationFrame(animateParticles);
        };

        animateParticles();

        const handleMouseMoveParticles = (e) => {
            // Spawn more particles for a denser tail
            for (let i = 0; i < 5; i++) {
                createParticle(e.clientX, e.clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMoveParticles);

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMoveParticles);
            cancelAnimationFrame(animationFrameId);
            document.body.style.cursor = 'auto';
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999, // On top
            }}
        />
    );
};

export default CustomCursor;
