import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { colors } from '../../config/themeConfig';

const LoadingSpinner = ({
  fullScreen = false,
  size = 'large',
  tip = 'กำลังโหลด...',
  delay = 500,
  className = '',
  style = {}
}) => {
  const iconSize = size === 'large' ? 40 : size === 'small' ? 20 : 28;
  
  // Enhanced loading icon with gradient effect
  const antIcon = (
    <div className="relative">
      <LoadingOutlined
        style={{
          fontSize: iconSize,
          background: colors.primaryGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        spin
      />
      {/* Glow effect */}
      <div
        className="absolute inset-0 blur-sm opacity-30"
        style={{
          background: colors.primaryGradient,
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }}
      />
    </div>
  );
  
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-50 performance-optimized"
        style={{
          background: `linear-gradient(135deg, ${colors.lightBackground}90 0%, rgba(255, 255, 255, 0.95) 100%)`,
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, ${colors.primary} 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Loading content */}
        <div className="relative z-10 text-center">
          <Spin
            indicator={antIcon}
            size={size}
            delay={delay}
            className="block mb-6"
          />
          <div
            className="text-lg font-sukhumvit font-medium px-6 py-2 rounded-full border"
            style={{
              color: colors.primary,
              background: `linear-gradient(45deg, ${colors.primary}10, ${colors.secondary}10)`,
              border: `1px solid ${colors.primary}20`,
              boxShadow: `0 4px 15px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.1)`
            }}
          >
            {tip}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
      style={style}
    >
      <Spin
        indicator={antIcon}
        size={size}
        delay={delay}
        className="block mb-4"
      />
      <div
        className="text-base font-sukhumvit"
        style={{ color: colors.primary }}
      >
        {tip}
      </div>
    </div>
  );
};

export default LoadingSpinner;