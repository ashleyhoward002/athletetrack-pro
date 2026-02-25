import { useState, useCallback, useRef, useEffect } from "react";

interface UseGameTimerResult {
    seconds: number;
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    toggle: () => void;
    reset: () => void;
    formatted: string;
}

export function useGameTimer(initialSeconds = 0): UseGameTimerResult {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Timer tick
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const toggle = useCallback(() => {
        setIsRunning((r) => !r);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setSeconds(0);
    }, []);

    // Format as MM:SS
    const formatted = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

    return {
        seconds,
        isRunning,
        start,
        pause,
        toggle,
        reset,
        formatted,
    };
}
