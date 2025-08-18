import React from 'react';

const SpaceBackground = ({ isMobile = false, className = "" }) => {
  // Optimized: static, GPU-friendly gradient only (no per-frame JS animations)
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        background: 'linear-gradient(180deg, #0a0014 0%, #1a0526 25%, #90278E 100%)',
        pointerEvents: 'none',
        contain: 'layout paint',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      }}
    />
  );
};

export default SpaceBackground;