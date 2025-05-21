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

  // แปลงค่า scroll progress เป็นค่าต่างๆ สำหรับใช้กับเอฟเฟกต์ (สมมาตร)
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, -30]);
  
  // กำหนดสีตามธีมแบบสมมาตร
  const colors = {
    light: {
      title: '#90278E',
      subtitle: 'rgba(0, 0, 0, 0.65)',
      icon: '#90278E',
      iconBg: 'bg-gradient-to-br from-white to-[#F5EAFF] border border-[#90278E] border-opacity-20',
      labelBg: 'bg-[#90278E] bg-opacity-10',
      labelBorder: 'border-[#90278E] border-opacity-20',
      labelText: '#90278E',
      glassOverlay: 'bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm'
    },
    dark: {
      title: 'white',
      subtitle: 'rgba(255, 255, 255, 0.8)',
      icon: 'white',
      iconBg: 'bg-gradient-to-br from-[#90278E] to-[#B252B0] border border-white border-opacity-20',
      labelBg: 'bg-white bg-opacity-10',
      labelBorder: 'border-white border-opacity-20',
      labelText: 'white',
      glassOverlay: 'bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm'
    }
  };

  const currentColors = colors[colorScheme];
  
  return (
    <motion.div
      ref={ref}
      className={`mb-8 md:mb-16 text-center relative z-10 ${className}`}
      style={{
        scale,
        y,
        opacity
      }}
    >
      <Space direction="vertical" size="large" className="w-full">
        {/* Icon container with consistent styling */}
        <div className="flex flex-col items-center">
          <motion.div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${currentColors.iconBg} flex items-center justify-center mx-auto mb-4 shadow-lg`}
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 8px 30px rgba(144, 39, 142, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          >
            {React.cloneElement(icon, { 
              style: { color: currentColors.icon, fontSize: window.innerWidth < 640 ? '20px' : '28px' }
            })}
          </motion.div>
          
          {/* Label with consistent styling */}
          <div className="mb-4">
            <motion.div
              className={`${currentColors.labelBg} px-3 sm:px-4 py-1 sm:py-2 rounded-full border ${currentColors.labelBorder} text-xs sm:text-sm`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Text style={{ color: currentColors.labelText, fontWeight: 500 }}>
                EXPLORE PROJECTS
              </Text>
            </motion.div>
          </div>
        </div>
        
        {/* Title with gradient underline */}
        <AnimatedText type="heading" delay={0.1}>
          <div className="relative inline-block">
            <Title 
              level={2} 
              className="text-xl sm:text-2xl md:text-3xl drop-shadow-sm"
              style={{ 
                margin: 0, 
                color: currentColors.title,
                fontWeight: 700,
                lineHeight: 1.2
              }}
            >
              {title}
            </Title>
            <motion.div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-[#90278E] to-transparent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </AnimatedText>
        
        {/* Subtitle with glass background */}
        <AnimatedText type="paragraph" delay={0.2}>
          <div className={`max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl ${currentColors.glassOverlay} border border-white border-opacity-10`}>
            <Text 
              style={{ color: currentColors.subtitle }}
              className="text-sm sm:text-base md:text-lg block leading-relaxed"
            >
              {subtitle}
            </Text>
          </div>
        </AnimatedText>
        
        {/* Dots separator with animation */}
        <motion.div
          className="flex justify-center gap-2 mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={`dot-${index}`}
              className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full ${
                index === 2 
                  ? 'bg-[#90278E]' 
                  : 'bg-[#90278E] bg-opacity-30'
              }`}
              animate={index === 2 ? { 
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3] 
              } : {}}
              transition={{
                duration: 2,
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