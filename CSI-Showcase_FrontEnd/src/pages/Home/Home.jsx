import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Banner from '../../components/Home/Banner';
import Work_Col from '../../components/Work/Work_Col';
import Work_Row from '../../components/Work/Work_Row';
import { axiosGet } from '../../lib/axios';  // นำเข้า axiosGet ที่คุณได้เพิ่มไว้

const Home = () => {
  const [items, setItems] = useState([]);  // สถานะเก็บข้อมูลที่ดึงจาก API สำหรับผลงานล่าสุด
  const [top9Items, setTop9Items] = useState([]);  // สถานะเก็บข้อมูลที่ดึงจาก API สำหรับ top 9 most viewed
  const workControls = useAnimation();
  const bannerControls = useAnimation();
  const [scrollY, setScrollY] = useState(0);
  const [bannerOpacity, setBannerOpacity] = useState(1);

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลโครงการจาก API
    const fetchProjects = async () => {
      try {
        // เรียกใช้ API เพื่อดึงข้อมูลผลงานล่าสุด
        const projectsData = await axiosGet('/projects/latest');
        setItems(projectsData);  // เก็บข้อมูลผลงานล่าสุดใน items

        // เรียกใช้ API เพื่อดึงข้อมูล top 9 most viewed projects
        const top9Data = await axiosGet('/projects/top9');
        setTop9Items(top9Data);  // เก็บข้อมูล top 9 most viewed projects ใน top9Items
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };

    fetchProjects();  // เรียกฟังก์ชันเมื่อ component ถูกโหลด

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
        className="relative flex flex-col items-center justify-center min-h-screen pt-[5vh] bg-white"
      >
        <div className="container max-w-screen-xl mx-auto px-6">
          {/* แสดงผลงานยอดนิยม (Top 9 Most Viewed) */}
          <Work_Col title="ผลงานยอดนิยม" items={top9Items} side="center" description="ผลงานที่ได้รับความนิยมสูงสุด" />

          <div className="min-h-screen">
            {/* แสดงผลงานล่าสุด */}
            <Work_Row title="ผลงานล่าสุด" items={items} side="left" description="ผลงานล่าสุด" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
