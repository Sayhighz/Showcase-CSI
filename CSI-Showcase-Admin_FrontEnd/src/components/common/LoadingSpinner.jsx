import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingSpinner = ({ 
  fullScreen = false, 
  size = 'large', 
  tip = 'กำลังโหลด...', 
  delay = 500,
  className = '',
  style = {}
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 36 : 24, color: '#90278E' }} spin />;
  
  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50"
        style={{ backdropFilter: 'blur(3px)' }}
      >
        <Spin 
          indicator={antIcon} 
          tip={tip} 
          size={size} 
          delay={delay}
          className="text-center"
        />
      </div>
    );
  }
  
  return (
    <div 
      className={`flex items-center justify-center p-8 ${className}`}
      style={style}
    >
      <Spin 
        indicator={antIcon} 
        tip={tip} 
        size={size} 
        delay={delay}
        className="text-center"
      />
    </div>
  );
};

export default LoadingSpinner;