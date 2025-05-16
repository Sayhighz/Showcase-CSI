import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// คอมโพเนนต์สำหรับสร้างเอฟเฟกต์อนิเมชันให้กับข้อความเมื่อเลื่อนเมาส์มาถึง
const AnimatedText = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.5, 
  type = "heading", 
  staggerChildren = 0.04,
  colorScheme = 'light' // เพิ่ม prop สำหรับสีธีม
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  // ปรับเปลี่ยนธีมตาม GitHub
  const textColor = colorScheme === 'light' ? '#90278E' : 'white';
  const bgHighlight = colorScheme === 'light' 
    ? 'rgba(144, 39, 142, 0.08)'
    : 'rgba(255, 255, 255, 0.1)';

  // เลือกวาเรียนต์ของอนิเมชันตาม GitHub style
  const getVariants = () => {
    switch (type) {
      case "heading":
        return {
          hidden: { opacity: 0, y: 15 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: duration,
              delay: delay,
              ease: [0.23, 1, 0.32, 1] // GitHub-style easing
            }
          }
        };
      case "paragraph":
        return {
          hidden: { opacity: 0, y: 10 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: duration,
              delay: delay,
              ease: [0.23, 1, 0.32, 1]
            }
          }
        };
      case "badge":
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: [0.23, 1, 0.32, 1]
            }
          }
        };
      case "staggered":
        return {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: staggerChildren,
              delayChildren: delay
            }
          }
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: [0.23, 1, 0.32, 1]
            }
          }
        };
    }
  };

  // GitHub-style child variants
  const getChildVariants = () => {
    return {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
      }
    };
  };

  // ถ้าเป็นประเภท staggered ให้แยกข้อความเป็นคำ
  if (type === "staggered") {
    const words = typeof children === 'string' ? children.split(" ") : [''];
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={controls}
        variants={getVariants()}
      >
        {words.map((word, i) => (
          <motion.span 
            key={`${word}-${i}`} 
            className="inline-block mr-1"
            variants={getChildVariants()}
            style={{ 
              // GitHub-style text highlights
              backgroundColor: i % 2 === 0 ? bgHighlight : 'transparent',
              borderRadius: '3px',
              padding: i % 2 === 0 ? '0 4px' : '0',
              color: textColor
            }}
          >
            {word}{i !== words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={getVariants()}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedText;