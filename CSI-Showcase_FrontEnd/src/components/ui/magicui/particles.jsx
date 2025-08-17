import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";

const Particles = ({
  className,
  quantity = 30, // Reduced default quantity for better performance
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const context = useRef(null);
  const circles = useRef([]);
  const animationFrame = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const lastFrameTime = useRef(0);
  const targetFPS = 30; // Limit FPS for better performance
  const frameInterval = 1000 / targetFPS;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const onMouseMove = (e) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize;
      const x = e.clientX - rect.left - (w / 2);
      const y = e.clientY - rect.top - (h / 2);
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      setCanvasSize({ w: rect.width, h: rect.height });
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      canvasRef.current.style.width = rect.width + "px";
      canvasRef.current.style.height = rect.height + "px";
      context.current.scale(dpr, dpr);
    }
  };

  const drawParticles = () => {
    circles.current.length = 0;
    for (let i = 0; i < quantity; i++) {
      const circle = {
        x: Math.random() * canvasSize.w,
        y: Math.random() * canvasSize.h,
        translateX: 0,
        translateY: 0,
        size: Math.random() * 2 + size,
        alpha: Math.random(),
        targetAlpha: Math.random(),
        dx: (Math.random() - 0.5) * 0.1,
        dy: (Math.random() - 0.5) * 0.1,
      };
      circles.current.push(circle);
    }
  };

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.w, canvasSize.h);
    }
  };

  const drawCircle = (circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = color;
      context.current.globalAlpha = alpha;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        return;
      }

      // Movement
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;

      // Boundary conditions
      if (circle.x < -size) circle.x = canvasSize.w + size;
      if (circle.x > canvasSize.w + size) circle.x = -size;
      if (circle.y < -size) circle.y = canvasSize.h + size;
      if (circle.y > canvasSize.h + size) circle.y = -size;

      // Mouse interaction
      const mouseDistance = Math.sqrt(
        (mouse.current.x - circle.x) ** 2 + (mouse.current.y - circle.y) ** 2,
      );

      const maxDistance = 100;
      if (mouseDistance < maxDistance) {
        const force = (maxDistance - mouseDistance) / maxDistance;
        const forceX = (circle.x - mouse.current.x) * force * ease * 0.01;
        const forceY = (circle.y - mouse.current.y) * force * ease * 0.01;
        
        circle.translateX = forceX;
        circle.translateY = forceY;
        circle.targetAlpha = 1;
      } else {
        circle.translateX *= staticity * 0.01;
        circle.translateY *= staticity * 0.01;
        circle.targetAlpha = 0.1;
      }

      circle.alpha += (circle.targetAlpha - circle.alpha) * 0.02;
    }
  };

  const animate = (currentTime) => {
    if (currentTime - lastFrameTime.current >= frameInterval) {
      clearContext();
      circles.current.forEach((circle) => drawCircle(circle, true));
      lastFrameTime.current = currentTime;
    }
    animationFrame.current = requestAnimationFrame(animate);
  };

  return (
    <div
      className={cn("pointer-events-none performance-optimized", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={onMouseMove}
        className="size-full will-change-transform"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};

export default Particles;