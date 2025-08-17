import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "../../../lib/utils";

// eslint-disable-next-line no-unused-vars
const _motion = motion; // Suppress eslint warning for motion usage in JSX

const TextReveal = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.8,
  stagger = 0.1,
  ...props 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (typeof children === 'string') {
      setWords(children.split(' '));
    }
  }, [children]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: stagger,
        delayChildren: delay + 0.2,
      }
    }
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    }
  };

  // If children is not a string, render as is with simple fade in
  if (typeof children !== 'string') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration, delay }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn("text-reveal", className)}
      {...props}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block mr-2"
          style={{ transformOrigin: "bottom" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default TextReveal;