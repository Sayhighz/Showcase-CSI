import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'antd';

const ProjectHeader = ({ 
  icon: Icon,
  title,
  description,
  themeColors,
  stats = [],
  showStats = true,
  additionalIcons = []
}) => {
  const headingGradient = {
    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    textShadow: `0 0 20px ${themeColors.primary}20`
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-4 sm:mb-6 md:mb-8 relative z-10"
    >
      <motion.div
        className="flex items-center justify-center gap-3 mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {Icon && (
          <Icon 
            className="text-4xl sm:text-5xl md:text-6xl" 
            style={{ color: themeColors.primary }}
          />
        )}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold"
          style={headingGradient}
        >
          {title}
        </motion.h1>
        {additionalIcons.map((IconComponent, index) => (
          <IconComponent 
            key={index}
            className="text-3xl sm:text-4xl md:text-5xl" 
            style={{ color: themeColors.secondary }}
          />
        ))}
      </motion.div>
      
      <motion.p 
        className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {description}
      </motion.p>
      
      <motion.div
        className="h-1 w-20 sm:w-24 md:w-32 mx-auto mt-4 rounded-full"
        style={{ 
          background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
          boxShadow: `0 0 20px ${themeColors.primary}30`
        }}
        initial={{ width: 0 }}
        animate={{ width: '8rem' }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {showStats && stats.length > 0 && (
        <motion.div
          className="flex justify-center gap-6 sm:gap-8 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div 
                className="text-2xl font-bold mb-1"
                style={{ color: stat.color || themeColors.primary }}
                animate={stat.animation || { scale: [1, 1.1, 1] }}
                transition={stat.transition || { duration: 2, repeat: Infinity }}
              >
                {stat.icon ? <stat.icon /> : stat.value}
              </motion.div>
              <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProjectHeader;