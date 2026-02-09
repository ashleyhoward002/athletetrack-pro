"use client";

/**
 * AnimatedCard Component
 * Inspired by 21st.dev Cards collection
 * Card with hover tilt effect and gradient border
 */

import { useRef, useState } from "react";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableTilt?: boolean;
  enableGlow?: boolean;
}

export default function AnimatedCard({
  children,
  className = "",
  glowColor = "rgba(99, 102, 241, 0.4)",
  enableTilt = true,
  enableGlow = true,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt
    if (enableTilt) {
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    }

    // Calculate glow position
    if (enableGlow) {
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      setGlowPosition({ x: percentX, y: percentY });
    }
  };

  const handleMouseLeave = () => {
    setTransform("");
    setGlowPosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl transition-all duration-200 ease-out ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect */}
      {enableGlow && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor}, transparent 40%)`,
            opacity: transform ? 0.6 : 0,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Border gradient effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${glowColor} 0%, transparent 50%, ${glowColor} 100%)`,
          padding: "1px",
          opacity: transform ? 0.8 : 0,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor",
          WebkitMaskComposite: "xor",
        }}
      />
    </div>
  );
}
