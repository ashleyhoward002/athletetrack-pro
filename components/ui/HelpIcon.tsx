"use client";

import Link from "next/link";

type GuideSection = "start" | "stats" | "drills" | "skills" | "form" | "scout";

interface HelpIconProps {
  section: GuideSection;
  tooltip?: string;
  size?: "sm" | "md" | "lg";
}

const sectionLabels: Record<GuideSection, string> = {
  start: "Getting Started",
  stats: "Stats Guide",
  drills: "Drills Guide",
  skills: "Skills Guide",
  form: "Form Analysis Guide",
  scout: "Scout Guide",
};

export default function HelpIcon({ section, tooltip, size = "md" }: HelpIconProps) {
  const sizeClasses = {
    sm: "w-5 h-5 text-xs",
    md: "w-6 h-6 text-sm",
    lg: "w-8 h-8 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <Link
      href={`/dashboard/guide?tab=${section}`}
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        rounded-full
        bg-base-content/10 hover:bg-primary/20
        text-base-content/50 hover:text-primary
        transition-colors cursor-help
        tooltip tooltip-bottom
      `}
      data-tip={tooltip || sectionLabels[section]}
    >
      <svg
        className={iconSizes[size]}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </Link>
  );
}
