import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Typography, Space, Divider } from 'antd';
import RocketIcon from '../../assets/rocket.png';
import StarsIcon from '../../assets/earth.png';
import SearchBar from '../SearchBar/SearchBar';

const { Title, Text } = Typography;

// สร้างดาวในพื้นหลัง
const generateStars = () => {
  return new Array(100).fill(0).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 2 + 1}px`,
    opacity: Math.random() * 0.8 + 0.2,
    depth: Math.random() * 80 + 20, // ค่าความลึกแบบสุ่มสำหรับเอฟเฟกต์ 3D
  }));
};

// สร้างดาวตก
const generateComets = () => {
  return new Array(5).fill(0).map((_, i) => ({
    id: i,
    top: `${Math.random() * 20}%`,
    left: `${Math.random() * 20}%`,
    size: `${Math.random() * 4 + 2}px`,
    opacity: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 3,
    depth: Math.random() * 60 + 40, // ค่าความลึกแบบสุ่ม
  }));
};

const Banner = () => {
  const [scrollY, setScrollY] = useState(0);
  const [stars] = useState(() => generateStars());
  const [comets] = useState(() => generateComets());
  const textControls = useAnimation();
  const containerRef = useRef(null);
  
  // State สำหรับตำแหน่งเมาส์
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // State สำหรับขนาดของ container
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    // กำหนดค่าเริ่มต้นของอนิเมชันข้อความเมื่อโหลด
    textControls.start({ y: 0, opacity: 1 });
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // อนิเมชันข้อความตาม scroll
      if (currentScrollY > 0) {
        textControls.start({ 
          y: -currentScrollY * 0.3, 
          opacity: Math.max(0, 1 - currentScrollY / 500),
          transition: { duration: 0.1 } // ให้การเปลี่ยนแปลงราบรื่นขึ้น
        });
      } else {
        // กลับไปยังตำแหน่งเริ่มต้นเมื่ออยู่ด้านบน
        textControls.start({ y: 0, opacity: 1 });
      }
    };
    
    // ตั้งค่าเริ่มต้น
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [textControls]);
  
  // ตั้งค่าการติดตามเมาส์
  useEffect(() => {
    // ตั้งค่าขนาด container เริ่มต้น
    if (containerRef.current) {
      setContainerDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
    
    // ฟังก์ชันจัดการการเคลื่อนไหวของเมาส์
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // คำนวณตำแหน่งเมาส์เทียบกับกึ่งกลาง container
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // ช่วง: -1 ถึง 1
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // ช่วง: -1 ถึง 1
        setMousePosition({ x, y });
      }
    };
    
    // ฟังก์ชันจัดการการเปลี่ยนขนาดหน้าต่าง
    const handleResize = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    // เพิ่ม event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // ตั้งค่าเริ่มต้น
    handleResize();
    
    // ล้าง event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // คำนวณ 3D transform ตามตำแหน่งเมาส์
  const calculateTransform = (depth = 50) => {
    const maxMovement = 30; // การเคลื่อนไหวสูงสุดในหน่วยพิกเซล
    const moveFactor = maxMovement * (depth / 100); // ปรับขนาดการเคลื่อนไหวตามความลึก
    const translateX = -mousePosition.x * moveFactor;
    const translateY = -mousePosition.y * moveFactor;
    return { translateX, translateY };
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen flex flex-col items-center justify-center text-center text-white relative overflow-hidden"
      style={{ 
        perspective: '1000px', // เพิ่ม perspective สำหรับเอฟเฟกต์ 3D
        background: `linear-gradient(to bottom, #90278E, #B252B0, #5E1A5C)` // ใช้ #90278E เป็นสีหลัก
      }}
    >
      {/* ลายดอท GitHub style แต่ใช้สี #90278E */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ 
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* พื้นหลังแบบ Animated ด้วยเอฟเฟกต์ 3D */}
      <motion.div 
        className="absolute inset-0 bg-[url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg')] bg-repeat opacity-5"
        initial={{ backgroundPosition: '0% 0%' }}
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
          translateX: calculateTransform(10).translateX * 0.5,
          translateY: calculateTransform(10).translateY * 0.5,
        }}
        transition={{ 
          backgroundPosition: {
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 200,
            ease: "linear"
          },
          translateX: { duration: 0.1, ease: "easeOut" },
          translateY: { duration: 0.1, ease: "easeOut" }
        }}
      />
      
      {/* Rocket with 3D effect - ใช้สีม่วง #90278E เป็นเงา */}
      <motion.img 
        src={RocketIcon} 
        alt="Rocket" 
        className="absolute top-1/4 left-40 w-48 md:w-64 opacity-90 z-10"
        initial={{ y: 0, rotate: 0, filter: "drop-shadow(0 0 8px rgba(144,39,142,0.3))" }}
        animate={{ 
          y: [-20, 20, -20], 
          rotate: [0, 10, -10, 0],
          filter: ["drop-shadow(0 0 8px rgba(144,39,142,0.3))", "drop-shadow(0 0 16px rgba(144,39,142,0.6))", "drop-shadow(0 0 8px rgba(144,39,142,0.3))"],
          translateX: calculateTransform(70).translateX,
          translateY: calculateTransform(70).translateY,
        }}
        transition={{ 
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          filter: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          translateX: { duration: 0.1, ease: "easeOut" },
          translateY: { duration: 0.1, ease: "easeOut" }
        }}
      />
      
      {/* Earth with 3D effect - ใช้สีม่วง #90278E เป็นเงา */}
      <motion.img 
        src={StarsIcon} 
        alt="Earth" 
        className="absolute bottom-1/4 right-40 w-48 md:w-64 opacity-90 z-10"
        initial={{ rotate: 0, filter: "drop-shadow(0 0 8px rgba(144,39,142,0.5))" }}
        animate={{ 
          rotate: 360,
          filter: ["drop-shadow(0 0 8px rgba(144,39,142,0.5))", "drop-shadow(0 0 16px rgba(178,82,176,0.8))", "drop-shadow(0 0 8px rgba(144,39,142,0.5))"],
          translateX: calculateTransform(60).translateX,
          translateY: calculateTransform(60).translateY,
        }} 
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          filter: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          translateX: { duration: 0.1, ease: "easeOut" },
          translateY: { duration: 0.1, ease: "easeOut" }
        }}
      />
      
      {/* Star Points with 3D Effect - ใช้แสงสีขาวอมม่วง */}
      <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {stars.map(star => {
          const { translateX, translateY } = calculateTransform(star.depth);
          return (
            <motion.div 
              key={star.id} 
              className="absolute bg-white rounded-full"
              style={{ 
                top: star.top, 
                left: star.left, 
                width: star.size, 
                height: star.size, 
                opacity: star.opacity,
                boxShadow: `0 0 ${parseInt(star.size) * 2}px rgba(255, 230, 255, ${star.opacity})`,
                zIndex: Math.floor(star.depth / 10),
              }}
              initial={{ opacity: star.opacity * 0.7, scale: 1 }}
              animate={{ 
                opacity: [star.opacity * 0.7, star.opacity, star.opacity * 0.7],
                scale: [1, 1.2, 1],
                translateX,
                translateY,
              }}
              transition={{ 
                opacity: { duration: Math.random() * 4 + 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 },
                scale: { duration: Math.random() * 4 + 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 },
                translateX: { duration: 0.1, ease: "easeOut" },
                translateY: { duration: 0.1, ease: "easeOut" }
              }}
            />
          );
        })}
      </div>

      {/* Enhanced Comets with 3D Effect - สีม่วงอมชมพู */}
      <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {comets.map(comet => {
          const { translateX: mouseX, translateY: mouseY } = calculateTransform(comet.depth);
          return (
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
                zIndex: Math.floor(comet.depth / 10),
              }}
              initial={{ x: '0%', y: '0%', opacity: comet.opacity }}
              animate={{
                x: ['0%', '120%'],
                y: ['0%', '120%'],
                opacity: [comet.opacity, 0],
                translateX: mouseX,
                translateY: mouseY,
              }}
              transition={{
                x: { duration: Math.random() * 5 + 5, delay: comet.delay, repeat: Infinity, repeatType: 'loop', ease: 'easeOut' },
                y: { duration: Math.random() * 5 + 5, delay: comet.delay, repeat: Infinity, repeatType: 'loop', ease: 'easeOut' },
                opacity: { duration: Math.random() * 5 + 5, delay: comet.delay, repeat: Infinity, repeatType: 'loop', ease: 'easeOut' },
                translateX: { duration: 0.1, ease: "easeOut" },
                translateY: { duration: 0.1, ease: "easeOut" }
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
          );
        })}
      </div>

      {/* Main Text with Depth Effect - เนื้อหาเดิมแต่ปรับสไตล์และใช้สี #90278E */}
      <motion.div 
        className="z-20 flex flex-col items-center py-8 px-12 rounded-xl" 
        initial={{ opacity: 1, y: 0 }}
        animate={{
          ...textControls,
          translateX: calculateTransform(30).translateX * 0.7, // ลดเอฟเฟกต์ลงเพื่อความอ่านง่าย
          translateY: calculateTransform(30).translateY * 0.7,
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          y: { duration: 0.3 },
          translateX: { duration: 0.1, ease: "easeOut" },
          translateY: { duration: 0.1, ease: "easeOut" }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Space direction="vertical" size="large" className="text-center">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Title level={1} style={{ 
              color: 'white', 
              marginBottom: 0, 
              fontSize: '3.5rem', 
              textShadow: '0 0 20px rgba(144,39,142,0.5)',
              transform: `perspective(1000px) translateZ(10px)`, // เพิ่มความลึกเล็กน้อย
              fontWeight: 'bold',
            }}>
              Explore Projects
            </Title>
            <Title level={1} style={{ 
              color: 'white', 
              marginTop: 0, 
              fontSize: '3.5rem', 
              textShadow: '0 0 20px rgba(144,39,142,0.5)',
              transform: `perspective(1000px) translateZ(5px)`, // เพิ่มความลึกเล็กน้อย
              fontWeight: 'bold',
            }}>
              From CSI Students
            </Title>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Text style={{ 
              color: '#FFE6FF', 
              fontSize: '1.5rem', 
              display: 'block', 
              marginBottom: '1.5rem',
              textShadow: '0 0 15px rgba(255,230,255,0.3)',
            }}>
              ค้นหาโปรเจคสุดเจ๋งจากนักศึกษา CSI
            </Text>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              translateX: calculateTransform(90).translateX * 0.2, // ละเอียดอ่อนมากสำหรับช่องค้นหา
              translateY: calculateTransform(90).translateY * 0.2,
            }}
            transition={{ 
              duration: 0.5,
              translateX: { duration: 0.1, ease: "easeOut" },
              translateY: { duration: 0.1, ease: "easeOut" }
            }}
            className="w-full"
            style={{ transformStyle: 'preserve-3d', transform: `perspective(1000px) translateZ(20px)` }}
          >
            <SearchBar />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Text italic style={{ color: '#F8CDFF', fontSize: '1rem' }}>
              ค้นพบไอเดียใหม่ และผลงานที่น่าสนใจ
            </Text>
          </motion.div>
        </Space>
      </motion.div>
      
      {/* Scroll Indicator with 3D Effect - สีม่วงอ่อน */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
        initial={{ y: 0 }}
        animate={{ 
          y: [0, 10, 0],
          translateX: calculateTransform(40).translateX,
          translateY: calculateTransform(40).translateY, 
        }}
        transition={{ 
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          translateX: { duration: 0.1, ease: "easeOut" },
          translateY: { duration: 0.1, ease: "easeOut" }
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center">
          <div className="text-[#FFE6FF] text-sm mb-2">Scroll to explore</div>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L8 8L15 1" stroke="#FFE6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default Banner;