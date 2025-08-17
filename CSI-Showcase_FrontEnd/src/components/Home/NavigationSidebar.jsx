import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { BulbOutlined, TrophyOutlined, ReadOutlined, HomeOutlined } from '@ant-design/icons';

const NavigationSidebar = ({ scrollToSection, refs }) => {
  const { courseWorkRef, competitionRef, academicRef } = refs;
  // กำหนดค่าเริ่มต้นเป็น 'home' อย่างชัดเจน
  const [activeSection, setActiveSection] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  
  // ตรวจสอบขนาดหน้าจอและตั้งค่า mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // ติดตามตำแหน่งเลื่อนเพื่อไฮไลต์ navigation ที่กำลังดู
  useEffect(() => {
    // กำหนดค่าเริ่มต้นเป็น 'home'
    setActiveSection('home');
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // ใช้ threshold ที่เล็กกว่าเพื่อให้สามารถเปลี่ยนได้เร็วขึ้น
      const threshold = 200; // fixed threshold
      
      // ใช้ offsetTop สำหรับความแม่นยำสูง
      const courseWorkElement = courseWorkRef.current;
      const competitionElement = competitionRef.current;
      const academicElement = academicRef.current;
      
      let courseWorkPos = null;
      let competitionPos = null;
      let academicPos = null;
      
      if (courseWorkElement) {
        courseWorkPos = courseWorkElement.offsetTop;
      }
      if (competitionElement) {
        competitionPos = competitionElement.offsetTop;
      }
      if (academicElement) {
        academicPos = academicElement.offsetTop;
      }
      
      // Debug: แสดงค่าต่าง ๆ
      console.log('Scroll Debug:', {
        scrollPosition,
        threshold,
        courseWorkPos,
        competitionPos,
        academicPos,
        windowHeight
      });
      
      // ปรับปรุงเงื่อนไขให้ติดตาม scroll อย่างแม่นยำ
      let newActiveSection = 'home';
      
      // ถ้าอยู่ใกล้จุดเริ่มต้น (บน banner)
      if (scrollPosition < windowHeight * 0.8) {
        newActiveSection = 'home';
      }
      // เช็ค courseWork section
      else if (courseWorkPos !== null && scrollPosition >= courseWorkPos - threshold) {
        newActiveSection = 'courseWork';
        
        // เช็ค competition section
        if (competitionPos !== null && scrollPosition >= competitionPos - threshold) {
          newActiveSection = 'competition';
          
          // เช็ค academic section
          if (academicPos !== null && scrollPosition >= academicPos - threshold) {
            newActiveSection = 'academic';
          }
        }
      }
      
      console.log('Active section should be:', newActiveSection);
      
      // เปลี่ยน active section
      setActiveSection(newActiveSection);
    };
    
    // ใช้ requestAnimationFrame แทน throttle สำหรับ smoother animation
    let rafId = null;
    const smoothHandleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };
    
    window.addEventListener('scroll', smoothHandleScroll, { passive: true });
    
    // เรียกใช้ฟังก์ชันทันทีเพื่อตั้งค่าเริ่มต้น
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', smoothHandleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [courseWorkRef, competitionRef, academicRef]);
  
  // แสดงสถานะปัจจุบันใน console (สามารถลบออกได้ในโค้ดจริง)
  useEffect(() => {
    // console.log('Active Section:', activeSection);
  }, [activeSection]);
  
  // Navigation items
  const navItems = [
    {
      id: 'home',
      icon: <HomeOutlined />,
      label: 'หน้าแรก',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('home'); // กำหนดค่า active section โดยตรงเมื่อคลิก
      }
    },
    {
      id: 'courseWork',
      icon: <BulbOutlined />,
      label: 'วิชาเรียน',
      onClick: () => {
        scrollToSection(courseWorkRef);
        setActiveSection('courseWork'); // กำหนดค่า active section โดยตรงเมื่อคลิก
      }
    },
    {
      id: 'competition',
      icon: <TrophyOutlined />,
      label: 'การแข่งขัน',
      onClick: () => {
        scrollToSection(competitionRef);
        setActiveSection('competition'); // กำหนดค่า active section โดยตรงเมื่อคลิก
      }
    },
    {
      id: 'academic',
      icon: <ReadOutlined />,
      label: 'งานวิชาการ',
      onClick: () => {
        scrollToSection(academicRef);
        setActiveSection('academic'); // กำหนดค่า active section โดยตรงเมื่อคลิก
      }
    }
  ];
  
  // ถ้าเป็น mobile ให้ทำเป็น bottom navigation
  if (isMobile) {
    return (
      <div className="fixed z-50 bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-filter backdrop-blur-md shadow-lg border-t border-gray-200">
        <div className="flex justify-around items-center p-2">
          {navItems.map(item => (
            <motion.button
              key={item.id}
              className="flex flex-col items-center justify-center p-2"
              whileTap={{ scale: 0.9 }}
              animate={{
                color: activeSection === item.id ? '#90278E' : '#6B7280',
                scale: activeSection === item.id ? 1.05 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
              onClick={item.onClick}
            >
              <motion.div 
                className="text-lg"
                animate={{
                  color: activeSection === item.id ? '#90278E' : '#6B7280',
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {item.icon}
              </motion.div>
              <span className="text-xs mt-1">{item.label}</span>
              {activeSection === item.id && (
                <motion.div 
                  className="h-1 w-5 bg-[#90278E] rounded-full mt-1"
                  layoutId="mobileActiveIndicator"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop version
  return (
    <div className="fixed z-50 top-1/2 right-0 transform -translate-y-1/2 p-3 bg-[#90278E] bg-opacity-10 backdrop-filter backdrop-blur-md rounded-l-xl">
      <div className="flex flex-col items-center space-y-4 md:space-y-6 py-2">
        {navItems.map(item => (
          <div key={item.id} className="relative group">
            {/* ป้ายกำกับที่แสดงเมื่อ hover */}
            <motion.div 
              className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-[#90278E] text-white text-sm rounded whitespace-nowrap"
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.div>
            
            <motion.button
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
              animate={{
                backgroundColor: activeSection === item.id ? '#90278E' : 'rgba(255, 255, 255, 0.8)',
                color: activeSection === item.id ? '#ffffff' : '#90278E',
                scale: activeSection === item.id ? 1.1 : 1,
                boxShadow: activeSection === item.id 
                  ? '0 10px 25px rgba(144, 39, 142, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{ 
                scale: activeSection === item.id ? 1.15 : 1.1,
                backgroundColor: '#90278E',
                color: '#ffffff'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut"
              }}
              onClick={item.onClick}
            >
              {item.icon}
            </motion.button>
            
            {/* เส้นแสดง active section */}
            {activeSection === item.id && (
              <motion.div 
                className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-[#90278E] rounded-full"
                layoutId="activeIndicator"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ 
                  duration: 0.4,
                  ease: "easeOut"
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationSidebar;