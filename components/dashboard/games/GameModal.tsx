"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SportId,
  SPORT_LIST,
  DEFAULT_SPORT,
  getSportConfig,
  groupStatFields,
  StatFieldDef,
  ComputedStatDef,
} from "@/lib/sports/config";
import StatTooltip from "@/components/ui/StatTooltip";

export type GameFormData = {
  athlete_id: string;
  season_id: string;
  date: string;
  opponent: string;
  sport: SportId;
  stats: Record<string, string>;
};

type SelectOption = { id: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GameFormData) => Promise<void>;
  initialData?: GameFormData | null;
  loading?: boolean;
  athletes: SelectOption[];
  seasons: SelectOption[];
};

function buildEmptyStats(sport: SportId): Record<string, string> {
  const config = getSportConfig(sport);
  const stats: Record<string, string> = {};
  for (const field of config.statFields) {
    stats[field.key] = "0";
  }
  return stats;
}

function buildEmptyForm(sport: SportId = DEFAULT_SPORT): GameFormData {
  return {
    athlete_id: "",
    season_id: "",
    date: new Date().toISOString().split("T")[0],
    opponent: "",
    sport,
    stats: buildEmptyStats(sport),
  };
}

export default function GameModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
  athletes,
  seasons,
}: Props) {
  const [form, setForm] = useState<GameFormData>(buildEmptyForm());
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData);
      } else {
        setForm({
          ...buildEmptyForm(),
          athlete_id: athletes[0]?.id ?? "",
        });
      }
    }
  }, [open, initialData, athletes]);

  const sport = form.sport;
  const config = getSportConfig(sport);
  const groups = useMemo(() => groupStatFields(config.statFields), [config]);

  const setField = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const setStat = (key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      stats: { ...prev.stats, [key]: value },
    }));

  const handleSportChange = (newSport: SportId) => {
    setForm((prev) => ({
      ...prev,
      sport: newSport,
      stats: buildEmptyStats(newSport),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const StatInput = ({ field }: { field: StatFieldDef }) => (
    <div className="form-control">
      <label className="label py-0.5">
        <span className="label-text text-xs flex items-center gap-1">
          {field.label}
          <StatTooltip description={field.description} howToTrack={field.howToTrack} />
        </span>
      </label>
      <input
        type="number"
        min="0"
        max={field.max}
        step={field.type === "decimal" ? "0.1" : "1"}
        value={form.stats[field.key] ?? "0"}
        onChange={(e) => setStat(field.key, e.target.value)}
        className="input input-bordered input-sm text-center"
      />
    </div>
  );

  const ComputedDisplay = ({ stat }: { stat: ComputedStatDef }) => {
    const numStats: Record<string, number> = {};
    for (const [k, v] of Object.entries(form.stats)) {
      numStats[k] = parseFloat(v) || 0;
    }
    const value = stat.compute(numStats);
    return (
      <div className="text-center pb-2">
        <span className="text-xs text-base-content/50 inline-flex items-center gap-1">
          {stat.shortLabel}
          <StatTooltip description={stat.description} />
        </span>
        <div className="font-semibold text-sm">{stat.format(value)}</div>
      </div>
    );
  };

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box w-full max-w-2xl max-h-[90vh]">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-4">
          {isEdit ? "Edit Game" : "Log Game"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Sport selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Sport</span>
            </label>
            <div className="flex gap-2">
              {SPORT_LIST.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`btn btn-sm ${
                    sport === s.id ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => handleSportChange(s.id)}
                  disabled={isEdit}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Game info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Athlete <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={form.athlete_id}
                onChange={(e) => setField("athlete_id", e.target.value)}
                required
              >
                <option value="" disabled>
                  Select athlete...
                </option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Season</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={form.season_id}
                onChange={(e) => setField("season_id", e.target.value)}
              >
                <option value="">None</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Date <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Opponent <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Team name"
                className="input input-bordered w-full"
                value={form.opponent}
                onChange={(e) => setField("opponent", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Dynamic stat fields grouped by category */}
          {Object.entries(groups).map(([groupName, fields]) => (
            <div key={groupName}>
              <div className="divider text-xs my-1">{groupName}</div>
              <div className="grid grid-cols-5 gap-3">
                {fields.map((field) => (
                  <StatInput key={field.key} field={field} />
                ))}
              </div>
            </div>
          ))}

          {/* Computed stats display */}
          {config.computedStats.length > 0 && (
            <>
              <div className="divider text-xs my-1">Computed Stats</div>
              <div className="grid grid-cols-5 gap-3">
                {config.computedStats.map((stat) => (
                  <ComputedDisplay key={stat.key} stat={stat} />
                ))}
              </div>
            </>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Game"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
