import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";

// eslint-disable-next-line no-unused-vars
const _motion = motion; // Suppress eslint warning for motion usage in JSX

const WordRotate = ({
  words = [],
  className = "",
  duration = 2500,
  framerProps = {},
  ...props
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  const defaultFramerProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
    ...framerProps,
  };

  if (words.length === 0) return null;

  return (
    <div className={cn("overflow-hidden py-2", className)} {...props}>
      <AnimatePresence mode="wait">
        <motion.h1
          key={words[index]}
          className="font-display text-center font-bold"
          {...defaultFramerProps}
        >
          {words[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};

export default WordRotate;