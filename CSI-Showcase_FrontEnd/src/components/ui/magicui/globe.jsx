import React, { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";

const Globe = ({ className, size = 600, points = [], animated = true, rotationSpeed = 0.2, fps = 30, ...props }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // Ensure perfect square canvas for circular globe
    canvas.width = size;
    canvas.height = size;

    // Enhanced Globe properties with perfect sphere proportions
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.85; // Use fixed proportion for perfect circle
    let rotation = 0;

    // Reduced points for better performance
    const globePoints = points.length ? points : generateRandomPoints(50);

    function generateRandomPoints(count) {
      const pts = [];
      for (let i = 0; i < count; i++) {
        pts.push({
          lat: (Math.random() - 0.5) * 180,
          lng: (Math.random() - 0.5) * 360,
          size: Math.random() * 2 + 1,
          brightness: 0.8, // Static brightness
        });
      }
      return pts;
    }

    function project3D(lat, lng, radius) {
      const phi = (lat * Math.PI) / 180;
      const theta = ((lng + rotation) * Math.PI) / 180;
      
      const x = radius * Math.cos(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.sin(theta);
      
      return { 
        x, 
        y, 
        z,
        depth: (z + radius) / (2 * radius)
      };
    }

    function drawGlobe() {
      ctx.clearRect(0, 0, size, size);
      
      // Enhanced 3D globe with realistic lighting gradient
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, "rgba(144, 39, 142, 0.2)");
      gradient.addColorStop(0.5, "rgba(144, 39, 142, 0.1)");
      gradient.addColorStop(1, "rgba(144, 39, 142, 0.05)");
      
      // Draw globe background with depth
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add a subtle specular highlight for a 3D effect
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius * 0.2, centerY - radius * 0.2, 0,
        centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.5
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      
      // Enhanced globe outline with static glow - increased clarity
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(144, 39, 142, 0.9)"; // Increased from 0.8
      ctx.lineWidth = 3.5; // Increased from 3
      ctx.shadowBlur = 25; // Increased from 20
      ctx.shadowColor = "rgba(144, 39, 142, 0.9)"; // Increased from 0.8
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw enhanced grid lines
      drawGridLines();
      
      // Draw enhanced points with pulsing effect
      drawPoints();
      
      // Draw enhanced connections
      drawConnections();
      
      // Add atmospheric glow
      drawAtmosphere();
    }

    function drawGridLines() {
      ctx.lineWidth = 1.5;

      // Draw meridians with varying opacity for 3D effect
      for (let lng = -180; lng <= 180; lng += 30) {
        ctx.beginPath();
        let firstPoint = true;
        for (let lat = -90; lat <= 90; lat += 5) {
          const point = project3D(lat, lng, radius);
          if (point.z > 0) {
            const screenX = centerX + point.x;
            const screenY = centerY - point.y;
            const lineOpacity = 0.2 + (point.depth * 0.4); // Opacity based on depth

            if (firstPoint) {
              ctx.moveTo(screenX, screenY);
              firstPoint = false;
            } else {
              ctx.lineTo(screenX, screenY);
            }
            
            // Set stroke style for each segment to allow varying opacity
            ctx.strokeStyle = `rgba(144, 39, 142, ${lineOpacity})`;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
          }
        }
      }

      // Draw parallels with varying opacity for 3D effect
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let firstPoint = true;
        for (let lng = -180; lng <= 180; lng += 5) {
          const point = project3D(lat, lng, radius);
          if (point.z > 0) {
            const screenX = centerX + point.x;
            const screenY = centerY - point.y;
            const lineOpacity = 0.2 + (point.depth * 0.4); // Opacity based on depth

            if (firstPoint) {
              ctx.moveTo(screenX, screenY);
              firstPoint = false;
            } else {
              ctx.lineTo(screenX, screenY);
            }
            
            // Set stroke style for each segment to allow varying opacity
            ctx.strokeStyle = `rgba(144, 39, 142, ${lineOpacity})`;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
          }
        }
      }
    }

    function drawPoints() {
      // Simplified points without pulsing
      globePoints.forEach(point => {
        const projected = project3D(point.lat, point.lng, radius);
        if (projected.z > 0) {
          const screenX = centerX + projected.x;
          const screenY = centerY - projected.y;
          
          // Simple static properties
          const pointOpacity = projected.depth * point.brightness;
          const pointSize = point.size * (0.5 + projected.depth * 0.5);
          
          // Draw simple point
          ctx.beginPath();
          ctx.arc(screenX, screenY, pointSize, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(144, 39, 142, ${pointOpacity})`;
          ctx.fill();
          
          // Add a subtle glow effect to the point
          const glowRadius = pointSize * 2;
          const glowGradient = ctx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, glowRadius
          );
          glowGradient.addColorStop(0, `rgba(144, 39, 142, ${pointOpacity * 0.5})`);
          glowGradient.addColorStop(1, 'rgba(144, 39, 142, 0)');
          
          ctx.beginPath();
          ctx.arc(screenX, screenY, glowRadius, 0, 2 * Math.PI);
          ctx.fillStyle = glowGradient;
          ctx.fill();
          
          // Simple highlight
          ctx.beginPath();
          ctx.arc(screenX - pointSize * 0.3, screenY - pointSize * 0.3, pointSize * 0.5, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(255, 255, 255, ${pointOpacity * 0.6})`;
          ctx.fill();
        }
      });
    }

    function drawConnections() {
      // Simplified connections with lower frequency
      ctx.strokeStyle = "rgba(144, 39, 142, 0.2)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < globePoints.length; i++) {
        for (let j = i + 1; j < globePoints.length; j++) {
          if (Math.random() < 0.05) { // Much fewer connections
            const point1 = project3D(globePoints[i].lat, globePoints[i].lng, radius);
            const point2 = project3D(globePoints[j].lat, globePoints[j].lng, radius);
            
            if (point1.z > 0 && point2.z > 0) {
              const screenX1 = centerX + point1.x;
              const screenY1 = centerY - point1.y;
              const screenX2 = centerX + point2.x;
              const screenY2 = centerY - point2.y;
              
              ctx.beginPath();
              ctx.moveTo(screenX1, screenY1);
              ctx.lineTo(screenX2, screenY2);
              ctx.stroke();
            }
          }
        }
      }
    }

    function drawAtmosphere() {
      // Add atmospheric glow around the globe
      const atmosphereGradient = ctx.createRadialGradient(
        centerX, centerY, radius,
        centerX, centerY, radius * 1.2
      );
      atmosphereGradient.addColorStop(0, "rgba(144, 39, 142, 0.1)");
      atmosphereGradient.addColorStop(0.5, "rgba(144, 39, 142, 0.05)");
      atmosphereGradient.addColorStop(1, "rgba(144, 39, 142, 0)");
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.2, 0, 2 * Math.PI);
      ctx.fillStyle = atmosphereGradient;
      ctx.fill();
    }

    let animationId;
    
    let lastTime = 0;
    const targetFPS = fps; // configurable FPS
    const frameInterval = 1000 / targetFPS;
    
    function animate(currentTime) {
      if (!animated) return; // stop looping when animation disabled
      if (currentTime - lastTime >= frameInterval) {
        rotation += rotationSpeed; // configurable rotation speed
        drawGlobe();
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    }

    // Initial draw
    drawGlobe();

    // Start animation only when enabled
    if (animated) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [size, points, animated, rotationSpeed, fps]);

  return (
    <div className={cn("relative", className)} {...props}>
      <canvas
        ref={canvasRef}
        className="block performance-optimized"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          aspectRatio: '1 / 1', // Ensure perfect square aspect ratio
          willChange: 'transform'
        }}
      />
    </div>
  );
};

export default Globe;