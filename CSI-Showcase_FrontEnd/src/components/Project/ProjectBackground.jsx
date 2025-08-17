import React from 'react';
import { motion } from 'framer-motion';

const ProjectBackground = ({ 
  themeColors,
  icons = [],
  blobs = [],
  particles = { count: 40, mobileCount: 20 }
}) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      {icons.map((iconConfig, index) => (
        <motion.div 
          key={`icon-${index}`}
          className={`absolute ${iconConfig.className}`}
          style={{ color: iconConfig.color }}
          animate={iconConfig.animation}
          transition={iconConfig.transition}
        >
          <iconConfig.icon />
        </motion.div>
      ))}

      {blobs.map((blob, index) => (
        <motion.div 
          key={`blob-${index}`}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          style={blob.style}
          animate={blob.animation}
          transition={blob.transition}
        />
      ))}
      
      {Array.from({ length: window.innerWidth < 768 ? particles.mobileCount : particles.count }).map((_, i) => {
        const size = Math.random() * 4 + 1;
        const opacity = Math.random() * 0.4 + 0.15;
        const isSpecial = i % 7 === 0;
        
        return (
          <motion.div
            key={i}
            className={`absolute ${isSpecial ? 'rounded-sm' : 'rounded-full'}`}
            style={{
              width: isSpecial ? size * 1.5 : size,
              height: size,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: isSpecial ? themeColors.secondary : themeColors.primary,
              boxShadow: `0 0 ${parseInt(size) * 3}px ${themeColors.primary}${Math.round(opacity * 255).toString(16)}`
            }}
            animate={{ 
              opacity: [opacity * 0.5, opacity, opacity * 0.5],
              scale: [0.8, 1.2, 0.8],
              rotate: isSpecial ? [0, 360] : [0, 180]
            }}
            transition={{ 
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        );
      })}
    </div>
  );
};

export default ProjectBackground;