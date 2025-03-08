import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Banner from '../../components/Home/Banner';
import Work_Col from '../../components/Work/Work_Col';
import Work_Row from '../../components/Work/Work_Row';

const Home = () => {
  const items = [
    { title: 'ระบบถังดับเพลิง', description: 'รายละเอียดของระบบถังดับเพลิง', image: '/path/to/image1.jpg', projectLink: '/projects/1' },
    { title: 'ระบบจัดการข้อมูล', description: 'ระบบสำหรับจัดการข้อมูลผู้ใช้', image: '/path/to/image2.jpg', projectLink: '/projects/2' },
    { title: 'ระบบติดตามการทำงาน', description: 'ระบบสำหรับติดตามความคืบหน้าของงาน', image: '/path/to/image3.jpg', projectLink: '/projects/3' },
    { title: 'ระบบตรวจสอบความปลอดภัย', description: 'ระบบที่ช่วยในการตรวจสอบความปลอดภัย', image: '/path/to/image4.jpg', projectLink: '/projects/4' },
    { title: 'ระบบจัดการพนักงาน', description: 'ระบบสำหรับจัดการข้อมูลพนักงาน', image: '/path/to/image5.jpg', projectLink: '/projects/5' },
    { title: 'ระบบการเงิน', description: 'ระบบสำหรับการจัดการการเงิน', image: '/path/to/image6.jpg', projectLink: '/projects/6' },
    { title: 'ระบบติดตามผลการศึกษา', description: 'ระบบที่ช่วยติดตามผลการเรียนของนักเรียน', image: '/path/to/image7.jpg', projectLink: '/projects/7' },
    { title: 'ระบบการขนส่ง', description: 'ระบบที่ช่วยในการจัดการการขนส่งสินค้า', image: '/path/to/image8.jpg', projectLink: '/projects/8' },
    { title: 'ระบบการจัดการห้องประชุม', description: 'ระบบสำหรับจัดการการจองห้องประชุม', image: '/path/to/image9.jpg', projectLink: '/projects/9' },
    { title: 'ระบบจัดการอุปกรณ์', description: 'ระบบที่ช่วยในการจัดการอุปกรณ์ต่างๆ', image: '/path/to/image10.jpg', projectLink: '/projects/10' }
  ];

  const workControls = useAnimation();
  const bannerControls = useAnimation();
  const [scrollY, setScrollY] = useState(0);
  const [bannerOpacity, setBannerOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const newOpacity = Math.max(1 - window.scrollY / 300, 0);
      setBannerOpacity(newOpacity); // ใช้เก็บค่า opacity เพื่อตรวจสอบ pointer-events

      const workOpacity = Math.min(window.scrollY / 300, 1); // Fade in Work Components
      const translateY = Math.max(50 - (window.scrollY / 5), 0); // เลื่อนขึ้น

      bannerControls.start({ opacity: newOpacity });
      workControls.start({ opacity: workOpacity, y: translateY });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bannerControls, workControls]);

  return (
    <div className="relative min-h-screen">
      {/* Banner ที่ค่อยๆ fade แต่ยังรับ input ได้ */}
      <motion.div
        animate={bannerControls}
        initial={{ opacity: 1, y: 0 }}
        className="w-full h-[100vh] flex items-center justify-center"
        style={{ pointerEvents: bannerOpacity > 0.1 ? "auto" : "none" }} // ป้องกัน input หาย
      >
        <Banner />
      </motion.div>

      {/* Work Components ค่อยๆ fade ขึ้นมาทับ Banner */}
      <motion.div
        animate={workControls}
        initial={{ opacity: 0, y: 50 }}
        className="relative flex flex-col items-center justify-center min-h-screen pt-[5vh] 1bg-white"
      >
        <div className="container max-w-screen-xl mx-auto px-6">
          <Work_Col title="ผลงานยอดนิยม" items={items} side="center" description="ผลงานที่น่าสนใจ" />
          <div className="min-h-screen">
            <Work_Row title="ผลงานล่าสุด" items={items} side="left" description="ผลงานล่าสุด" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
