import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef();

  useEffect(() => {
    // Initialize Lenis with optimized settings
    lenisRef.current = new Lenis({
      duration: 1.2, // Smooth scroll duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      normalizeWheel: true,
      infinite: false,
    });

    // Expose Lenis controls globally for hover-based interactions (e.g. pause on marquee hover)
    // Safe-guard with optional chaining in callers.
    window.__lenis = lenisRef.current;
    window.lenisStop = () => {
      try {
        lenisRef.current?.stop();
      } catch {
        /* no-op */
      }
    };
    window.lenisStart = () => {
      try {
        lenisRef.current?.start();
      } catch {
        /* no-op */
      }
    };

    // Animation frame loop for Lenis
    function raf(time) {
      lenisRef.current.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      // Remove globals to avoid leaks
      delete window.lenisStop;
      delete window.lenisStart;
      delete window.__lenis;
    };
  }, []);

  // Enable/disable scroll programmatically
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    // Custom scroll to function for smooth navigation
    window.scrollToSmooth = (target, options = {}) => {
      lenis.scrollTo(target, {
        duration: options.duration || 1.2,
        easing: options.easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
        ...options,
      });
    };

    return () => {
      delete window.scrollToSmooth;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;