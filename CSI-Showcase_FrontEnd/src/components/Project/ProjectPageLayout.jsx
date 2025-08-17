import React from 'react';

const ProjectPageLayout = ({ 
  children, 
  themeColors, 
  backgroundComponent,
  className = ""
}) => {
  return (
    <div 
      className={`flex flex-col items-center w-full py-8 md:py-16 lg:py-20 px-3 sm:px-4 min-h-screen relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${themeColors.lightBackground} 0%, white ${themeColors.gradientMid || '40%'}, ${themeColors.mediumBackground}${themeColors.gradientOpacity || '30'} 100%)`
      }}
    >
      {backgroundComponent && backgroundComponent}
      
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

export default ProjectPageLayout;