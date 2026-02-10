"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import AthleteModal, { AthleteFormData } from "./AthleteModal";
import { SportId, SPORT_LIST, getSportConfig } from "@/lib/sports/config";

type Athlete = {
  id: string;
  name: string;
  birth_date: string | null;
  position: string | null;
  primary_sport: SportId;
  sports: SportId[] | null;
  school: string | null;
  team_name: string | null;
  level: string | null;
  jersey_number: number | null;
  created_at: string;
};

export default function AthletesClient() {
  const supabase = createClient();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Athlete | null>(null);
  const [search, setSearch] = useState("");

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load athletes");
    } else {
      setAthletes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  // Add or edit
  const handleSubmit = async (form: AthleteFormData) => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    const row = {
      name: form.name,
      birth_date: form.birth_date || null,
      position: form.position || null,
      primary_sport: form.primary_sport,
      sports: form.sports || [form.primary_sport],
      school: form.school || null,
      team_name: form.team_name || null,
      level: form.level || null,
      jersey_number: form.jersey_number ? parseInt(form.jersey_number, 10) : null,
      user_id: user.id,
    };

    if (editingAthlete) {
      const { error } = await supabase
        .from("athletes")
        .update(row)
        .eq("id", editingAthlete.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Athlete updated");
      }
    } else {
      const { error } = await supabase.from("athletes").insert(row);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Athlete added");
      }
    }

    setSaving(false);
    setModalOpen(false);
    setEditingAthlete(null);
    fetchAthletes();
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("athletes")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Athlete deleted");
    }
    setDeleteTarget(null);
    fetchAthletes();
  };

  const openAdd = () => {
    setEditingAthlete(null);
    setModalOpen(true);
  };

  const openEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setModalOpen(true);
  };

  const filtered = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.team_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.school ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Athletes</h1>
          <p className="text-base-content/70 mt-1">
            {athletes.length} athlete{athletes.length !== 1 && "s"} tracked
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Athlete
        </button>
      </div>

      {/* Search */}
      <div className="form-control">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, team, or school..."
            className="input input-bordered w-full pl-10 max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && athletes.length === 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-16">
            <svg
              className="w-16 h-16 text-base-content/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold mt-4">No athletes yet</h3>
            <p className="text-base-content/60 max-w-sm">
              Add your first athlete to start tracking their stats and progress.
            </p>
            <button className="btn btn-primary mt-4" onClick={openAdd}>
              Add Your First Athlete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="card bg-base-100 shadow overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Sports</th>
                <th className="hidden md:table-cell">Position</th>
                <th className="hidden sm:table-cell">Team</th>
                <th className="hidden lg:table-cell">School</th>
                <th className="hidden lg:table-cell">Level</th>
                <th className="hidden md:table-cell">Age</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((athlete) => (
                <tr key={athlete.id} className="hover">
                  <td>
                    {athlete.jersey_number != null ? (
                      <div className="badge badge-outline font-mono">
                        {athlete.jersey_number}
                      </div>
                    ) : (
                      <span className="text-base-content/30">-</span>
                    )}
                  </td>
                  <td>
                    <div className="font-semibold">{athlete.name}</div>
                    {/* Show team on mobile where column is hidden */}
                    <div className="text-xs text-base-content/50 sm:hidden">
                      {[athlete.team_name, athlete.position]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(athlete.sports || [athlete.primary_sport]).map((sport) => {
                        const config = getSportConfig(sport);
                        return (
                          <span
                            key={sport}
                            className="badge badge-sm badge-ghost"
                            title={config.name}
                          >
                            {config.icon}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    {athlete.position ? (
                      <div className="badge badge-sm">{athlete.position}</div>
                    ) : (
                      <span className="text-base-content/30">-</span>
                    )}
                  </td>
                  <td className="hidden sm:table-cell">
                    {athlete.team_name || (
                      <span className="text-base-content/30">-</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell">
                    {athlete.school || (
                      <span className="text-base-content/30">-</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell">
                    {athlete.level ? (
                      <div className="badge badge-sm badge-ghost">
                        {athlete.level}
                      </div>
                    ) : (
                      <span className="text-base-content/30">-</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell">
                    {getAge(athlete.birth_date) ?? (
                      <span className="text-base-content/30">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => openEdit(athlete)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => setDeleteTarget(athlete)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No search results */}
      {!loading && athletes.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          No athletes match &quot;{search}&quot;
        </div>
      )}

      {/* Add/Edit Modal */}
      <AthleteModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAthlete(null);
        }}
        onSubmit={handleSubmit}
        loading={saving}
        initialData={
          editingAthlete
            ? {
                name: editingAthlete.name,
                birth_date: editingAthlete.birth_date ?? "",
                position: editingAthlete.position ?? "",
                primary_sport: editingAthlete.primary_sport ?? "basketball",
                sports: editingAthlete.sports ?? [editingAthlete.primary_sport ?? "basketball"],
                school: editingAthlete.school ?? "",
                team_name: editingAthlete.team_name ?? "",
                level: editingAthlete.level ?? "",
                jersey_number:
                  editingAthlete.jersey_number?.toString() ?? "",
              }
            : null
        }
      />

      {/* Delete Confirmation */}
      <dialog
        className={`modal ${deleteTarget ? "modal-open" : ""}`}
      >
        <div className="modal-box max-w-sm">
          <h3 className="font-bold text-lg">Delete Athlete</h3>
          <p className="py-4 text-base-content/70">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? This will also remove all
            their game stats and physical metrics. This cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setDeleteTarget(null)}>close</button>
        </form>
      </dialog>
    </>
  );
}
