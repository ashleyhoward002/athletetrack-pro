"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { School, SchoolMember } from "@/types/school";

interface SchoolWithRole extends School {
  role: string;
}

export default function SchoolDashboardPage() {
  const [schools, setSchools] = useState<SchoolWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");
      const data = await response.json();
      if (response.ok) {
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error("Fetch schools error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (name: string, domain?: string, address?: string) => {
    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, address }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to create school");
        return;
      }

      toast.success("School created successfully!");
      setShowCreateModal(false);
      fetchSchools();
    } catch (error) {
      console.error("Create school error:", error);
      toast.error("Failed to create school");
    }
  };

  const handleJoinSchool = async (inviteCode: string) => {
    try {
      const response = await fetch("/api/schools/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to join school");
        return;
      }

      toast.success(`Joined ${data.school?.name || "school"} successfully!`);
      setShowJoinModal(false);
      fetchSchools();
    } catch (error) {
      console.error("Join school error:", error);
      toast.error("Failed to join school");
    }
  };

  const copyInviteCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${type} invite code copied!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">School Management</h1>
          <p className="text-base-content/60 mt-1">
            Manage your schools and students
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={() => setShowJoinModal(true)}
          >
            Join School
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create School
          </button>
        </div>
      </div>

      {schools.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-12">
            <h2 className="text-xl font-semibold">No Schools Yet</h2>
            <p className="text-base-content/60 mt-2">
              Create a school to start managing students, or join an existing
              school with an invite code.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="btn btn-outline"
                onClick={() => setShowJoinModal(true)}
              >
                Join School
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create School
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <div key={school.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title">{school.name}</h2>
                  <span
                    className={`badge ${
                      school.role === "owner"
                        ? "badge-primary"
                        : school.role === "admin"
                          ? "badge-secondary"
                          : "badge-ghost"
                    }`}
                  >
                    {school.role}
                  </span>
                </div>

                {school.address && (
                  <p className="text-sm text-base-content/60">{school.address}</p>
                )}

                <div className="flex gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-semibold">{school.student_count}</span>
                    <span className="text-base-content/60 ml-1">students</span>
                  </div>
                  <div>
                    <span className="font-semibold">{school.member_count}</span>
                    <span className="text-base-content/60 ml-1">staff</span>
                  </div>
                </div>

                {["owner", "admin"].includes(school.role) && (
                  <div className="mt-4 p-3 bg-base-200 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-2">
                      Staff Invite Code
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-base-300 px-2 py-1 rounded flex-1">
                        {school.invite_code}
                      </code>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => copyInviteCode(school.invite_code, "Staff")}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                <div className="card-actions justify-end mt-4">
                  <Link
                    href={`/dashboard/school/import?school=${school.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    Import
                  </Link>
                  <Link
                    href={`/dashboard/school/students?school=${school.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Manage Students
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create School Modal */}
      {showCreateModal && (
        <CreateSchoolModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSchool}
        />
      )}

      {/* Join School Modal */}
      {showJoinModal && (
        <JoinSchoolModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinSchool}
        />
      )}
    </div>
  );
}

function CreateSchoolModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, domain?: string, address?: string) => void;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name, domain || undefined, address || undefined);
    setLoading(false);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create New School</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">School Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Lincoln High School"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email Domain (optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., lincolnhs.edu"
              className="input input-bordered"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Address (optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 123 Main St, City, State"
              className="input input-bordered"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading || !name.trim()}
            >
              Create School
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

function JoinSchoolModal({
  onClose,
  onJoin,
}: {
  onClose: () => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    await onJoin(code);
    setLoading(false);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Join a School</h3>
        <p className="text-base-content/60 mt-2">
          Enter the staff invite code provided by your school administrator.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Invite Code</span>
            </label>
            <input
              type="text"
              placeholder="Enter code"
              className="input input-bordered text-center font-mono uppercase tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              required
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading || !code.trim()}
            >
              Join School
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
