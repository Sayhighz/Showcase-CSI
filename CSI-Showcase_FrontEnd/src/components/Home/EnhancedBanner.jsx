import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Typography } from 'antd';
import SearchBar from '../SearchBar/SearchBar';
import SpaceBackground from './SpaceBackground';
import BorderBeam from '../ui/magicui/border-beam';
import Particles from '../ui/magicui/particles';
import Globe from '../ui/magicui/globe';
import Meteors from '../ui/magicui/meteors';
import WordRotate from '../ui/magicui/word-rotate';
import TextReveal from '../ui/magicui/text-reveal';

// eslint-disable-next-line no-unused-vars
const _motion = motion; // Suppress eslint warning for motion usage in JSX

const { Title, Text } = Typography;

const EnhancedBanner = () => {
  const textControls = useAnimation();
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const rafId = useRef();
  const ticking = useRef(false);
  
  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 0) {
          textControls.start({
            y: -currentScrollY * 0.2, // Reduced parallax intensity for smoother performance
            opacity: Math.max(0, 1 - currentScrollY / 600),
            transition: {
              duration: 0, // Remove transition for immediate response
              ease: "linear"
            }
          });
        } else {
          textControls.start({ y: 0, opacity: 1 });
        }
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [textControls]);

  // Optimized resize handler
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);
  
  useEffect(() => {
    handleResize();
    textControls.start({ y: 0, opacity: 1 });
    
    // Use passive listeners for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial call
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [textControls, handleScroll, handleResize]);
  

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen flex flex-col items-center justify-center text-center text-white relative overflow-hidden"
      style={{ perspective: isMobile ? 'none' : '1000px' }}
    >
      {/* Enhanced Space Background */}
      <SpaceBackground isMobile={isMobile} />

      {/* Enhanced 3D Globe - Bottom center with only top half visible */}
      <div className="fixed opacity-90 z-15 will-change-transform"
           style={{
             left: '48%',
             transform: 'translateX(-50%)',
             bottom: isMobile ? '-550px' : '-900px',
           }}>
        <Globe
          size={isMobile ? 900 : 1500}
          className="performance-optimized"
        />
      </div>

      {/* MagicUI Meteors - Reduced for performance */}
      <div className="absolute inset-0 z-5 pointer-events-none will-change-transform">
        <Meteors number={isMobile ? 8 : 12} className="opacity-60" />
      </div>

      {/* Main Content - Enhanced z-index to stay above Globe */}
      <motion.div
        className="z-30 flex flex-col items-center py-8 px-6 md:px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-center w-full max-w-4xl">
          {/* MagicUI Particles Background - Optimized */}
          <Particles
            className="absolute inset-0 -z-10 will-change-transform"
            quantity={isMobile ? 20 : 35}
            ease={80}
            color="#9027be"
            refresh={false}
          />
          
          {/* Hero Text with MagicUI BorderBeam */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hero-title-container relative"
          >
            {/* CSI SHOWCASE with BorderBeam and TextReveal Effect */}
            <div className="relative inline-block mb-4 p-8 rounded-2xl overflow-visible">
              
              <TextReveal
                delay={0.2}
                duration={0.6}
                stagger={0.1}
                className="csi-main-title relative z-10 overflow-visible"
              >
                CSI  SHOWCASE
              </TextReveal>
            </div>
            
            {/* Thai Subtitle with Word Rotation and TextReveal */}
            <div className="relative overflow-visible">
              <TextReveal
                delay={0.6}
                duration={0.8}
                className="inline-block"
              >
                <WordRotate
                  className="csi-sub-title-container"
                  words={[
                    "คอมไซน์ปล่อยของ",
                    "Computer Science Initiative",
                    "นวัตกรรมเทคโนโลยี",
                    "Innovation & Technology"
                  ]}
                  duration={3000}
                  framerProps={{
                    initial: { opacity: 0, y: 20, scale: 0.8 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: -20, scale: 0.8 },
                    transition: { duration: 0.4, ease: "easeInOut" }
                  }}
                />
              </TextReveal>
            </div>
          </motion.div>
          
          {/* Enhanced SearchBar - Static */}
          <motion.div
            className="w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-full blur-lg opacity-30"
                style={{
                  background: 'linear-gradient(135deg, rgba(144,39,142,0.5), rgba(178,82,176,0.3))',
                  transform: 'scale(1.1)',
                }}
              />
              <div className="relative">
                <SearchBar />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          opacity: { duration: 0.8, delay: 1 },
          y: { duration: 0.8, delay: 1 }
        }}
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          if (window.scrollToSmooth) {
            window.scrollToSmooth(window.innerHeight);
          } else {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }
        }}
        style={{
          left: '50%',
          marginLeft: '-50px',
          width: '100px'
        }}
      >
        <div className="flex flex-col items-center justify-center w-full">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/80 text-sm mb-3 font-light tracking-wide font-ubuntu text-center"
          >
            Scroll to explore
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="flex justify-center"
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 2L10 10L18 2"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 8px rgba(255,255,255,0.3))"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Clean MagicUI Styles */}
      <style jsx>{`
        .hero-title-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          min-height: ${isMobile ? '12rem' : '16rem'};
          line-height: 1;
        }

        .csi-main-title {
          font-family: 'Ubuntu', 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: ${isMobile ? '4rem' : '6.5rem'};
          font-weight: 900;
          letter-spacing: -0.08em;
          line-height: 1.0;
          margin: 0;
          padding: 0.5rem 0;
          text-align: center;
          text-transform: uppercase;
          overflow: visible;
          
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #f8f9ff 15%,
            #e8d5ff 35%,
            #ffffff 50%,
            #f0e6ff 65%,
            #e8d5ff 85%,
            #ffffff 100%
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          
          filter: drop-shadow(0 0 20px rgba(255,255,255,0.6))
                  drop-shadow(0 0 40px rgba(144,39,142,0.4))
                  drop-shadow(0 0 80px rgba(178,82,176,0.2));
        }

        .csi-sub-title-container {
          overflow: visible !important;
          padding: 0 !important;
          margin: 0 !important;
          margin-top: -0.2rem !important;
        }

        .csi-sub-title-container h1 {
          font-family: 'Noto Sans Thai', 'Sarabun', 'Ubuntu', sans-serif;
          font-size: ${isMobile ? '2.2rem' : '3.8rem'};
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin: 0 !important;
          padding: 0.5rem 0 1rem 0;
          text-align: center;
          overflow: visible;
          
          background: linear-gradient(
            135deg,
            #e8d5ff 0%,
            #d4b3ff 20%,
            #b666ff 40%,
            #9f4fff 60%,
            #b666ff 80%,
            #e8d5ff 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          
          filter: drop-shadow(0 0 15px rgba(178,82,176,0.7))
                  drop-shadow(0 0 30px rgba(144,39,142,0.5))
                  drop-shadow(0 0 60px rgba(159,79,255,0.3));
        }

        /* Support English text in WordRotate */
        .csi-sub-title-container h1:has-text("Computer Science Initiative"),
        .csi-sub-title-container h1:has-text("Innovation & Technology") {
          font-family: 'Ubuntu', 'Inter', sans-serif;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title-container {
            min-height: 10rem;
          }
          
          .csi-main-title {
            font-size: 3.5rem;
            letter-spacing: -0.06em;
            line-height: 1.0;
            padding: 0.4rem 0;
          }
          
          .csi-sub-title-container h1 {
            font-size: 1.9rem;
            padding: 0.4rem 0 0.8rem 0;
            line-height: 1.2;
          }
          
          .csi-sub-title-container {
            margin-top: -0.2rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title-container {
            min-height: 8rem;
          }
          
          .csi-main-title {
            font-size: 2.8rem;
            letter-spacing: 0.08em;
            line-height: 1.0;
            padding: 0.3rem 0;
          }
          
          .csi-sub-title-container h1 {
            font-size: 1.6rem;
            padding: 0.3rem 0 0.6rem 0;
            line-height: 1.2;
          }
          
          .csi-sub-title-container {
            margin-top: -0.1rem;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .csi-main-title,
          .csi-sub-title {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedBanner;