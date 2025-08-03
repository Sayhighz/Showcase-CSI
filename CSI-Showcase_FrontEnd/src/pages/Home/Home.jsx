import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatButton } from "antd";
import { UpOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import useProject from "../../hooks/useProject";

// Import components
import Banner from "../../components/Home/Banner";
import NavigationSidebar from "../../components/Home/NavigationSidebar";
import CourseWorkSection from "../../components/Home/CourseWorkSection";
import CompetitionSection from "../../components/Home/CompetitionSection";
import AcademicSection from "../../components/Home/AcademicSection";
import ErrorMessage from "../../components/common/ErrorMessage";

const Home = () => {
  // Auth context
  const { isAuthenticated } = useAuth();

  // Local state for pagination of different project types
  const [courseWorkPage, setCourseWorkPage] = useState(1);
  const [competitionPage, setCompetitionPage] = useState(1);
  const [academicPage, setAcademicPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Use the project hook
  const { isLoading, error, fetchTopProjects } = useProject();

  // State for storing projects
  const [topProjects, setTopProjects] = useState([]);

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load top projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchTopProjects();
      setTopProjects(data || []);
    };

    loadProjects();
  }, [fetchTopProjects]);

  // Filter projects by category
  const getCourseWorkProjects = () => {
    return topProjects.filter((project) => project.category === "coursework");
  };

  const getCompetitionProjects = () => {
    return topProjects.filter((project) => project.category === "competition");
  };

  const getAcademicProjects = () => {
    return topProjects.filter((project) => project.category === "academic");
  };

  // Refs for scrolling sections
  const homeRef = useRef(null); // เพิ่ม ref สำหรับส่วน Banner/Home
  const courseWorkRef = useRef(null);
  const competitionRef = useRef(null);
  const academicRef = useRef(null);

  // เอฟเฟกต์การเลื่อนแบบ GitHub
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(0);

  // ตั้งค่า scroll event listener และดึงขนาดหน้าต่าง
  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Transform values สำหรับการเปลี่ยนผ่าน section
  const bannerOpacity = useTransform(scrollY, [0, windowHeight * 0.8], [1, 0]);

  const contentOpacity = useTransform(
    scrollY,
    [0, windowHeight * 0.5, windowHeight * 0.8],
    [0, 0.5, 1]
  );

  const contentY = useTransform(scrollY, [0, windowHeight], [100, 0]);

  // แปลงค่าสำหรับ Header ที่ปรากฏเมื่อเลื่อน
  const headerOpacity = useTransform(scrollY, [0, windowHeight * 0.3], [0, 1]);

  // Scroll to section function
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ฟังก์ชันเลื่อนไปยังส่วน Banner/Home
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // สร้างฟังก์ชันสำหรับการสร้าง stars ในพื้นหลัง - จำนวนน้อยลงสำหรับมือถือ
  const createBackgroundStars = () => {
    return Array.from({ length: isMobile ? 20 : 50 }).map((_, i) => (
      <motion.div
        key={`bg-star-${i}`}
        className="absolute rounded-full"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          backgroundColor: "white",
          opacity: Math.random() * 0.5 + 0.2,
          boxShadow: `0 0 ${Math.random() * 3 + 1}px rgba(144, 39, 142, 0.8)`,
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ));
  };

  // Show error message if needed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage
          title="ไม่สามารถโหลดข้อมูลได้"
          message={error}
          showReloadButton={true}
          onReloadClick={async () => {
            const data = await fetchTopProjects();
            setTopProjects(data || []);
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Fixed Background with Stars - GitHub Universe style */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#90278E] via-[#B252B0] to-[#5E1A5C] z-0 pointer-events-none">
        {createBackgroundStars()}
      </div>

      {/* Banner Section with Fade Effect - GitHub style */}
      <motion.div
        ref={homeRef} // เพิ่ม ref ที่ Banner section
        style={{ opacity: bannerOpacity }}
        className="w-full h-screen flex items-center justify-center fixed top-0 left-0 right-0 z-10"
      >
        <Banner />
      </motion.div>

      {/* Fixed Navigation Sidebar - GitHub style */}
      <NavigationSidebar
        scrollToSection={scrollToSection}
        refs={{
          homeRef, // ส่ง ref ของ Banner/Home ไปด้วย
          courseWorkRef,
          competitionRef,
          academicRef,
        }}
      />

      {/* Main Content Sections with GitHub-style glass morphism */}
      <motion.div
        className="relative z-30"
        style={{
          opacity: contentOpacity,
          y: contentY,
          marginTop: windowHeight * 0.9,
        }}
      >
        {/* CourseWork Section - ปรับให้มีสไตล์คล้าย GitHub */}
        <section
          ref={courseWorkRef}
          id="courseWork" // เพิ่ม id สำหรับการเชื่อมโยง
          className="relative min-h-screen"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(245, 234, 255, 0.9))",
            borderRadius: "40px 40px 0 0",
            boxShadow: "0 -10px 30px rgba(144, 39, 142, 0.2)",
          }}
        >
          <div className="container mx-auto px-4">
            <CourseWorkSection
              loading={isLoading}
              courseWorkProjects={getCourseWorkProjects()}
              courseWorkPage={courseWorkPage}
              setCourseWorkPage={setCourseWorkPage}
              scrollToSection={scrollToSection}
              competitionRef={competitionRef}
            />
          </div>
        </section>

        {/* Competition Section - ปรับให้มีสไตล์คล้าย GitHub */}
        <section
          ref={competitionRef}
          id="competition" // เพิ่ม id สำหรับการเชื่อมโยง
          className="relative min-h-screen py-8 md:py-16"
          style={{
            background:
              "linear-gradient(to bottom, rgba(245, 234, 255, 0.9), rgba(224, 209, 255, 0.9))",
          }}
        >
          <div className="container mx-auto px-4">
            <CompetitionSection
              loading={isLoading}
              competitionProjects={getCompetitionProjects()}
              competitionPage={competitionPage}
              setCompetitionPage={setCompetitionPage}
              scrollToSection={scrollToSection}
              academicRef={academicRef}
            />
          </div>
        </section>

        {/* Academic Section - ปรับให้มีสไตล์คล้าย GitHub */}
        <section
          ref={academicRef}
          id="academic" // เพิ่ม id สำหรับการเชื่อมโยง
          className="relative min-h-screen py-8 md:py-16"
          style={{
            background:
              "linear-gradient(to bottom, rgba(224, 209, 255, 0.9), rgba(144, 39, 142, 0.9))",
          }}
        >
          <div className="container mx-auto px-4">
            <AcademicSection
              loading={isLoading}
              academicProjects={getAcademicProjects()}
              academicPage={academicPage}
              setAcademicPage={setAcademicPage}
            />
          </div>
        </section>
      </motion.div>

      {/* Back to Top Button - GitHub style */}
      <FloatButton.BackTop
        style={{
          width: 48,
          height: 48,
          backgroundColor: "#90278E",
          color: "white",
        }}
        onClick={scrollToTop}
      />
    </div>
  );
};

export default Home;
