"use client";

/**
 * CountUp Component
 * Inspired by 21st.dev Numbers components
 * Animates numbers counting up from 0 to target value
 */

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number; // Duration in ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: string;
  enableScrollTrigger?: boolean;
}

export default function CountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  separator = ",",
  enableScrollTrigger = true,
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enableScrollTrigger) {
      animateCount();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animateCount();
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, hasAnimated, enableScrollTrigger]);

  const animateCount = () => {
    const startTime = Date.now();
    const startValue = start;
    const endValue = end;

    const step = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    if (!separator) return fixed;

    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join(".");
  };

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
