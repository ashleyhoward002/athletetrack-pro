"use client";

import { SPORT_LIST, SportId, getSportConfig } from "@/lib/sports/config";

interface SportAnalysisSelectorProps {
    sport: SportId;
    onSportChange: (sport: SportId) => void;
    analysisType: string;
    onAnalysisTypeChange: (type: string) => void;
}

export default function SportAnalysisSelector({
    sport,
    onSportChange,
    analysisType,
    onAnalysisTypeChange,
}: SportAnalysisSelectorProps) {
    const config = getSportConfig(sport);

    return (
        <>
            <div className="form-control">
                <label className="label"><span className="label-text">Sport</span></label>
                <select
                    className="select select-bordered"
                    value={sport}
                    onChange={(e) => onSportChange(e.target.value as SportId)}
                >
                    {SPORT_LIST.map((s) => (
                        <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-control">
                <label className="label"><span className="label-text">Analysis Type</span></label>
                <select
                    className="select select-bordered"
                    value={analysisType}
                    onChange={(e) => onAnalysisTypeChange(e.target.value)}
                >
                    {config.formAnalysisTypes.map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                </select>
            </div>
        </>
    );
}
