"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface ChildData {
  link_id: string;
  relationship: string;
  student: {
    id: string;
    grade: string;
    enrollment_status: string;
    age: number;
  };
  athlete: {
    id: string;
    name: string;
    primary_sport: string;
    sports: string[];
    position: string | null;
    jersey_number: number | null;
  };
  school: {
    id: string;
    name: string;
    address: string;
  } | null;
  recent_games: Array<{
    id: string;
    date: string;
    opponent: string;
    sport: string;
    stats: Record<string, number>;
  }>;
  stats_summary: Record<string, number>;
  total_games: number;
}

interface StudentData {
  student: {
    id: string;
    grade: string;
    enrollment_status: string;
  };
  athlete: {
    id: string;
    name: string;
    primary_sport: string;
    sports: string[];
    position: string | null;
    jersey_number: number | null;
  };
  school: {
    id: string;
    name: string;
    address: string;
  } | null;
  recent_games: Array<{
    id: string;
    date: string;
    opponent: string;
    sport: string;
    stats: Record<string, number>;
  }>;
  stats_summary: Record<string, number>;
  total_games: number;
}

export default function MyStatsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    checkRoleAndFetchData();
  }, []);

  const checkRoleAndFetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Get user's role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const userRole = profile?.role || "member";
      setRole(userRole);

      if (userRole === "parent") {
        // Fetch children for parent
        const response = await fetch("/api/parent/children");
        const data = await response.json();
        if (response.ok) {
          setChildren(data.children || []);
          if (data.children?.length > 0) {
            setSelectedChild(data.children[0]);
          }
        }
      } else if (userRole === "student") {
        // Fetch student's own data
        const response = await fetch("/api/student/join");
        const data = await response.json();
        if (response.ok) {
          setStudentData(data);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // No linked children/profile
  if (role === "parent" && children.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl max-w-lg mx-auto">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold">No Children Linked</h2>
            <p className="text-base-content/60 mt-2">
              You haven&apos;t linked any children to your account yet. Use an
              invite code from your child&apos;s school to get started.
            </p>
            <Link href="/join/parent" className="btn btn-primary mt-6">
              Enter Invite Code
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (role === "student" && !studentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl max-w-lg mx-auto">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold">Profile Not Linked</h2>
            <p className="text-base-content/60 mt-2">
              Your account isn&apos;t linked to a student profile yet. Use the
              invite code from your school to get started.
            </p>
            <Link href="/join/student" className="btn btn-primary mt-6">
              Enter Invite Code
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not a parent or student
  if (role !== "parent" && role !== "student") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl max-w-lg mx-auto">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold">Welcome!</h2>
            <p className="text-base-content/60 mt-2">
              This page is for parents and students to view their stats. Choose
              an option below:
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/join/parent" className="btn btn-primary">
                I&apos;m a Parent
              </Link>
              <Link href="/join/student" className="btn btn-outline">
                I&apos;m a Student (13+)
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parent view
  if (role === "parent" && selectedChild) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Children&apos;s Stats</h1>
            <p className="text-base-content/60 mt-1">
              View your children&apos;s athletic performance
            </p>
          </div>
        </div>

        {/* Child selector if multiple children */}
        {children.length > 1 && (
          <div className="tabs tabs-boxed mb-6 w-fit">
            {children.map((child) => (
              <button
                key={child.link_id}
                className={`tab ${selectedChild.link_id === child.link_id ? "tab-active" : ""}`}
                onClick={() => setSelectedChild(child)}
              >
                {child.athlete.name}
              </button>
            ))}
          </div>
        )}

        <AthleteStatsView data={selectedChild} isParent />
      </div>
    );
  }

  // Student view
  if (role === "student" && studentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Stats</h1>
            <p className="text-base-content/60 mt-1">
              View your athletic performance
            </p>
          </div>
        </div>

        <AthleteStatsView data={studentData} isParent={false} />
      </div>
    );
  }

  return null;
}

function AthleteStatsView({
  data,
  isParent,
}: {
  data: ChildData | StudentData;
  isParent: boolean;
}) {
  const athlete = data.athlete;
  const school = data.school;
  const recentGames = data.recent_games;
  const statsSummary = data.stats_summary;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <span className="text-2xl">
                  {athlete.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{athlete.name}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {school && (
                  <span className="badge badge-outline">{school.name}</span>
                )}
                {"student" in data && data.student.grade && (
                  <span className="badge badge-ghost">
                    Grade {data.student.grade}
                  </span>
                )}
                <span className="badge badge-primary capitalize">
                  {athlete.primary_sport}
                </span>
                {athlete.position && (
                  <span className="badge badge-secondary">
                    {athlete.position}
                  </span>
                )}
                {athlete.jersey_number && (
                  <span className="badge">#{athlete.jersey_number}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {Object.keys(statsSummary).length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Season Averages</h3>
            <p className="text-sm text-base-content/60 mb-4">
              Based on {data.total_games} game{data.total_games !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statsSummary).map(([key, value]) => (
                <div key={key} className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title text-xs capitalize">
                    {key.replace(/_/g, " ")}
                  </div>
                  <div className="stat-value text-2xl">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Games */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Recent Games</h3>
          {recentGames.length === 0 ? (
            <p className="text-base-content/60">No games recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Opponent</th>
                    <th>Sport</th>
                    <th>Key Stats</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGames.map((game) => (
                    <tr key={game.id}>
                      <td>{new Date(game.date).toLocaleDateString()}</td>
                      <td>{game.opponent}</td>
                      <td className="capitalize">{game.sport}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(game.stats || {})
                            .slice(0, 3)
                            .map(([key, val]) => (
                              <span
                                key={key}
                                className="badge badge-sm badge-ghost"
                              >
                                {key}: {val}
                              </span>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
