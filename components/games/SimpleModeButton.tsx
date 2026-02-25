"use client";

import { useState } from "react";

type ButtonColor = "teal" | "orange" | "mint" | "gray" | "red";
type ButtonSize = "large" | "medium" | "small";

interface SimpleModeButtonProps {
    label: string;
    subtitle?: string;
    tooltip: string;
    color: ButtonColor;
    size?: ButtonSize;
    onClick: () => void;
    disabled?: boolean;
}

const colorClasses: Record<ButtonColor, string> = {
    teal: "bg-[#00B4D8] hover:bg-[#0096b4] text-white",
    orange: "bg-[#FF6B35] hover:bg-[#e55a2b] text-white",
    mint: "bg-[#10B981] hover:bg-[#0d9668] text-white",
    gray: "bg-gray-200 hover:bg-gray-300 text-gray-700",
    red: "bg-red-100 hover:bg-red-200 text-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
    large: "min-h-[72px] text-lg",
    medium: "min-h-[56px] text-base",
    small: "min-h-[48px] text-sm",
};

export default function SimpleModeButton({
    label,
    subtitle,
    tooltip,
    color,
    size = "medium",
    onClick,
    disabled = false,
}: SimpleModeButtonProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = () => {
        if (disabled) return;

        // Haptic feedback
        if ("vibrate" in navigator) {
            navigator.vibrate(50);
        }

        // Visual feedback
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);

        onClick();
    };

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={`
                    w-full rounded-xl font-bold shadow-sm
                    transition-all duration-150 ease-out
                    flex flex-col items-center justify-center gap-0.5
                    ${colorClasses[color]}
                    ${sizeClasses[size]}
                    ${isPressed ? "scale-95" : "scale-100"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"}
                `}
            >
                <span className="flex items-center gap-2">
                    {label}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(!showTooltip);
                        }}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-normal"
                        aria-label="Help"
                    >
                        ?
                    </button>
                </span>
                {subtitle && (
                    <span className="text-xs font-normal opacity-80">{subtitle}</span>
                )}
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div
                    className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#0F1B2D] text-white text-sm rounded-lg shadow-lg max-w-[250px] text-center"
                    onClick={() => setShowTooltip(false)}
                >
                    {tooltip}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F1B2D] rotate-45" />
                </div>
            )}
        </div>
    );
}
