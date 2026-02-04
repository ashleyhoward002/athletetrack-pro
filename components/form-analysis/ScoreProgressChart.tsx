"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getSportConfig, SportId } from "@/lib/sports/config";

interface ScoreProgressChartProps {
    analyses: any[];
}

export default function ScoreProgressChart({ analyses }: ScoreProgressChartProps) {
    const chartData = useMemo(() => {
        // Only completed analyses with scores, oldest first
        const scored = analyses
            .filter((a) => a.status === "completed" && a.overall_score)
            .reverse();

        if (scored.length < 2) return null;

        return scored.map((a) => {
            const config = getSportConfig(a.sport as SportId);
            const typeDef = config.formAnalysisTypes.find((t) => t.key === a.analysis_type);
            return {
                date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                score: a.overall_score,
                type: typeDef?.label || a.analysis_type,
                source: a.source === "live" ? "Live" : "Upload",
            };
        });
    }, [analyses]);

    if (!chartData) return null;

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <h3 className="card-title text-sm">Score Trend</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: "hsl(var(--bc) / 0.5)" }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: "hsl(var(--bc) / 0.5)" }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--b2))",
                                    border: "1px solid hsl(var(--bc) / 0.2)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number, _: string, props: any) => [
                                    `${value} / 100`,
                                    `${props.payload.type} (${props.payload.source})`,
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="hsl(var(--p))"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "hsl(var(--p))" }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
