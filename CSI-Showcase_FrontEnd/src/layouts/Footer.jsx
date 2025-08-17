import React from 'react';

const Footer = () => {
  return (
    <footer 
      className="relative py-6 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(144, 39, 142, 0.95) 0%, rgba(94, 26, 92, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Subtle decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 right-10 w-16 h-16 rounded-full opacity-5 blur-xl bg-white" />
        <div className="absolute bottom-2 left-10 w-12 h-12 rounded-full opacity-8 blur-lg bg-white" />
      </div>

      <div className="relative z-10">
        <p className="text-white/90 text-sm sm:text-base font-light">
          © 2025 CSI Showcase. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;