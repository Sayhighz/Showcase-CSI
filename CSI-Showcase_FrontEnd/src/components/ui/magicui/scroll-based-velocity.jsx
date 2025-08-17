import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../../../lib/utils";

// eslint-disable-next-line no-unused-vars
const _motion = motion; // Suppress eslint warning for motion usage in JSX

const ScrollBasedVelocity = ({
  children,
  className = "",
  velocity = 100,
  direction = "horizontal", // "horizontal" or "vertical"
  ...props
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform based on direction
  const xTransform = useTransform(scrollYProgress, [0, 1], [-velocity, velocity]);
  const yTransform = useTransform(scrollYProgress, [0, 1], [-velocity, velocity]);
  
  const x = direction === "horizontal" ? xTransform : 0;
  const y = direction === "vertical" ? yTransform : 0;

  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      ref={ref}
      style={{ x, y, opacity }}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollBasedVelocity;