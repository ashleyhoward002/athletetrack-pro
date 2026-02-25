"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SportId } from "@/lib/sports/config";

interface Drill {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    description: string;
    duration_minutes: number;
    xp_reward: number;
}

interface DrillRecommendationsProps {
    drills: string[];
    sport?: SportId;
    improvements?: string[];
}

// Map common improvement areas to drill categories
const improvementToDrillCategory: Record<string, string[]> = {
    // Basketball
    "shooting": ["Shooting"],
    "shot": ["Shooting"],
    "release": ["Shooting"],
    "follow-through": ["Shooting"],
    "elbow": ["Shooting"],
    "arc": ["Shooting"],
    "balance": ["Conditioning", "Agility"],
    "stance": ["Defense", "Conditioning"],
    "footwork": ["Agility", "Defense"],
    "dribbling": ["Ball Handling"],
    "dribble": ["Ball Handling"],
    "handles": ["Ball Handling"],
    "passing": ["Passing"],
    "defense": ["Defense"],
    "rebounding": ["Strength"],
    "conditioning": ["Conditioning"],
    "speed": ["Agility", "Conditioning"],
    "strength": ["Strength"],
    // General
    "form": ["Shooting", "Ball Handling"],
    "technique": ["Shooting", "Ball Handling"],
    "consistency": ["Shooting"],
};

function findMatchingCategories(text: string): string[] {
    const lower = text.toLowerCase();
    const categories = new Set<string>();

    for (const [keyword, cats] of Object.entries(improvementToDrillCategory)) {
        if (lower.includes(keyword)) {
            cats.forEach(c => categories.add(c));
        }
    }

    return Array.from(categories);
}

export default function DrillRecommendations({ drills, sport = "basketball", improvements = [] }: DrillRecommendationsProps) {
    const [matchedDrills, setMatchedDrills] = useState<Drill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrills = async () => {
            setLoading(true);
            const supabase = createClient();

            // Build categories to search based on AI recommendations and improvements
            const allText = [...drills, ...improvements].join(" ");
            const categories = findMatchingCategories(allText);

            // If no specific categories found, get general drills for the sport
            let query = supabase
                .from("drills")
                .select("id, name, category, difficulty, description, duration_minutes, xp_reward")
                .eq("sport", sport)
                .limit(6);

            if (categories.length > 0) {
                query = query.in("category", categories);
            }

            const { data } = await query.order("xp_reward", { ascending: false });

            if (data && data.length > 0) {
                setMatchedDrills(data);
            } else {
                // Fallback: get any drills for this sport
                const { data: fallbackData } = await supabase
                    .from("drills")
                    .select("id, name, category, difficulty, description, duration_minutes, xp_reward")
                    .eq("sport", sport)
                    .order("xp_reward", { ascending: false })
                    .limit(6);

                setMatchedDrills(fallbackData || []);
            }

            setLoading(false);
        };

        fetchDrills();
    }, [drills, sport, improvements]);

    if (loading) {
        return (
            <div className="card bg-base-200">
                <div className="card-body">
                    <h3 className="card-title">Recommended Drills</h3>
                    <div className="flex justify-center py-4">
                        <span className="loading loading-spinner loading-sm" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="card-title">Recommended Drills</h3>
                    <Link href="/dashboard/drills" className="btn btn-ghost btn-sm">
                        View All →
                    </Link>
                </div>

                {/* AI Suggested Drill Names */}
                {drills.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-base-content/50 mb-2">AI Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                            {drills.map((d, i) => (
                                <span key={i} className="badge badge-outline badge-sm">{d}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Matched Drills from Database */}
                {matchedDrills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchedDrills.map((drill) => (
                            <div
                                key={drill.id}
                                className="bg-base-100 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{drill.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="badge badge-ghost badge-xs">{drill.category}</span>
                                            <span className={`badge badge-xs ${
                                                drill.difficulty === "Rookie" ? "badge-success" :
                                                drill.difficulty === "Pro" ? "badge-warning" :
                                                "badge-error"
                                            }`}>
                                                {drill.difficulty}
                                            </span>
                                        </div>
                                        {drill.description && (
                                            <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                                                {drill.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xs text-base-content/50">
                                            {drill.duration_minutes}min
                                        </div>
                                        <div className="text-xs font-semibold text-primary">
                                            +{drill.xp_reward} XP
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/50">
                        No matching drills found. Check out the{" "}
                        <Link href="/dashboard/drills" className="link link-primary">
                            drills library
                        </Link>{" "}
                        for practice ideas.
                    </p>
                )}

                {/* Call to Action */}
                <div className="mt-4 pt-4 border-t border-base-content/10">
                    <p className="text-sm text-base-content/60 mb-2">
                        Practice these drills regularly to improve your score!
                    </p>
                    <Link href="/dashboard/drills" className="btn btn-primary btn-sm">
                        Start a Drill Session
                    </Link>
                </div>
            </div>
        </div>
    );
}
