"use client";

import { useEffect, useState } from "react";
import { SPORT_LIST, SportId } from "@/lib/sports/config";

interface SkillNode {
    id: string;
    name: string;
    description: string | null;
    level: number;
    xp_required: number;
    icon: string | null;
    display_order: number;
    progress: {
        status: string;
        xp_earned: number;
    } | null;
}

interface SkillTree {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    skill_nodes: SkillNode[];
}

const LEVEL_LABELS: Record<number, string> = {
    1: "Rookie",
    2: "Pro",
    3: "All-Star",
};

const STATUS_STYLES: Record<string, string> = {
    locked: "opacity-40 grayscale",
    available: "ring-2 ring-primary ring-offset-2 ring-offset-base-100 animate-pulse",
    in_progress: "ring-2 ring-warning ring-offset-2 ring-offset-base-100",
    completed: "ring-2 ring-success ring-offset-2 ring-offset-base-100",
};

const STATUS_BG: Record<string, string> = {
    locked: "bg-base-300",
    available: "bg-primary/10",
    in_progress: "bg-warning/10",
    completed: "bg-success/10",
};

export default function SkillsPage() {
    const [trees, setTrees] = useState<SkillTree[]>([]);
    const [selectedSport, setSelectedSport] = useState<SportId>("basketball");
    const [selectedTree, setSelectedTree] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/skill-trees?sport=${selectedSport}`)
            .then((r) => r.json())
            .then((data) => {
                setTrees(data.trees || []);
                if (data.trees?.length > 0) {
                    setSelectedTree(data.trees[0].id);
                } else {
                    setSelectedTree(null);
                }
            })
            .catch(() => setTrees([]))
            .finally(() => setLoading(false));
    }, [selectedSport]);

    const activeTree = trees.find((t) => t.id === selectedTree);

    const getNodeStatus = (node: SkillNode): string => {
        return node.progress?.status || "locked";
    };

    const getXpProgress = (node: SkillNode): number => {
        if (!node.progress) return 0;
        return Math.min(100, (node.progress.xp_earned / node.xp_required) * 100);
    };

    // Group nodes by level
    const nodesByLevel: Record<number, SkillNode[]> = {};
    if (activeTree) {
        for (const node of activeTree.skill_nodes) {
            if (!nodesByLevel[node.level]) nodesByLevel[node.level] = [];
            nodesByLevel[node.level].push(node);
        }
    }

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold">Skill Trees</h1>
                    <p className="text-base-content/60">
                        Master new skills by completing drills. Unlock advanced techniques as you progress.
                    </p>
                </div>

                {/* Sport Selector */}
                <div className="flex gap-2 flex-wrap">
                    {SPORT_LIST.map((s) => (
                        <button
                            key={s.id}
                            className={`btn btn-sm ${selectedSport === s.id ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setSelectedSport(s.id)}
                        >
                            {s.icon} {s.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : trees.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🌱</div>
                        <h2 className="text-xl font-bold mb-2">No Skill Trees Yet</h2>
                        <p className="text-base-content/60">
                            Skill trees need to be seeded for this sport. Check back soon!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tree Selector Tabs */}
                        <div className="tabs tabs-boxed bg-base-200">
                            {trees.map((tree) => (
                                <button
                                    key={tree.id}
                                    className={`tab ${selectedTree === tree.id ? "tab-active" : ""}`}
                                    onClick={() => setSelectedTree(tree.id)}
                                >
                                    {tree.icon || "🎯"} {tree.name}
                                </button>
                            ))}
                        </div>

                        {/* Tree Description */}
                        {activeTree && (
                            <div className="card bg-base-200">
                                <div className="card-body py-3">
                                    <p className="text-sm text-base-content/70">
                                        {activeTree.description || `Master the ${activeTree.name} skill tree.`}
                                    </p>
                                    <div className="flex gap-4 text-xs text-base-content/50 mt-1">
                                        <span>{activeTree.skill_nodes.length} skills</span>
                                        <span>
                                            {activeTree.skill_nodes.filter((n) => getNodeStatus(n) === "completed").length} completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skill Nodes by Level */}
                        {activeTree && (
                            <div className="space-y-8">
                                {Object.entries(nodesByLevel)
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([level, nodes]) => (
                                        <div key={level}>
                                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                                <span className={`badge ${
                                                    level === "1" ? "badge-success" :
                                                    level === "2" ? "badge-warning" :
                                                    "badge-error"
                                                }`}>
                                                    {LEVEL_LABELS[Number(level)] || `Level ${level}`}
                                                </span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {nodes.map((node) => {
                                                    const status = getNodeStatus(node);
                                                    const xpPct = getXpProgress(node);

                                                    return (
                                                        <div
                                                            key={node.id}
                                                            className={`card ${STATUS_BG[status]} ${STATUS_STYLES[status]} transition-all`}
                                                        >
                                                            <div className="card-body p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-2xl">
                                                                        {status === "completed" ? "✅" :
                                                                         status === "locked" ? "🔒" :
                                                                         node.icon || "🎯"}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-sm">
                                                                            {node.name}
                                                                        </h4>
                                                                        {node.description && (
                                                                            <p className="text-xs text-base-content/60 line-clamp-2">
                                                                                {node.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {status !== "locked" && (
                                                                    <div className="mt-2">
                                                                        <div className="flex justify-between text-xs mb-1">
                                                                            <span>
                                                                                {node.progress?.xp_earned || 0}/{node.xp_required} XP
                                                                            </span>
                                                                            <span>
                                                                                {status === "completed" ? "Mastered" : `${Math.round(xpPct)}%`}
                                                                            </span>
                                                                        </div>
                                                                        <progress
                                                                            className={`progress w-full ${
                                                                                status === "completed" ? "progress-success" : "progress-warning"
                                                                            }`}
                                                                            value={xpPct}
                                                                            max={100}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
