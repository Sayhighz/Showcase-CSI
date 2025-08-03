import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { BulbOutlined, TrophyOutlined, ReadOutlined, HomeOutlined } from '@ant-design/icons';

const NavigationSidebar = ({ scrollToSection, refs }) => {
  const { courseWorkRef, competitionRef, academicRef } = refs;
  // กำหนดค่าเริ่มต้นเป็น 'home' อย่างชัดเจน
  const [activeSection, setActiveSection] = useState('home');
  const { scrollY } = useScroll();
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
      
      // ตรวจสอบตำแหน่งของแต่ละ section
      const courseWorkPos = courseWorkRef.current?.offsetTop || 0;
      const competitionPos = competitionRef.current?.offsetTop || 0;
      const academicPos = academicRef.current?.offsetTop || 0;
      
      // กำหนด section ที่กำลังดูอยู่ โดยใช้ค่าขอบเขตที่ชัดเจน
      if (scrollPosition >= academicPos - 100) {
        setActiveSection('academic');
      } else if (scrollPosition >= competitionPos - 100) {
        setActiveSection('competition');
      } else if (scrollPosition >= courseWorkPos - 100) {
        setActiveSection('courseWork');
      } else {
        // ถ้าไม่ตรงกับเงื่อนไขอื่นใด ถือว่าอยู่ที่ home
        setActiveSection('home');
      }

      // ตรวจสอบเงื่อนไขเพิ่มเติมสำหรับ home
      if (scrollPosition < 100) {
        setActiveSection('home');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // เรียกใช้ฟังก์ชันทันทีเพื่อตั้งค่าเริ่มต้น
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
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
              className={`flex flex-col items-center justify-center p-2 ${
                activeSection === item.id 
                  ? 'text-[#90278E]' 
                  : 'text-gray-600'
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={item.onClick}
            >
              <div className={`text-lg ${activeSection === item.id ? 'text-[#90278E]' : 'text-gray-500'}`}>
                {item.icon}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {activeSection === item.id && (
                <motion.div 
                  className="h-1 w-5 bg-[#90278E] rounded-full mt-1"
                  layoutId="mobileActiveIndicator"
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
            <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-[#90278E] text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {item.label}
            </div>
            
            <motion.button
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
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