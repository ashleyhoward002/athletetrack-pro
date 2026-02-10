"use client";

import { useState, useEffect } from "react";
import { SportId, DEFAULT_SPORT, SPORT_LIST, getSportConfig } from "@/lib/sports/config";

export type AthleteFormData = {
  name: string;
  birth_date: string;
  position: string;
  primary_sport: SportId;
  sports: SportId[];
  school: string;
  team_name: string;
  level: string;
  jersey_number: string;
};

const LEVELS = [
  "Recreation",
  "Travel",
  "AAU",
  "Middle School",
  "High School",
  "Prep",
];

const emptyForm: AthleteFormData = {
  name: "",
  birth_date: "",
  position: "",
  primary_sport: DEFAULT_SPORT,
  sports: [DEFAULT_SPORT],
  school: "",
  team_name: "",
  level: "",
  jersey_number: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AthleteFormData) => Promise<void>;
  initialData?: AthleteFormData | null;
  loading?: boolean;
};

export default function AthleteModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}: Props) {
  const [form, setForm] = useState<AthleteFormData>(emptyForm);
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      setForm(initialData ?? emptyForm);
    }
  }, [open, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSportToggle = (sport: SportId) => {
    setForm((prev) => {
      const currentSports = prev.sports || [];
      let newSports: SportId[];

      if (currentSports.includes(sport)) {
        // Remove sport (but keep at least one)
        if (currentSports.length === 1) return prev;
        newSports = currentSports.filter((s) => s !== sport);
      } else {
        // Add sport
        newSports = [...currentSports, sport];
      }

      // Update primary_sport to first in list
      const newPrimary = newSports[0];

      // Reset position if it's no longer valid
      const allPositions = getAllPositions(newSports);
      const positionValid = allPositions.includes(prev.position);

      return {
        ...prev,
        sports: newSports,
        primary_sport: newPrimary,
        position: positionValid ? prev.position : "",
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // Get positions from all selected sports
  const getAllPositions = (sports: SportId[]): string[] => {
    const positionSet = new Set<string>();
    sports.forEach((sport) => {
      getSportConfig(sport).positions.forEach((pos) => positionSet.add(pos));
    });
    return Array.from(positionSet).sort();
  };

  const positions = getAllPositions(form.sports || [form.primary_sport]);

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box w-full max-w-lg">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-4">
          {isEdit ? "Edit Athlete" : "Add Athlete"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              className="input input-bordered w-full"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Two-column row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Birth Date</span>
              </label>
              <input
                type="date"
                name="birth_date"
                className="input input-bordered w-full"
                value={form.birth_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Jersey #</span>
              </label>
              <input
                type="number"
                name="jersey_number"
                placeholder="0"
                className="input input-bordered w-full"
                value={form.jersey_number}
                onChange={handleChange}
                min={0}
                max={99}
              />
            </div>
          </div>

          {/* Sports Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Sports <span className="text-base-content/50">(select all that apply)</span>
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORT_LIST.map((s) => {
                const isSelected = (form.sports || []).includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSportToggle(s.id)}
                    className={`btn btn-sm ${
                      isSelected ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {s.icon} {s.name}
                    {isSelected && (
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Position</span>
            </label>
            <select
              name="position"
              className="select select-bordered w-full"
              value={form.position}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Level + School/Team */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Level</span>
              </label>
              <select
                name="level"
                className="select select-bordered w-full"
                value={form.level}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">School</span>
              </label>
              <input
                type="text"
                name="school"
                placeholder="School name"
                className="input input-bordered w-full"
                value={form.school}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Team */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Team</span>
            </label>
            <input
              type="text"
              name="team_name"
              placeholder="Team name"
              className="input input-bordered w-full"
              value={form.team_name}
              onChange={handleChange}
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Add Athlete"}
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
