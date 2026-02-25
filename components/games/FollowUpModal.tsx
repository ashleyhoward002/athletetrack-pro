"use client";

interface FollowUpOption {
    label: string;
    value: string;
    color?: "teal" | "orange" | "gray";
}

interface FollowUpModalProps {
    isOpen: boolean;
    question: string;
    options: FollowUpOption[];
    onSelect: (value: string) => void;
    onClose: () => void;
    allowSkip?: boolean;
}

const optionColors: Record<string, string> = {
    teal: "bg-[#00B4D8] hover:bg-[#0096b4] text-white",
    orange: "bg-[#FF6B35] hover:bg-[#e55a2b] text-white",
    gray: "bg-gray-200 hover:bg-gray-300 text-gray-700",
};

export default function FollowUpModal({
    isOpen,
    question,
    options,
    onSelect,
    onClose,
    allowSkip = true,
}: FollowUpModalProps) {
    if (!isOpen) return null;

    const handleSelect = (value: string) => {
        // Haptic feedback
        if ("vibrate" in navigator) {
            navigator.vibrate(50);
        }
        onSelect(value);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={allowSkip ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-auto p-6 shadow-xl animate-slide-up">
                <h3 className="text-lg font-bold text-center mb-4 text-gray-800">
                    {question}
                </h3>

                <div className="space-y-3">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`
                                w-full py-4 px-6 rounded-xl font-semibold text-lg
                                transition-all duration-150 active:scale-95
                                ${optionColors[option.color || "teal"]}
                            `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {allowSkip && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Skip
                    </button>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
