import React from 'react';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ScrollIndicator = ({ 
  onClick, 
  text = "Scroll to explore", 
  direction = 'down',
  color = 'white' 
}) => {
  return (
    <motion.div
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer z-50"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.6, 1, 0.6], 
        y: [0, 10, 0] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 2,
        ease: "easeInOut"
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="text-white opacity-80 text-sm mb-2">{text}</div>
      
      {/* GitHub-style arrow icon */}
      {direction === 'down' ? (
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      ) : (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-180">
            <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScrollIndicator;