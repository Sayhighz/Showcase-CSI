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
  
  /* IntersectionObserver + hysteresis: ป้องกันการสลับไม่เนียนบริเวณด้านบนของ banner */
  useEffect(() => {
    setActiveSection('home');
  
    const sections = [
      { id: 'courseWork', el: courseWorkRef?.current },
      { id: 'competition', el: competitionRef?.current },
      { id: 'academic', el: academicRef?.current },
    ].filter(s => s.el);
  
    if (sections.length === 0) return;
  
    const visibleRatios = new Map();
    const lastActiveRef = { current: 'home' };
  
    // กำหนดฮิสเทอรีซิส: ต้องเห็น section มากพอถึงจะ "เข้า" และจะ "ออก" เมื่อเห็นน้อยลงกว่าค่าที่ต่ำกว่า
    const ENTER_THRESHOLD = 0.35;
    const EXIT_THRESHOLD = 0.2;
    const SLACK = 0.05; // กันสั่นเมื่อสอง section สูสี
  
    const updateActive = () => {
      // หา section ที่เห็นมากที่สุด
      let bestId = 'home';
      let bestRatio = 0;
  
      sections.forEach(({ id }) => {
        const r = visibleRatios.get(id) ?? 0;
        if (r > bestRatio) {
          bestRatio = r;
          bestId = id;
        }
      });
  
      const current = lastActiveRef.current;
      const currentRatio = visibleRatios.get(current) ?? 0;
  
      if (current === 'home') {
        // จาก home -> เข้า section ใหม่เมื่อเห็นมากพอ
        if (bestRatio >= ENTER_THRESHOLD) {
          lastActiveRef.current = bestId;
          setActiveSection(bestId);
        } else {
          // คง home (ไม่สลับไปมาเวลาอยู่ใกล้ๆ ด้านบน)
        }
        return;
      }
  
      // current เป็นหนึ่งใน section
      // คง current ไว้ถ้ายังเห็นมากพอ และไม่ได้แพ้คู่แข่งแบบชัดเจน
      if (currentRatio >= EXIT_THRESHOLD && currentRatio >= bestRatio - SLACK) {
        return; // คงสถานะเดิมเพื่อความเนียน
      }
  
      // เปลี่ยนไปหา best ถ้าเห็นมากพอ มิฉะนั้นกลับไปที่ home
      if (bestRatio >= ENTER_THRESHOLD) {
        lastActiveRef.current = bestId;
        setActiveSection(bestId);
      } else {
        lastActiveRef.current = 'home';
        setActiveSection('home');
      }
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const match = sections.find(s => s.el === entry.target);
        if (!match) return;
        visibleRatios.set(match.id, entry.intersectionRatio);
      });
      updateActive();
    }, {
      root: null,
      // ลดพื้นที่ด้านล่างของ viewport ลง เพื่อให้ต้องเห็น section มากพอค่อยสลับ
      rootMargin: '0px 0px -30% 0px',
      threshold: [0, 0.1, 0.25, 0.35, 0.5, 0.75, 1]
    });
  
    sections.forEach(s => observer.observe(s.el));
  
    // evaluate ครั้งแรก
    requestAnimationFrame(updateActive);
  
    return () => observer.disconnect();
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