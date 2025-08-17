import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// eslint-disable-next-line no-unused-vars
const _motion = motion; // Suppress eslint warning for motion usage in JSX

const SpaceBackground = ({ isMobile = false, className = "" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Generate stars with better distribution and variety
  const stars = useMemo(() => {
    const starCount = isMobile ? 30 : 80;
    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 3 + 2,
      depth: Math.random() * 100,
    }));
  }, [isMobile]);

  // Generate nebula clouds
  const nebulaClouds = useMemo(() => {
    const cloudCount = isMobile ? 3 : 6;
    return Array.from({ length: cloudCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 300 + 200,
      opacity: Math.random() * 0.1 + 0.05,
      moveSpeed: Math.random() * 20 + 30,
    }));
  }, [isMobile]);


  // Track mouse movement for parallax effect
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Enhanced gradient background with deeper space colors */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(144, 39, 142, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(94, 26, 92, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(178, 82, 176, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, #0a0014 0%, #1a0526 25%, #90278E 100%)
          `
        }}
      />

      {/* Nebula clouds */}
      {nebulaClouds.map((cloud) => (
        <motion.div
          key={`nebula-${cloud.id}`}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size}px`,
            background: `radial-gradient(circle, rgba(144, 39, 142, ${cloud.opacity}) 0%, rgba(178, 82, 176, ${cloud.opacity * 0.5}) 50%, transparent 100%)`,
            transform: isMobile ? 'none' : `translate(${mousePosition.x * 10}px, ${mousePosition.y * 5}px)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [cloud.opacity, cloud.opacity * 1.5, cloud.opacity],
          }}
          transition={{
            duration: cloud.moveSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Enhanced twinkling stars */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8), 0 0 ${star.size * 4}px rgba(144, 39, 142, 0.4)`,
            transform: isMobile ? 'none' : `translate(${mousePosition.x * (star.depth / 10)}px, ${mousePosition.y * (star.depth / 15)}px)`,
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: star.twinkleSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}


      {/* Distant galaxies */}
      {!isMobile && Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`galaxy-${i}`}
          className="absolute opacity-10"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 25}%`,
            width: `${150 + i * 50}px`,
            height: `${80 + i * 30}px`,
            background: `radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, rgba(144, 39, 142, 0.2) 30%, transparent 70%)`,
            borderRadius: '50%',
            transform: `rotate(${i * 45}deg)`,
            filter: 'blur(2px)',
          }}
          animate={{
            rotate: [i * 45, i * 45 + 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 120 + i * 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}

      {/* Atmospheric glow overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at center, transparent 40%, rgba(144, 39, 142, 0.1) 100%)`,
        }}
      />
    </div>
  );
};

export default SpaceBackground;