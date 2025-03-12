import React, { useEffect, useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { motion, useAnimation } from 'framer-motion';
import RocketIcon from '../../assets/rocket.png';
import StarsIcon from '../../assets/earth.png';

const generateStars = () => {
  return new Array(50).fill(0).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 4 + 1}px`,
    opacity: Math.random() * 0.8 + 0.2,
  }));
};

const Banner = () => {
  const [scrollY, setScrollY] = useState(0);
  const stars = generateStars();
  const textControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      textControls.start({ y: -scrollY * 0.2, opacity: 1 });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [textControls, scrollY]);

  return (
    <div 
      className="w-full h-screen bg-gradient-to-b from-[#90278E] via-[#B56CC6] to-[#1F1F5C] flex flex-col items-center justify-center text-center text-white relative overflow-hidden"
    >
      {/* วัตถุลอยในอวกาศ และขยับอัตโนมัติ */}
      <motion.img 
        src={RocketIcon} 
        alt="Rocket" 
        className="absolute top-1/4 left-40 w-48 md:w-56 opacity-90"
        animate={{ y: [-20, 20, -20], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.img 
        src={StarsIcon} 
        alt="Stars" 
        className="absolute bottom-1/4 right-40 w-48 md:w-56 opacity-80"
        animate={{ rotate: 360 }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* จุดแสงดวงดาว */}
      {stars.map(star => (
        <motion.div 
          key={star.id} 
          className="absolute bg-white rounded-full"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: star.opacity }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      
      {/* ข้อความหลัก */}
      <motion.div 
        className="z-10 flex flex-col items-center" 
        initial={{ opacity: 1, y: 0 }}
        animate={textControls}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
          Explore Projects
        </h1>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
          From CSI Students
        </h1>
        
        {/* ข้อความรอง */}
        <p className="text-xl md:text-2xl mb-10 text-gray-300">
          ค้นหาโปรเจคสุดเจ๋งจากนักศึกษา CSI
        </p>
        
        {/* แสดงผล SearchBar */}
        <SearchBar />
      </motion.div>
    </div>
  );
};

export default Banner;