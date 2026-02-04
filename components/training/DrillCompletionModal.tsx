"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface DrillCompletionModalProps {
    drillId: string;
    drillName: string;
    programDayId?: string;
    onComplete: (xpEarned: number) => void;
    onClose: () => void;
}

export default function DrillCompletionModal({
    drillId,
    drillName,
    programDayId,
    onComplete,
    onClose,
}: DrillCompletionModalProps) {
    const [rating, setRating] = useState(3);
    const [durationMinutes, setDurationMinutes] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/drill-completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    drill_id: drillId,
                    program_day_id: programDayId || null,
                    duration_seconds: durationMinutes
                        ? Math.round(parseFloat(durationMinutes) * 60)
                        : null,
                    rating,
                    notes: notes || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to complete drill");

            const data = await res.json();
            toast.success(`+${data.xp_earned} XP earned!`);
            onComplete(data.xp_earned);
        } catch (error) {
            toast.error("Failed to record completion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Complete: {drillName}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">How did it go?</span>
                        </label>
                        <div className="rating rating-lg">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <input
                                    key={star}
                                    type="radio"
                                    name="rating"
                                    className="mask mask-star-2 bg-orange-400"
                                    checked={rating === star}
                                    onChange={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Duration (minutes)</span>
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder="e.g. 15"
                            className="input input-bordered"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                        />
                    </div>

                    {/* Notes */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Notes (optional)</span>
                        </label>
                        <textarea
                            placeholder="How did you feel? What did you focus on?"
                            className="textarea textarea-bordered"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn btn-primary ${loading ? "loading" : ""}`}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Complete Drill"}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </div>
    );
}
