"use client";

import { Team, TeamRole } from "@/types/training";
import { useState } from "react";
import toast from "react-hot-toast";

interface TeamCardProps {
    team: Team & { role?: TeamRole };
    onLeave?: (teamId: string) => void;
    onSelect?: (teamId: string) => void;
    showActions?: boolean;
}

const ROLE_BADGES: Record<TeamRole, string> = {
    owner: "badge-primary",
    admin: "badge-secondary",
    member: "badge-ghost",
};

const SPORT_ICONS: Record<string, string> = {
    basketball: "🏀",
    baseball: "⚾",
    soccer: "⚽",
};

export default function TeamCard({ team, onLeave, onSelect, showActions = true }: TeamCardProps) {
    const [copied, setCopied] = useState(false);

    const copyInviteCode = async () => {
        try {
            await navigator.clipboard.writeText(team.invite_code);
            setCopied(true);
            toast.success("Invite code copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    return (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            {team.sport && SPORT_ICONS[team.sport]}
                            {team.name}
                        </h3>
                        {team.description && (
                            <p className="text-sm text-base-content/60 mt-1">{team.description}</p>
                        )}
                    </div>
                    {team.role && (
                        <span className={`badge badge-sm ${ROLE_BADGES[team.role]}`}>
                            {team.role}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 mt-2 text-sm text-base-content/60">
                    <span>{team.member_count || 0} members</span>
                    {team.sport && (
                        <span className="badge badge-xs badge-outline">{team.sport}</span>
                    )}
                </div>

                {showActions && (
                    <div className="card-actions justify-end mt-3 gap-2">
                        {team.role === "owner" && (
                            <button
                                className="btn btn-xs btn-ghost"
                                onClick={copyInviteCode}
                            >
                                {copied ? "Copied!" : "Copy Invite"}
                            </button>
                        )}
                        {onSelect && (
                            <button
                                className="btn btn-xs btn-primary"
                                onClick={() => onSelect(team.id)}
                            >
                                View Leaderboard
                            </button>
                        )}
                        {onLeave && (
                            <button
                                className="btn btn-xs btn-ghost text-error"
                                onClick={() => onLeave(team.id)}
                            >
                                {team.role === "owner" ? "Delete" : "Leave"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
