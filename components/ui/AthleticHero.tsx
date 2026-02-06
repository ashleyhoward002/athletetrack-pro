"use client";

import { useMotionValue, motion, animate, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export const AthleticHero = ({ children }: { children: React.ReactNode }) => {
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    // Athletic brand colors - energetic teal/cyan + warm accents
    const progress = useMotionValue(0);

    useEffect(() => {
        animate(progress, 1, {
            duration: 3,
            ease: "easeOut",
        });
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouseX((e.clientX - rect.left) / rect.width);
        setMouseY((e.clientY - rect.top) / rect.height);
    };

    return (
        <section
            className="relative min-h-[90vh] w-full overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Gradient background - light and athletic */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30" />

            {/* Animated mesh gradient orbs */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30"
                style={{
                    background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                    left: `${20 + mouseX * 10}%`,
                    top: `${-10 + mouseY * 10}%`,
                }}
                animate={{
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-20"
                style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                    right: `${10 + mouseX * 5}%`,
                    bottom: `${10 + mouseY * 5}%`,
                }}
                animate={{
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
            />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-20 h-20 border-2 border-cyan-200/30 rounded-full" />
            <div className="absolute top-40 right-20 w-8 h-8 bg-emerald-400/20 rounded-full" />
            <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-amber-400/30 rounded-full" />

            {/* Sport icons scattered (subtle) */}
            <div className="absolute top-32 right-1/4 text-4xl opacity-10 rotate-12">⚽</div>
            <div className="absolute bottom-48 left-16 text-3xl opacity-10 -rotate-12">🏀</div>
            <div className="absolute top-1/3 right-12 text-3xl opacity-10 rotate-6">⚾</div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-12">
                {children}
            </div>

            {/* Bottom curve */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 100V60C240 20 480 0 720 0C960 0 1200 20 1440 60V100H0Z"
                        fill="#f8fafc"
                    />
                </svg>
            </div>
        </section>
    );
};
