import React from 'react';
import Work_Col from '../Work/Work_Col';

const RelatedProjects = ({ projects }) => {
  return (
    <div className="max-w-6xl w-full mt-16 mb-12 relative">
      {/* Space-themed decorative elements */}
      <div className="absolute -top-10 right-10 w-20 h-20 rounded-full bg-[#90278E]/5 blur-xl"></div>
      <div className="absolute -bottom-10 left-10 w-24 h-24 rounded-full bg-[#90278E]/5 blur-xl"></div>
      
      {/* Header with space theme */}
      <div className="text-center relative">
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-10 bg-[#0D0221] blur-lg opacity-30 rounded-full"></div>
        <h2 className="text-2xl font-bold text-[#90278E] relative inline-block mb-2">
          ผลงานอื่นๆ
          <span className="absolute -bottom-1 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-[#90278E] to-transparent"></span>
        </h2>
        
        <p className="text-center text-[#90278E]/60 mb-8 relative">
          <span className="relative">
            ผลงานล่าสุด
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#90278E]/20"></span>
          </span>
        </p>
      </div>
      
      {/* Space-themed wrapper for Work_Col */}
      <div className="relative">
        {/* Star-like elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 7}s`,
                opacity: Math.random() * 0.5 + 0.2
              }}
            ></div>
          ))}
        </div>
        
        {/* Custom container for the grid */}
        <div className="p-4 bg-gradient-to-b from-[#0D0221]/5 to-transparent rounded-xl">
          <Work_Col items={projects} />
        </div>
      </div>
    </div>
  );
};

export default RelatedProjects;