"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface JoinTeamFormProps {
    onJoined: () => void;
}

export default function JoinTeamForm({ onJoined }: JoinTeamFormProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/teams/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invite_code: code.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to join team");
                return;
            }

            toast.success(`Joined ${data.team.name}!`);
            setCode("");
            onJoined();
        } catch {
            toast.error("Failed to join team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleJoin} className="flex gap-2">
            <input
                type="text"
                className="input input-bordered input-sm flex-1"
                placeholder="Enter invite code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={8}
            />
            <button
                type="submit"
                className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`}
                disabled={loading || !code.trim()}
            >
                Join
            </button>
        </form>
    );
}
