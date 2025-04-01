import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Typography, Space, Divider } from 'antd';
import RocketIcon from '../../assets/rocket.png';
import StarsIcon from '../../assets/earth.png';
import SearchBar from '../SearchBar/SearchBar';

const { Title, Text } = Typography;

const generateStars = () => {
  return new Array(100).fill(0).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 4 + 1}px`,
    opacity: Math.random() * 0.8 + 0.2,
  }));
};

const generateComets = () => {
  return new Array(8).fill(0).map((_, i) => ({
    id: i,
    top: `${Math.random() * 20}%`,
    left: `${Math.random() * 20}%`,
    size: `${Math.random() * 5 + 3}px`,
    opacity: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 3,
  }));
};

const Banner = () => {
  const [scrollY, setScrollY] = useState(0);
  const [stars] = useState(() => generateStars());
  const [comets] = useState(() => generateComets());
  const textControls = useAnimation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Only animate the text based on scroll, not the stars or comets
      textControls.start({ y: -window.scrollY * 0.3, opacity: 1 - window.scrollY / 500 });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [textControls]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#90278E] via-[#B252B0] to-[#5E1A5C] flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 bg-[url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg')] bg-repeat opacity-10"
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 200,
          ease: "linear"
        }}
      />
      
      {/* Rocket and Stars */}
      <motion.img 
        src={RocketIcon} 
        alt="Rocket" 
        className="absolute top-1/4 left-40 w-48 md:w-64 opacity-90 z-10"
        animate={{ 
          y: [-20, 20, -20], 
          rotate: [0, 10, -10, 0],
          filter: ["drop-shadow(0 0 8px rgba(255,255,255,0.3))", "drop-shadow(0 0 16px rgba(255,255,255,0.6))", "drop-shadow(0 0 8px rgba(255,255,255,0.3))"]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.img 
        src={StarsIcon} 
        alt="Earth" 
        className="absolute bottom-1/4 right-40 w-48 md:w-64 opacity-90 z-10"
        animate={{ 
          rotate: 360,
          filter: ["drop-shadow(0 0 8px rgba(255,192,255,0.5))", "drop-shadow(0 0 16px rgba(255,192,255,0.8))", "drop-shadow(0 0 8px rgba(255,192,255,0.5))"]
        }} 
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      
      {/* Star Points with Enhanced Animation - Fixed Position Container */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map(star => (
          <motion.div 
            key={star.id} 
            className="absolute bg-white rounded-full"
            style={{ 
              top: star.top, 
              left: star.left, 
              width: star.size, 
              height: star.size, 
              opacity: star.opacity,
              boxShadow: `0 0 ${parseInt(star.size) * 2}px rgba(255, 255, 255, ${star.opacity})` 
            }}
            animate={{ 
              opacity: [star.opacity * 0.7, star.opacity, star.opacity * 0.7],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              duration: Math.random() * 4 + 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Enhanced Comets with Trails - Fixed Position Container */}
      <div className="absolute inset-0 pointer-events-none">
        {comets.map(comet => (
          <motion.div
            key={comet.id}
            className="absolute rounded-full"
            style={{
              top: comet.top,
              left: comet.left,
              width: comet.size,
              height: comet.size,
              opacity: comet.opacity,
              background: 'linear-gradient(45deg, rgba(255,255,255,1), rgba(255,200,255,0.8))',
              boxShadow: '0 0 20px 5px rgba(255, 200, 255, 0.8)',
              zIndex: 5
            }}
            animate={{
              x: ['0%', '120%'],
              y: ['0%', '120%'],
              opacity: [comet.opacity, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              delay: comet.delay,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeOut',
            }}
          >
            {/* Comet trail */}
            <motion.div 
              className="absolute top-0 right-0 bottom-0 left-0"
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(255,200,255,0.4))',
                transform: 'translateX(-100%) scale(8, 1)',
                transformOrigin: 'right center',
                borderRadius: '50%',
                filter: 'blur(4px)'
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Text with Antd Components */}
      <motion.div 
        className="z-20 flex flex-col items-center py-8 px-12 rounded-xl" 
        initial={{ opacity: 0, y: 50 }}
        animate={textControls}
        transition={{ duration: 1 }}
      >
        <Space direction="vertical" size="large" className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Title level={1} style={{ color: 'white', marginBottom: 0, fontSize: '3.5rem', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
              Explore Projects
            </Title>
            <Title level={1} style={{ color: 'white', marginTop: 0, fontSize: '3.5rem', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
              From CSI Students
            </Title>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Text style={{ color: '#FFE6FF', fontSize: '1.5rem', display: 'block', marginBottom: '1.5rem' }}>
              ค้นหาโปรเจคสุดเจ๋งจากนักศึกษา CSI
            </Text>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-full"
          >
            <SearchBar />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Text italic style={{ color: '#F8CDFF', fontSize: '1rem' }}>
              ค้นพบไอเดียใหม่ และผลงานที่น่าสนใจ
            </Text>
          </motion.div>
        </Space>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
      </motion.div>
    </div>
  );
};

export default Banner;