import React, { useState, useEffect, useRef, useMemo } from 'react';

export function TextLoop({
  children,
  interval = 3000,
  delay = 0,
  adjustingSpeed = 150,
  fade = true,
  mode = "word",
  className = '',
  ...props
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Convert children to array and get current text
  const texts = useMemo(() => {
    const items = React.Children.toArray(children);
    return items.map(child => {
      if (typeof child === 'string') return child;
      if (React.isValidElement(child) && typeof child.props.children === 'string') {
        return child.props.children;
      }
      return '';
    }).filter(Boolean);
  }, [children]);

  // Get current text and tokenize it based on mode
  const { currentText, tokens } = useMemo(() => {
    const text = texts[currentIndex] || '';
    let processedTokens = [];
    
    if (mode === "symbol") {
      processedTokens = text.trim().split('');
    } else {
      processedTokens = text.trim().match(/\S+|\s+/g) || [];
    }
    
    return {
      currentText: text,
      tokens: processedTokens
    };
  }, [texts, currentIndex, mode]);
  
  useEffect(() => {
    if (texts.length <= 1) return;
    
    // Start the loop after initial delay
    timeoutRef.current = setTimeout(() => {
      startLoop();
    }, delay);
    
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [texts.length, delay, interval]);
  
  const startLoop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setIsAnimating(false);
      }, adjustingSpeed);
    }, interval);
  };
  
  if (texts.length === 0) return null;
  if (texts.length === 1) {
    // If only one item, behave like MotionText
    return (
      <span className={className} {...props}>
        {typeof children === "function" ? children(tokens) : children}
      </span>
    );
  }
  
  const containerStyle = {
    display: 'inline-block',
    position: 'relative',
    verticalAlign: 'top',
    transition: fade ? `opacity ${adjustingSpeed}ms ease-in-out` : 'none',
    opacity: isAnimating && fade ? 0 : 1
  };
  
  return (
    <span
      className={`text-loop ${className}`}
      style={containerStyle}
      {...props}
    >
      {typeof children === "function" ? children(tokens) : (
        <span>{currentText}</span>
      )}
    </span>
  );
}

export default TextLoop;