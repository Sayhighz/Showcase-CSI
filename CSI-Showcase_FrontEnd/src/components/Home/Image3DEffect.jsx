import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const Image3DEffect = ({ 
  children, 
  className, 
  style, 
  depth = 20, 
  glareEnabled = true,
  glareSize = 0.6,
  glareOpacity = 0.25,
  rotationDamping = 30,
  rotationStiffness = 300,
  scale = 1.05,
  reset = true,
  shadow = true,
  // สีธีมเพิ่มเติม
  themeColor = '#90278E',
  borderRadius = '1rem'
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Add a listener for device orientation on mobile
  useEffect(() => {
    const handleDeviceOrientation = (e) => {
      if (!containerRef.current || !isHovering) return;
      if (e.beta === null || e.gamma === null) return;
      
      // e.beta is front-to-back tilt in degrees, in the range [-180,180]
      // e.gamma is left-to-right tilt in degrees, in the range [-90,90]
      const tiltLR = Math.max(Math.min(e.gamma, 90), -90);
      const tiltFB = Math.max(Math.min(e.beta, 90), -90);
      
      // Convert to rotation values similar to mouse movement
      const rotateYAmount = (tiltLR / 90) * depth;
      const rotateXAmount = (tiltFB / 90) * -depth;
      
      setRotateX(rotateXAmount);
      setRotateY(rotateYAmount);
      
      // Update glare position based on orientation
      if (glareEnabled) {
        const x = ((tiltLR + 90) / 180) * 100;
        const y = ((tiltFB + 90) / 180) * 100;
        setGlarePosition({ x, y });
      }
    };
    
    // Check if device orientation is supported
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [depth, glareEnabled, isHovering]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    // Get container dimensions and position
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the container
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center as a percentage of half the width/height
    // This creates a more natural rotation effect that maps the full rotation range
    // to the edges of the container
    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);
    
    // GitHub-style smoother rotations with easing
    const rotateYAmount = Math.sin(distanceX * 0.4 * Math.PI) * depth;
    const rotateXAmount = Math.sin(distanceY * 0.4 * Math.PI) * -depth;
    
    setRotateX(rotateXAmount);
    setRotateY(rotateYAmount);
    
    // Update glare position relative to mouse
    if (glareEnabled) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Reset rotation when mouse leaves if reset is true
    if (reset) {
      setRotateX(0);
      setRotateY(0);
    }
  };

  // สไตล์แบบ GitHub
  const getShadowStyle = () => {
    if (!shadow) return 'none';
    
    return isHovering 
      ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 20px rgba(144, 39, 142, 0.4)` 
      : `0 4px 20px rgba(144, 39, 142, 0.2), 0 0 0 1px rgba(144, 39, 142, 0.1)`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative perspective-container ${className || ''}`} 
      style={{ 
        ...style,
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
        borderRadius,
        transition: 'box-shadow 0.3s ease-out',
        boxShadow: getShadowStyle()
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovering ? scale : 1,
        }}
        transition={{
          type: "spring",
          stiffness: rotationStiffness,
          damping: rotationDamping,
          mass: 0.8
        }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          borderRadius: 'inherit',
          position: 'relative',
          border: isHovering ? `1px solid rgba(144, 39, 142, 0.2)` : 'none'
        }}
      >
        {children}
        
        {/* Glare effect styled for GitHub with theme color */}
        {glareEnabled && isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(144, 39, 142, ${glareOpacity / 2}) 0%, rgba(255,255,255,${glareOpacity}) ${glareSize * 50}%, rgba(255,255,255,0) ${glareSize * 100}%)`
            }}
            transition={{ duration: 0.1 }}
            style={{ borderRadius: 'inherit', mixBlendMode: 'overlay' }}
          />
        )}
        
        {/* GitHub-style border glow on hover */}
        {isHovering && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              borderRadius: 'inherit',
              boxShadow: `0 0 0 1px ${themeColor}33`,
              zIndex: 10
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Image3DEffect;