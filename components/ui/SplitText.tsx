"use client";

/**
 * SplitText Component
 * Inspired by ReactBits (reactbits.dev) - Text Animations
 * Animates text by splitting into individual characters
 */

import { useEffect, useState } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number; // Delay between each character in ms
  animationType?: "fade" | "slide" | "blur";
}

export default function SplitText({
  text,
  className = "",
  delay = 50,
  animationType = "fade",
}: SplitTextProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setVisibleChars(0);
    setIsComplete(false);

    const chars = text.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setVisibleChars(current);

      if (current >= chars) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  const getCharStyle = (index: number) => {
    const isVisible = index < visibleChars;

    const baseStyle: React.CSSProperties = {
      display: "inline-block",
      transition: "all 0.3s ease-out",
    };

    if (animationType === "fade") {
      return {
        ...baseStyle,
        opacity: isVisible ? 1 : 0,
      };
    }

    if (animationType === "slide") {
      return {
        ...baseStyle,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      };
    }

    if (animationType === "blur") {
      return {
        ...baseStyle,
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? "blur(0px)" : "blur(8px)",
        transform: isVisible ? "scale(1)" : "scale(0.8)",
      };
    }

    return baseStyle;
  };

  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          style={getCharStyle(index)}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
