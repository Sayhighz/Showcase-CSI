import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { BulbOutlined, TrophyOutlined, ReadOutlined, HomeOutlined } from '@ant-design/icons';

const NavigationSidebar = ({ scrollToSection, refs }) => {
  const { courseWorkRef, competitionRef, academicRef } = refs;
  const [activeSection, setActiveSection] = useState(null);
  const { scrollY } = useScroll();
  
  // ติดตามตำแหน่งเลื่อนเพื่อไฮไลต์ navigation ที่กำลังดู
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // ตรวจสอบตำแหน่งของแต่ละ section
      const courseWorkPos = courseWorkRef.current?.offsetTop || 0;
      const competitionPos = competitionRef.current?.offsetTop || 0;
      const academicPos = academicRef.current?.offsetTop || 0;
      
      // กำหนด section ที่กำลังดูอยู่
      if (scrollPosition < courseWorkPos) {
        setActiveSection('home');
      } else if (scrollPosition >= academicPos) {
        setActiveSection('academic');
      } else if (scrollPosition >= competitionPos) {
        setActiveSection('competition');
      } else if (scrollPosition >= courseWorkPos) {
        setActiveSection('courseWork');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [courseWorkRef, competitionRef, academicRef]);
  
  // Navigation items
  const navItems = [
    {
      id: 'home',
      icon: <HomeOutlined />,
      label: 'หน้าแรก',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    {
      id: 'courseWork',
      icon: <BulbOutlined />,
      label: 'วิชาเรียน',
      onClick: () => scrollToSection(courseWorkRef)
    },
    {
      id: 'competition',
      icon: <TrophyOutlined />,
      label: 'การแข่งขัน',
      onClick: () => scrollToSection(competitionRef)
    },
    {
      id: 'academic',
      icon: <ReadOutlined />,
      label: 'งานวิชาการ',
      onClick: () => scrollToSection(academicRef)
    }
  ];
  
  return (
    <div className="fixed z-50 top-1/2 right-0 transform -translate-y-1/2 p-3 bg-[#90278E] bg-opacity-10 backdrop-filter backdrop-blur-md rounded-l-xl">
      <div className="flex flex-col items-center space-y-6 py-2">
        {navItems.map(item => (
          <div key={item.id} className="relative group">
            {/* ป้ายกำกับที่แสดงเมื่อ hover */}
            <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-[#90278E] text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {item.label}
            </div>
            
            <motion.button
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeSection === item.id 
                  ? 'bg-[#90278E] text-white shadow-lg' 
                  : 'bg-white bg-opacity-80 text-[#90278E] hover:bg-[#90278E] hover:text-white'
              } transition-colors duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
            >
              {item.icon}
            </motion.button>
            
            {/* เส้นแสดง active section */}
            {activeSection === item.id && (
              <motion.div 
                className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-[#90278E] rounded-full"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationSidebar;