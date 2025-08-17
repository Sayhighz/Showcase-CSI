import React from "react";
import { cn } from "../../../lib/utils";

// eslint-disable-next-line no-unused-vars
const _React = React; // Suppress eslint warning for React usage in JSX

const Meteors = ({ number = 20, className, ...props }) => {
  const meteors = new Array(Math.min(number, 15)).fill(true); // Limit maximum meteors

  return (
    <div className={cn("will-change-transform performance-optimized", className)} {...props}>
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[315deg] will-change-transform",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent"
          )}
          style={{
            top: 0,
            left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (12 - 4) + 4) + "s", // Slower animations
            willChange: 'transform',
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        ></span>
      ))}
    </div>
  );
};

export default Meteors;