"use client";

import { useState, useEffect } from "react";
import { SportId, DEFAULT_SPORT, SPORT_LIST, getSportConfig } from "@/lib/sports/config";

export type AthleteFormData = {
  name: string;
  birth_date: string;
  position: string;
  primary_sport: SportId;
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

  const handleSportChange = (sport: SportId) => {
    setForm((prev) => ({ ...prev, primary_sport: sport, position: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const positions = getSportConfig(form.primary_sport).positions;

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

          {/* Sport + Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Primary Sport</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={form.primary_sport}
                onChange={(e) => handleSportChange(e.target.value as SportId)}
              >
                {SPORT_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
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
