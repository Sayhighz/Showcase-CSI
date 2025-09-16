import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatButton } from "antd";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";
import useProject from "../../hooks/useProject";
import { useNavigate } from "react-router-dom";

// Import components
import EnhancedBanner from "../../components/Home/EnhancedBanner";
import NavigationSidebar from "../../components/Home/NavigationSidebar";
import EnhancedProjectSection from "../../components/Home/EnhancedProjectSection";
import MarqueeProjects from "../../components/Home/MarqueeProjects";
import SpaceBackground from "../../components/Home/SpaceBackground";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ScrollReveal } from "../../components/ui/ScrollReveal";
import { BulbOutlined, TrophyOutlined, ReadOutlined } from "@ant-design/icons";



// Import CSS
import "./Home.css";
// eslint-disable-next-line no-unused-vars
const _motion = motion; // Suppress eslint warning for motion usage in JSX

const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Local state for pagination and mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Use the project hook
  const { isLoading, fetchTopProjects } = useProject();

  // State for storing projects
  const [topProjects, setTopProjects] = useState([]);

  // Check screen size
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
  
  // Marquee data (Option A): pick up to 4 per type, then flatten in order
  const marqueeProjects = useMemo(() => {
    const cw = getCourseWorkProjects().slice(0, 4);
    const comp = getCompetitionProjects().slice(0, 4);
    const acad = getAcademicProjects().slice(0, 4);
    return [...cw, ...comp, ...acad];
  }, [topProjects]);

  // Refs for scrolling sections
  const homeRef = useRef(null);
  const courseWorkRef = useRef(null);
  const competitionRef = useRef(null);
  const academicRef = useRef(null);

  // Scroll effects
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Minimal animation for maximum smoothness
  const bannerOpacity = useTransform(
    scrollY,
    [0, windowHeight * 0.5],
    [1, 0.1],
    { clamp: true }
  );
  // Remove contentOpacity and contentY transforms for smoother scroll

  // Optimized scroll to section function
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      if (window.scrollToSmooth) {
        window.scrollToSmooth(ref.current);
      } else {
        ref.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Navigation handlers
  const handleViewAllCourseWork = () => {
    navigate("/projects/coursework");
  };

  const handleViewAllCompetition = () => {
    navigate("/projects/competition");
  };

  const handleViewAllAcademic = () => {
    navigate("/projects/academic");
  };

  // Continue rendering even if there's an error - show empty projects instead

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-container">
      {/* Enhanced Space Background - Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none will-change-transform space-background-container">
        <SpaceBackground isMobile={isMobile} />
      </div>

      {/* Enhanced Banner Section - Minimal Animation */}
      <motion.div
        ref={homeRef}
        style={{ opacity: bannerOpacity, willChange: 'opacity' }}
        className="w-full h-screen flex items-center justify-center fixed top-0 left-0 right-0 z-10"
        initial={false}
      >
        <EnhancedBanner />
      </motion.div>

      {/* Main Content Sections - No Animation */}
      <div
        className="relative z-30"
        style={{
          marginTop: windowHeight,
          paddingTop: '4rem',
        }}
      >

        {/* Marquee Projects - Under Hero, above first section */}
        <section className="mx-0 md:mx-4 lg:mx-8 xl:mx-12">
          <MarqueeProjects
            projects={marqueeProjects}
            sectionColor="#90278E"
            accentColor="#B252B0"
            className="my-2 md:my-4"
          />
        </section>
        {/* CourseWork Section */}
        <ScrollReveal offset={100} once={true} className="mx-4 md:mx-8 lg:mx-12 xl:mx-16 [--duration:600ms]">
          {(isActive) => (
            <section
              ref={courseWorkRef}
              id="courseWork"
              className={clsx(
                { "translate-y-12 opacity-0": !isActive },
                "transition-[transform,opacity] duration-[--duration] ease-out"
              )}
            >
              <EnhancedProjectSection
                title="ผลงานวิชาเรียน"
                subtitle="ผลงานที่เป็นส่วนหนึ่งของรายวิชาในหลักสูตร CSI มีทั้งโปรเจคเดี่ยวและโปรเจคกลุ่มที่นักศึกษาได้สร้างสรรค์ขึ้น"
                icon={<BulbOutlined />}
                projects={getCourseWorkProjects()}
                loading={isLoading}
                sectionColor="#90278E"
                accentColor="#B252B0"
                backgroundStyle={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 234, 255, 0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "40px 40px 0 0",
                  boxShadow: "0 -20px 50px rgba(144, 39, 142, 0.1), 0 10px 30px rgba(144, 39, 142, 0.05)",
                  marginTop: "2rem",
                  border: "1px solid rgba(144, 39, 142, 0.1)",
                }}
                onViewAll={handleViewAllCourseWork}
                maxDisplay={3}
              />
            </section>
          )}
        </ScrollReveal>

        {/* Competition Section */}
        <ScrollReveal offset={100} once={true} className="mx-4 md:mx-8 lg:mx-12 xl:mx-16 my-8 [--duration:700ms]">
          {(isActive) => (
            <section
              ref={competitionRef}
              id="competition"
              className={clsx(
                { "translate-y-12 opacity-0": !isActive },
                "transition-[transform,opacity] duration-[--duration] ease-out delay-100"
              )}
            >
              <EnhancedProjectSection
                title="ผลงานการแข่งขัน"
                subtitle="ผลงานจากการแข่งขันทั้งในระดับมหาวิทยาลัยและระดับประเทศที่นักศึกษา CSI ได้มีโอกาสเข้าร่วมและได้รับรางวัล"
                icon={<TrophyOutlined />}
                projects={getCompetitionProjects()}
                loading={isLoading}
                sectionColor="#B252B0"
                accentColor="#90278E"
                backgroundStyle={{
                  background: "linear-gradient(135deg, rgba(245, 234, 255, 0.9) 0%, rgba(224, 209, 255, 0.95) 100%)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(178, 82, 176, 0.15), 0 5px 20px rgba(144, 39, 142, 0.1)",
                  border: "1px solid rgba(178, 82, 176, 0.1)",
                }}
                onViewAll={handleViewAllCompetition}
                maxDisplay={3}
              />
            </section>
          )}
        </ScrollReveal>

        {/* Academic Section */}
        <ScrollReveal offset={100} once={true} className="mx-4 md:mx-8 lg:mx-12 xl:mx-16 my-8 [--duration:800ms]">
          {(isActive) => (
            <section
              ref={academicRef}
              id="academic"
              className={clsx(
                { "translate-y-12 opacity-0": !isActive },
                "transition-[transform,opacity] duration-[--duration] ease-out delay-200"
              )}
            >
              <EnhancedProjectSection
                title="ผลงานวิชาการ"
                subtitle="ผลงานวิจัยและบทความวิชาการจากนักศึกษา CSI ที่ได้รับการตีพิมพ์และเผยแพร่ในวารสารและงานประชุมวิชาการต่างๆ"
                icon={<ReadOutlined />}
                projects={getAcademicProjects()}
                loading={isLoading}
                sectionColor="#5E1A5C"
                accentColor="#90278E"
                backgroundStyle={{
                  background: "linear-gradient(135deg, rgba(224, 209, 255, 0.95) 0%, rgba(144, 39, 142, 0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  color: "white",
                  borderRadius: "20px 20px 40px 40px",
                  boxShadow: "0 15px 50px rgba(94, 26, 92, 0.2), 0 10px 30px rgba(144, 39, 142, 0.15)",
                  border: "1px solid rgba(144, 39, 142, 0.2)",
                }}
                onViewAll={handleViewAllAcademic}
                maxDisplay={3}
              />
            </section>
          )}
        </ScrollReveal>

        {/* Footer Space */}
        <div className="h-32 bg-gradient-to-b from-transparent to-[#90278E]/20" />
      </div>

      {/* Enhanced Back to Top Button - Optimized */}
      <FloatButton.BackTop
        style={{
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, #90278E, #B252B0)",
          border: "none",
          boxShadow: "0 8px 25px rgba(144, 39, 142, 0.3)",
        }}
        onClick={() => {
          if (window.scrollToSmooth) {
            window.scrollToSmooth(0);
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      />
    </div>
  );
};

export default Home;

