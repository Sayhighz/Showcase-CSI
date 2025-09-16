import React, { useMemo } from "react";

export function MotionText({ body, mode = "symbol", className, children, ...props }) {
  const tokens = useMemo(() => {
    if (!body) return [];
    if (mode === "symbol") {
      return body.trim().split("");
    }
    return body.trim().match(/\S+|\s+/g) || [];
  }, [body, mode]);

  return (
    <div className={className} {...props}>
      {typeof children === "function" ? children(tokens) : children}
    </div>
  );
}