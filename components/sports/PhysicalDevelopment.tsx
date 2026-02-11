"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import {
  SportId,
  SPORT_LIST,
  getSportConfig,
} from "@/lib/sports/config";
import {
  getPhysicalConfig,
  PhysicalMetricDef,
  PhysicalMetricCategory,
} from "@/lib/sports/physical-metrics";

interface PhysicalRecord {
  id: string;
  athlete_id: string;
  sport: SportId;
  metrics: Record<string, number | null>;
  recorded_at: string;
  notes: string | null;
}

interface Athlete {
  id: string;
  name: string;
  primary_sport: SportId;
}

interface MetricInputProps {
  metric: PhysicalMetricDef;
  value: number | null;
  onChange: (key: string, value: number | null) => void;
}

function MetricInput({ metric, value, onChange }: MetricInputProps) {
  const [showInfo, setShowInfo] = useState(false);

  const getBenchmarkBadge = () => {
    if (!metric.benchmarks?.highSchool || value === null) return null;
    const b = metric.benchmarks.highSchool;

    if (metric.higherIsBetter) {
      if (value >= b.elite) return <span className="badge badge-success badge-sm">Elite</span>;
      if (value >= b.good) return <span className="badge badge-info badge-sm">Good</span>;
      if (value >= b.average) return <span className="badge badge-warning badge-sm">Avg</span>;
      return <span className="badge badge-error badge-sm">Below Avg</span>;
    } else {
      // Lower is better (times)
      if (value <= b.elite) return <span className="badge badge-success badge-sm">Elite</span>;
      if (value <= b.good) return <span className="badge badge-info badge-sm">Good</span>;
      if (value <= b.average) return <span className="badge badge-warning badge-sm">Avg</span>;
      return <span className="badge badge-error badge-sm">Below Avg</span>;
    }
  };

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text flex items-center gap-2">
          {metric.label}
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle"
            onClick={() => setShowInfo(!showInfo)}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </span>
        <span className="label-text-alt flex items-center gap-2">
          {getBenchmarkBadge()}
          <span className="text-base-content/50">{metric.unit}</span>
        </span>
      </label>
      <input
        type="number"
        step={metric.type === "time" ? "0.01" : "1"}
        placeholder={`Enter ${metric.shortLabel}`}
        className="input input-bordered input-sm w-full"
        value={value ?? ""}
        onChange={(e) => onChange(metric.key, e.target.value ? parseFloat(e.target.value) : null)}
      />
      {showInfo && (
        <div className="mt-2 p-2 bg-base-300 rounded-lg text-xs">
          <p className="text-base-content/70">{metric.description}</p>
          <p className="mt-1 text-base-content/50">
            <strong>How to measure:</strong> {metric.howToMeasure}
          </p>
          {metric.benchmarks?.highSchool && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="badge badge-error badge-xs">{"<"}{metric.benchmarks.highSchool.average}</span>
              <span className="badge badge-warning badge-xs">Avg: {metric.benchmarks.highSchool.average}</span>
              <span className="badge badge-info badge-xs">Good: {metric.benchmarks.highSchool.good}</span>
              <span className="badge badge-success badge-xs">Elite: {metric.benchmarks.highSchool.elite}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PhysicalDevelopmentProps {
  athleteId?: string;
  compact?: boolean;
}

export default function PhysicalDevelopment({ athleteId, compact = false }: PhysicalDevelopmentProps) {
  const supabase = createClient();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athleteId || "");
  const [sport, setSport] = useState<SportId>("basketball");
  const [metrics, setMetrics] = useState<Record<string, number | null>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<PhysicalRecord[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Body Measurements"]));
  const [showHistory, setShowHistory] = useState(false);

  const physicalConfig = getPhysicalConfig(sport);

  const fetchAthletes = useCallback(async () => {
    const { data, error } = await supabase
      .from("athletes")
      .select("id, name, primary_sport")
      .order("name");

    if (!error && data) {
      setAthletes(data);
      if (!selectedAthleteId && data.length > 0) {
        setSelectedAthleteId(data[0].id);
        setSport(data[0].primary_sport || "basketball");
      }
    }
    setLoading(false);
  }, [supabase, selectedAthleteId]);

  const fetchLatestMetrics = useCallback(async () => {
    if (!selectedAthleteId) return;

    const { data, error } = await supabase
      .from("athlete_physical_metrics")
      .select("*")
      .eq("athlete_id", selectedAthleteId)
      .eq("sport", sport)
      .order("recorded_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setHistory(data);
      if (data.length > 0) {
        setMetrics(data[0].metrics || {});
        setNotes(data[0].notes || "");
      } else {
        setMetrics({});
        setNotes("");
      }
    }
  }, [supabase, selectedAthleteId, sport]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  useEffect(() => {
    if (selectedAthleteId) {
      fetchLatestMetrics();
    }
  }, [selectedAthleteId, sport, fetchLatestMetrics]);

  const handleAthleteChange = (id: string) => {
    setSelectedAthleteId(id);
    const athlete = athletes.find((a) => a.id === id);
    if (athlete?.primary_sport) {
      setSport(athlete.primary_sport);
    }
  };

  const handleMetricChange = (key: string, value: number | null) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedAthleteId) {
      toast.error("Please select an athlete");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("athlete_physical_metrics").insert({
      athlete_id: selectedAthleteId,
      sport,
      metrics,
      notes: notes || null,
      recorded_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to save metrics");
      console.error(error);
    } else {
      toast.success("Physical metrics saved!");
      fetchLatestMetrics();
    }
    setSaving(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMetricChange = (key: string, currentValue: number | null) => {
    if (!currentValue || history.length < 2) return null;
    const prevMetrics = history[1]?.metrics;
    if (!prevMetrics || prevMetrics[key] === null || prevMetrics[key] === undefined) return null;

    const diff = currentValue - prevMetrics[key]!;
    if (diff === 0) return null;

    const metric = physicalConfig.categories
      .flatMap((c) => c.metrics)
      .find((m) => m.key === key);

    const isImprovement = metric?.higherIsBetter ? diff > 0 : diff < 0;

    return (
      <span className={`text-xs ${isImprovement ? "text-success" : "text-error"}`}>
        {diff > 0 ? "+" : ""}
        {diff.toFixed(metric?.type === "time" ? 2 : 1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Physical Development</h2>
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Physical Development</h2>
          <p className="text-sm text-base-content/50">
            Add an athlete first to track physical metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Physical Development
          </h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Edit" : "History"}
          </button>
        </div>

        {/* Athlete & Sport Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <select
            className="select select-bordered select-sm w-full"
            value={selectedAthleteId}
            onChange={(e) => handleAthleteChange(e.target.value)}
          >
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered select-sm w-full"
            value={sport}
            onChange={(e) => setSport(e.target.value as SportId)}
          >
            {SPORT_LIST.map((s) => {
              const config = getSportConfig(s.id);
              return (
                <option key={s.id} value={s.id}>
                  {config.icon} {config.name}
                </option>
              );
            })}
          </select>
        </div>

        {showHistory ? (
          /* History View */
          <div className="mt-4 space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-base-content/50">No recorded measurements yet.</p>
            ) : (
              history.map((record) => (
                <div key={record.id} className="collapse collapse-arrow bg-base-100">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium">
                    {formatDate(record.recorded_at)}
                    {record.notes && (
                      <span className="text-base-content/50 ml-2">- {record.notes}</span>
                    )}
                  </div>
                  <div className="collapse-content">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(record.metrics).map(([key, value]) => {
                        if (value === null) return null;
                        const metric = physicalConfig.categories
                          .flatMap((c) => c.metrics)
                          .find((m) => m.key === key);
                        if (!metric) return null;
                        return (
                          <div key={key} className="flex justify-between bg-base-200 p-2 rounded">
                            <span className="text-base-content/70">{metric.shortLabel}</span>
                            <span className="font-medium">
                              {value} {metric.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Input View */
          <div className="mt-4 space-y-3">
            {physicalConfig.categories.map((category: PhysicalMetricCategory) => (
              <div key={category.category} className="collapse collapse-arrow bg-base-100">
                <input
                  type="checkbox"
                  checked={expandedCategories.has(category.category)}
                  onChange={() => toggleCategory(category.category)}
                />
                <div className="collapse-title font-medium flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.category}</span>
                  <span className="badge badge-ghost badge-sm">
                    {category.metrics.filter((m) => metrics[m.key] !== null && metrics[m.key] !== undefined).length}/
                    {category.metrics.length}
                  </span>
                </div>
                <div className="collapse-content">
                  <div className={compact ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                    {category.metrics.map((metric) => (
                      <div key={metric.key} className="flex items-center gap-2">
                        <div className="flex-1">
                          <MetricInput
                            metric={metric}
                            value={metrics[metric.key] ?? null}
                            onChange={handleMetricChange}
                          />
                        </div>
                        {getMetricChange(metric.key, metrics[metric.key] ?? null)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Notes */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text">Notes (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered textarea-sm"
                placeholder="Any notes about this measurement session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Save Button */}
            <button
              className="btn btn-primary btn-sm w-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Measurements
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
