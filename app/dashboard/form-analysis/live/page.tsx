"use client";

import { LiveAPIProvider } from "@/components/ai/LiveAPIContext";
import LiveSessionView from "@/components/form-analysis/LiveSessionView";

export default function LiveSessionPage() {
    return (
        <LiveAPIProvider>
            <main className="min-h-screen p-4 md:p-8 pb-24">
                <div className="max-w-4xl mx-auto">
                    <LiveSessionView />
                </div>
            </main>
        </LiveAPIProvider>
    );
}
