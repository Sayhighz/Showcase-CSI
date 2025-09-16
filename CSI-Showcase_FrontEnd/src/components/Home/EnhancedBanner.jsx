import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../SearchBar/SearchBar';
import WordRotate from '../ui/magicui/word-rotate';
import TextReveal from '../ui/magicui/text-reveal';
import { Sparkles } from '../ui/lunarui/Sparkles';

// eslint-disable-next-line no-unused-vars
const _motion = motion;


const MAIN_TITLE = 'CSI  SHOWCASE';
const EnhancedBanner = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedEffects, setReducedEffects] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth <= 768);
    updateIsMobile();

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReduced = () => {
      const deviceMemory = (navigator && 'deviceMemory' in navigator) ? navigator.deviceMemory : 8;
      setReducedEffects(media.matches || isMobile || deviceMemory <= 4);
    };

    updateReduced();

    window.addEventListener('resize', updateIsMobile, { passive: true });
    media.addEventListener?.('change', updateReduced);

    return () => {
      window.removeEventListener('resize', updateIsMobile);
      media.removeEventListener?.('change', updateReduced);
    };
  }, [isMobile]);

  // Typewriter effect for main title (first visit per session)
  useEffect(() => {
    const KEY = 'csiBannerTypeDone';
    const full = MAIN_TITLE;

    if (typeof window === 'undefined') {
      setTypedTitle(full);
      setShowCursor(false);
      return;
    }

    const alreadyDone = sessionStorage.getItem(KEY) === '1';
    const shouldType = !reducedEffects && !alreadyDone;

    if (!shouldType) {
      setTypedTitle(full);
      setShowCursor(false);
      return;
    }

    setTypedTitle('');
    setShowCursor(true);

    let i = 0;
    const speed = isMobile ? 85 : 65;
    const startDelay = 400;

    let intervalId;
    const start = () => {
      intervalId = setInterval(() => {
        i += 1;
        setTypedTitle(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(intervalId);
          sessionStorage.setItem(KEY, '1');
          setTimeout(() => setShowCursor(false), 800);
        }
      }, speed);
    };

    const delayId = setTimeout(start, startDelay);

    return () => {
      clearInterval(intervalId);
      clearTimeout(delayId);
    };
  }, [reducedEffects, isMobile]);
  
  // Background effects handled at the hero/section seam

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center text-center text-white relative overflow-hidden"
      style={{ perspective: isMobile ? 'none' : '1000px' }}
    >
      {/* Sparkles seam visible within hero viewport (half-circle background) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 sm:h-72 md:h-80 lg:h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent_80%)] before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#8350e8,transparent_70%)] before:opacity-40 after:content-[''] after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[100%] after:border-t after:border-[#7876c566] after:bg-zinc-900"
        style={{ bottom: '-4vh' }}
      >
        <Sparkles
          density={reducedEffects ? 500 : 1200}
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </div>

      {/* Main Content - Enhanced z-index above background */}
      <motion.div
        className="z-30 flex flex-col items-center py-8 px-6 md:px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-center w-full max-w-4xl">
          
          {/* Hero Text with MagicUI BorderBeam */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hero-title-container relative"
          >
            {/* CSI SHOWCASE gradient typography */}
            <h1
              className="mb-6 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-wider uppercase bg-gradient-to-r from-white via-[#e8d5ff] to-white bg-clip-text text-transparent"
              aria-label="CSI Showcase"
            >
              {typedTitle}
              {!reducedEffects && showCursor && (
                <span className="typewriter-cursor">|</span>
              )}
            </h1>
            
            {/* Thai Subtitle with gradient typography only */}
            <TextReveal
              delay={0.6}
              duration={0.8}
              className="inline-block"
            >
              <WordRotate
                className="mx-auto inline-block bg-gradient-to-r from-white via-[#e8d5ff] to-white bg-clip-text text-transparent text-xl md:text-3xl lg:text-4xl font-semibold tracking-tight"
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
      
      {/* Enhanced Scroll Indicator (disabled on reduced effects devices) */}
      {!reducedEffects && (
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
      )}
      
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
          letter-spacing: 0.06em;
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
            letter-spacing: 0.04em;
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
            letter-spacing: 0.12em;
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

        /* Typewriter cursor */
        .typewriter-cursor {
          display: inline-block;
          margin-left: 2px;
          font-weight: 900;
          color: rgba(255,255,255,0.85);
          text-shadow:
            0 0 10px rgba(255,255,255,0.7),
            0 0 20px rgba(178,82,176,0.6);
          animation: cursor-blink 1s steps(2, start) infinite;
        }

        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
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