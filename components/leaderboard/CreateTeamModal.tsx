"use client";

import { useState } from "react";
import { SportId, SPORT_LIST } from "@/lib/sports/config";
import toast from "react-hot-toast";

interface CreateTeamModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateTeamModal({ open, onClose, onCreated }: CreateTeamModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sport, setSport] = useState<SportId | "">("");
    const [loading, setLoading] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    sport: sport || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to create team");
                return;
            }

            setInviteCode(data.team.invite_code);
            toast.success("Team created!");
            onCreated();
        } catch {
            toast.error("Failed to create team");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setSport("");
        setInviteCode(null);
        onClose();
    };

    const copyCode = async () => {
        if (inviteCode) {
            await navigator.clipboard.writeText(inviteCode);
            toast.success("Invite code copied!");
        }
    };

    if (!open) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                {inviteCode ? (
                    <>
                        <h3 className="font-bold text-lg mb-4">Team Created!</h3>
                        <p className="text-base-content/70 mb-4">
                            Share this invite code with others so they can join your team:
                        </p>
                        <div className="flex items-center gap-2 mb-6">
                            <code className="flex-1 bg-base-200 px-4 py-3 rounded-lg text-center text-xl font-mono font-bold tracking-widest">
                                {inviteCode}
                            </code>
                            <button className="btn btn-primary btn-sm" onClick={copyCode}>
                                Copy
                            </button>
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={handleClose}>Done</button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <h3 className="font-bold text-lg mb-4">Create a Team</h3>

                        <div className="form-control mb-3">
                            <label className="label">
                                <span className="label-text font-medium">Team Name *</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                placeholder="e.g., Hoops Squad"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                maxLength={50}
                            />
                        </div>

                        <div className="form-control mb-3">
                            <label className="label">
                                <span className="label-text font-medium">Description</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                placeholder="What's this team about?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={200}
                                rows={2}
                            />
                        </div>

                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text font-medium">Sport (optional)</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={sport}
                                onChange={(e) => setSport(e.target.value as SportId | "")}
                            >
                                <option value="">All Sports</option>
                                {SPORT_LIST.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.icon} {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost" onClick={handleClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`btn btn-primary ${loading ? "loading" : ""}`}
                                disabled={loading || !name.trim()}
                            >
                                Create Team
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <div className="modal-backdrop" onClick={handleClose} />
        </div>
    );
}
