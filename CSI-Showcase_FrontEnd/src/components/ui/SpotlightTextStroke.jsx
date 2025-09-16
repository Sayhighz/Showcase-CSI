import React, { useRef, useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import { MotionText } from "./MotionText";

/**
 * SpotlightTextStroke
 * Applies a localized dynamically colored stroke around text based on pointer position,
 * similar to SpotlightCard but for text with spotlight effect.
 */
export default function SpotlightTextStroke({
  children,
  className,
  hsl = true,
  hslMin = 200,
  hslMax = 320,
  strokeWidth = 2,
  spotlightSize = 200,
  disabled = false,
  shadowGlow = true,
  animated = false,
  animationDelay = 0,
  characterDelay = 50,
  ...props
}) {
  const container = useRef(null);
  const [isHovering] = useState(true); // Always active
  const [isAnimated, setIsAnimated] = useState(false);
  const [autoSpotlight, setAutoSpotlight] = useState({ x: 50, y: 50 }); // Center position

  // Auto animate spotlight
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSpotlight(prev => ({
        x: (prev.x + 2) % 100, // Move horizontally
        y: 50 + Math.sin(Date.now() / 2000) * 30 // Oscillate vertically
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const { strokeColor, shadowColor } = useMemo(() => {
    if (disabled) {
      return {
        strokeColor: "rgba(255,255,255,0.85)",
        shadowColor: "rgba(255,255,255,0.45)",
      };
    }

    if (hsl) {
      const margin = hslMax - hslMin;
      const rate = (autoSpotlight.y + autoSpotlight.x) / 100; // Use auto position
      const hue = Math.round(margin * rate + hslMin);
      return {
        strokeColor: `hsl(${hue} 80% 70%)`,
        shadowColor: `hsl(${hue} 80% 70% / 0.5)`,
      };
    }

    return {
      strokeColor: "rgba(255,255,255,0.9)",
      shadowColor: "rgba(255,255,255,0.45)",
    };
  }, [disabled, hsl, hslMin, hslMax, autoSpotlight]);

  const fillColor = isHovering ? "rgba(255,255,255,0.95)" : "rgba(240,240,240,0.9)";

  // Animation trigger
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setIsAnimated(true);
      }, animationDelay);
      return () => clearTimeout(timer);
    }
  }, [animated, animationDelay]);

  if (React.isValidElement(children) && animated) {
    const textContent = typeof children.props.children === 'string'
      ? children.props.children
      : children.props.children?.join?.('') || '';

    return (
      <span
        ref={container}
        className={clsx("relative inline-block pointer-events-auto", className)}
        style={{
          "--x": `${autoSpotlight.x}%`,
          "--y": `${autoSpotlight.y}%`,
          "--spotlight-size": `${spotlightSize}px`,
          "--stroke-color": strokeColor,
          "--shadow-color": shadowColor,
          "--stroke-width": `${strokeWidth}px`,
        }}
        {...props}
      >
        {/* Animated base text */}
        <MotionText body={textContent} mode="symbol">
          {(tokens) => (
            <span
              className={children.props.className}
              style={{
                ...(children.props.style || {}),
                color: fillColor,
                transition: "color 0.3s ease",
              }}
            >
              {tokens.map((token, index) => (
                <span
                  key={index}
                  style={{
                    "--delay": `${index * characterDelay}ms`,
                  }}
                  className={clsx(
                    {
                      "translate-y-8 opacity-0": !isAnimated,
                      "delay-[--delay]": isAnimated,
                    },
                    "inline-block whitespace-pre-wrap transition-[transform,opacity] duration-300 ease-out"
                  )}
                >
                  {token}
                </span>
              ))}
            </span>
          )}
        </MotionText>
        
        {/* Animated spotlight stroke overlay */}
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
            WebkitTextFillColor: "transparent",
            color: "transparent",
            textShadow: shadowGlow ? `0 0 12px ${shadowColor}, 0 0 36px ${shadowColor}` : "none",
            mask: `radial-gradient(var(--spotlight-size) circle at var(--x) var(--y), white, transparent 70%)`,
            WebkitMask: `radial-gradient(var(--spotlight-size) circle at var(--x) var(--y), white, transparent 70%)`,
          }}
        >
          <MotionText body={textContent} mode="symbol">
            {(tokens) => (
              <span
                className={children.props.className}
                style={{
                  ...(children.props.style || {}),
                  color: "transparent",
                }}
              >
                {tokens.map((token, index) => (
                  <span
                    key={index}
                    style={{
                      "--delay": `${index * characterDelay}ms`,
                    }}
                    className={clsx(
                      {
                        "translate-y-8 opacity-0": !isAnimated,
                        "delay-[--delay]": isAnimated,
                      },
                      "inline-block whitespace-pre-wrap transition-[transform,opacity] duration-300 ease-out"
                    )}
                  >
                    {token}
                  </span>
                ))}
              </span>
            )}
          </MotionText>
        </span>
      </span>
    );
  }

  if (React.isValidElement(children)) {
    return (
      <span
        ref={container}
        className={clsx("relative inline-block pointer-events-auto", className)}
        style={{
          "--x": `${autoSpotlight.x}%`,
          "--y": `${autoSpotlight.y}%`,
          "--spotlight-size": `${spotlightSize}px`,
          "--stroke-color": strokeColor,
          "--shadow-color": shadowColor,
          "--stroke-width": `${strokeWidth}px`,
        }}
        {...props}
      >
        {/* Base text without stroke */}
        {React.cloneElement(children, {
          style: {
            ...(children.props.style || {}),
            color: fillColor,
            transition: "color 0.3s ease",
          },
        })}

        {/* Spotlight stroke overlay */}
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
            WebkitTextFillColor: "transparent",
            color: "transparent",
            textShadow: shadowGlow ? `0 0 12px ${shadowColor}, 0 0 36px ${shadowColor}` : "none",
            mask: `radial-gradient(var(--spotlight-size) circle at var(--x) var(--y), white, transparent 70%)`,
            WebkitMask: `radial-gradient(var(--spotlight-size) circle at var(--x) var(--y), white, transparent 70%)`,
          }}
        >
          {React.cloneElement(children, {
            style: {
              ...(children.props.style || {}),
              color: "transparent",
            },
          })}
        </span>
      </span>
    );
  }

  return (
    <span
      ref={container}
      className={clsx("relative inline-block pointer-events-auto", className)}
      style={{
        "--x": `${autoSpotlight.x}%`,
        "--y": `${autoSpotlight.y}%`,
        "--spotlight-size": `${spotlightSize}px`,
        "--stroke-color": strokeColor,
        "--shadow-color": shadowColor,
        "--stroke-width": `${strokeWidth}px`,
        color: fillColor,
        transition: "color 0.3s ease",
      }}
      {...props}
    >
      {children}

      {/* Spotlight stroke overlay */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
          WebkitTextFillColor: "transparent",
          color: "transparent",
          textShadow: shadowGlow ? `0 0 12px ${shadowColor}, 0 0 36px ${shadowColor}` : "none",
          mask: `radial-gradient(var(--spotlight-size) circle at var(--x) var(--y), white, transparent 70%)`,
          WebkitMask: `radial-gradient(var(--spotlight-size) circle at var(--x) var(--y), white, transparent 70%)`,
        }}
      >
        {children}
      </span>
    </span>
  );
}