"use client"

import { useRef, useEffect } from "react"
import { cn } from "../../lib/utils"

export function DotPattern({
  size = 32,
  radius = 1.5,
  offsetX = 0,
  offsetY = 0,
  className,
  ...props
}) {
  const patternRef = useRef(null)

  useEffect(() => {
    if (patternRef.current) {
      const svg = patternRef.current
      const pattern = svg.querySelector('pattern')
      if (pattern) {
        pattern.setAttribute('width', size)
        pattern.setAttribute('height', size)
        pattern.setAttribute('x', offsetX)
        pattern.setAttribute('y', offsetY)
      }
      
      const circle = svg.querySelector('circle')
      if (circle) {
        circle.setAttribute('cx', size / 2)
        circle.setAttribute('cy', size / 2)
        circle.setAttribute('r', radius)
      }
    }
  }, [size, radius, offsetX, offsetY])

  return (
    <svg
      ref={patternRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      <defs>
        <pattern
          id="dot-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#dot-pattern)"
      />
    </svg>
  )
}