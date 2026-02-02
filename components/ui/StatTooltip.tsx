"use client";

type Props = {
  description: string;
  howToTrack?: string;
};

export default function StatTooltip({ description, howToTrack }: Props) {
  const tip = howToTrack ? `${description}\n\nHow to track: ${howToTrack}` : description;

  return (
    <div className="tooltip tooltip-top" data-tip={tip}>
      <button
        type="button"
        tabIndex={-1}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-base-content/10 text-base-content/40 hover:bg-base-content/20 hover:text-base-content/60 text-[10px] leading-none cursor-help transition-colors"
      >
        ?
      </button>
    </div>
  );
}
