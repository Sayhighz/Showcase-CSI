import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { MotionText } from "./MotionText";
import { ScrollReveal } from "./ScrollReveal";

export default function AnimatedWordRotate({
  words,
  duration = 3000,
  className,
  characterDelay = 50,
  animationDelay = 0,
  disabled = false,
  ...props
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Initial animation delay
  useEffect(() => {
    if (!disabled) {
      const startTimer = setTimeout(() => {
        setIsReady(true);
        setAnimationTrigger(1);
      }, animationDelay);
      return () => clearTimeout(startTimer);
    } else {
      // If disabled, still set ready for basic display
      setIsReady(true);
    }
  }, [animationDelay, disabled]);

  // Word rotation with animation trigger
  useEffect(() => {
    if (disabled || words.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      setAnimationTrigger(prev => prev + 1);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration, disabled]);

  const currentWord = words[currentIndex] || "";

  if (disabled) {
    return (
      <span className={className} {...props}>
        {currentWord}
      </span>
    );
  }

  // For debugging - let's bypass ScrollReveal temporarily and render directly
  return (
    <MotionText body={currentWord} mode="symbol" key={`word-${currentIndex}-${animationTrigger}`}>
      {(tokens) => (
        <span className={clsx(className, "inline-block")} {...props}>
          {tokens.map((token, index) => (
            <span
              key={`${currentIndex}-${index}-${animationTrigger}`}
              style={{
                transitionDelay: isReady ? `${index * characterDelay}ms` : '0ms',
              }}
              className={clsx(
                {
                  "translate-y-8 opacity-0": !isReady,
                  "translate-y-0 opacity-100": isReady,
                },
                "inline-block whitespace-pre-wrap transition-[transform,opacity] duration-500 ease-out",
              )}
            >
              {token}
            </span>
          ))}
        </span>
      )}
    </MotionText>
  );
}