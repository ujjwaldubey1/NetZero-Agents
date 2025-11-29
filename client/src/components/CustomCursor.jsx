import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a') || e.target.style.cursor === 'pointer') {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Main Cursor Dot */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    width: 8,
                    height: 8,
                    backgroundColor: '#00f0ff',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    mixBlendMode: 'difference'
                }}
            />

            {/* Outer Ring / Reticle */}
            <motion.div
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isHovering ? 1.5 : 1,
                    opacity: 1,
                    borderColor: isHovering ? '#ff0055' : '#00f0ff',
                    rotate: isHovering ? 45 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 28,
                    mass: 0.5
                }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 40,
                    height: 40,
                    border: '2px solid #00f0ff',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    boxSizing: 'border-box'
                }}
            >
                {/* Crosshairs for extra sci-fi feel */}
                <div style={{ position: 'absolute', top: '50%', left: -5, width: 10, height: 2, background: isHovering ? '#ff0055' : '#00f0ff', transform: 'translateY(-50%)' }} />
                <div style={{ position: 'absolute', top: '50%', right: -5, width: 10, height: 2, background: isHovering ? '#ff0055' : '#00f0ff', transform: 'translateY(-50%)' }} />
                <div style={{ position: 'absolute', left: '50%', top: -5, width: 2, height: 10, background: isHovering ? '#ff0055' : '#00f0ff', transform: 'translateX(-50%)' }} />
                <div style={{ position: 'absolute', left: '50%', bottom: -5, width: 2, height: 10, background: isHovering ? '#ff0055' : '#00f0ff', transform: 'translateX(-50%)' }} />
            </motion.div>
        </>
    );
};

export default CustomCursor;
