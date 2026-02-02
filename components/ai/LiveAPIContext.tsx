"use client";

import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { useLiveAPI, UseLiveAPIResults } from "@/hooks/useLiveAPI";

const LiveAPIContext = createContext<UseLiveAPIResults | undefined>(undefined);

export type LiveAPIProviderProps = {
    children: ReactNode;
};

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({ children }) => {
    const [apiKey, setApiKey] = useState<string>("");

    useEffect(() => {
        // Fetch the API key from the authenticated server endpoint
        fetch("/api/gemini-key")
            .then((res) => res.json())
            .then((data) => {
                if (data.apiKey) {
                    setApiKey(data.apiKey);
                }
            })
            .catch((err) => console.error("Failed to fetch Gemini API key:", err));
    }, []);

    // Don't initialize the live API client until we have a key
    if (!apiKey) {
        return (
            <LiveAPIContext.Provider value={undefined}>
                {children}
            </LiveAPIContext.Provider>
        );
    }

    return <LiveAPIProviderInner apiKey={apiKey}>{children}</LiveAPIProviderInner>;
};

const LiveAPIProviderInner: FC<{ apiKey: string; children: ReactNode }> = ({ apiKey, children }) => {
    const liveAPI = useLiveAPI({ apiKey });

    return (
        <LiveAPIContext.Provider value={liveAPI}>
            {children}
        </LiveAPIContext.Provider>
    );
};

export const useLiveAPIContext = () => {
    const context = useContext(LiveAPIContext);
    return context ?? null;
};
