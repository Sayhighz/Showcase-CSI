import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Typography, Space } from 'antd';
import AnimatedText from './AnimatedText';

const { Title, Text } = Typography;

const SectionHeader = ({ 
  icon, 
  title, 
  subtitle, 
  colorScheme = 'light',
  className = ''
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // แปลงค่า scroll progress เป็นค่าต่างๆ สำหรับใช้กับเอฟเฟกต์
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -40]);
  
  // กำหนดสีตามธีม
  const titleColor = colorScheme === 'light' ? '#90278E' : 'white';
  const subtitleColor = colorScheme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)';
  
  // GitHub-style background for icon
  const iconBg = colorScheme === 'light' 
    ? 'bg-gradient-to-br from-white to-[#F5EAFF] border border-[#90278E] border-opacity-20' 
    : 'bg-gradient-to-br from-[#90278E] to-[#B252B0] border border-white border-opacity-20';
  
  const iconColor = colorScheme === 'light' ? '#90278E' : 'white';
  
  return (
    <motion.div
      ref={ref}
      className={`mb-16 text-center relative z-10 ${className}`}
      style={{
        scale,
        y,
        opacity
      }}
    >
      <Space direction="vertical" size="large" className="w-full">
        {/* GitHub-style header with label */}
        <div className="flex flex-col items-center">
          {/* Icon with GitHub-style shadow and gradient */}
          <motion.div
            className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4 shadow-lg`}
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 8px 30px rgba(144, 39, 142, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          >
            {React.cloneElement(icon, { 
              className: `text-${iconColor} text-3xl`,
            })}
          </motion.div>
          
          {/* GitHub-style label */}
          <div className="mb-4">
            <motion.div
              className="bg-[#90278E] bg-opacity-10 px-3 py-1 rounded-full border border-[#90278E] border-opacity-20"
              whileHover={{ backgroundColor: 'rgba(144, 39, 142, 0.2)' }}
            >
              <Text style={{ color: '#90278E', fontWeight: 500 }}>EXPLORE PROJECTS</Text>
            </motion.div>
          </div>
        </div>
        
        {/* Title with GitHub-style gradient underline */}
        <AnimatedText type="heading" delay={0.1}>
          <div className="relative inline-block">
            <Title 
              level={2} 
              style={{ 
                margin: 0, 
                color: titleColor,
                fontSize: '2.5rem',
                fontWeight: 700
              }}
              className="drop-shadow-sm"
            >
              {title}
            </Title>
            <motion.div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-[#90278E] to-transparent"
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </AnimatedText>
        
        {/* Subtitle with GitHub-style glass background */}
        <AnimatedText type="paragraph" delay={0.2}>
          <div className="max-w-2xl mx-auto px-6 py-3 rounded-xl bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm border border-white border-opacity-10">
            <Text 
              style={{ color: subtitleColor }}
              className="text-lg block"
            >
              {subtitle}
            </Text>
          </div>
        </AnimatedText>
        
        {/* GitHub-style dots separator */}
        <motion.div
          className="flex justify-center gap-2 mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          {[1, 2, 3, 4, 5].map((_, index) => (
            <motion.div
              key={`dot-${index}`}
              className={`w-2 h-2 rounded-full ${index === 2 ? 'bg-[#90278E]' : 'bg-[#90278E] bg-opacity-30'}`}
              animate={index === 2 ? { scale: [1, 1.2, 1] } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </Space>
    </motion.div>
  );
};

export default SectionHeader;