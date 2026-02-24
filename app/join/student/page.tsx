"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function StudentJoinPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check auth status on mount
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  });

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/student/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to join");
        setLoading(false);
        return;
      }

      toast.success(`Welcome, ${data.student?.name || "student"}!`);
      router.push("/dashboard/my-stats");
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h1 className="text-2xl font-bold">Student Access</h1>
            <p className="text-base-content/60 mt-2">
              Please sign in or create an account first, then enter your invite
              code.
            </p>
            <div className="mt-6 space-y-3">
              <Link href="/login" className="btn btn-primary btn-block">
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-outline btn-block">
                Create Account
              </Link>
            </div>
            <p className="text-sm text-base-content/50 mt-4">
              You must be 13 or older to create your own account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">Access Your Profile</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Enter the invite code provided by your school or coach
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Student Invite Code</span>
              </label>
              <input
                type="text"
                placeholder="Enter code (e.g., ABCD1234XY)"
                className="input input-bordered text-center font-mono text-lg tracking-widest uppercase"
                value={inviteCode}
                onChange={(e) =>
                  setInviteCode(e.target.value.toUpperCase().slice(0, 12))
                }
                maxLength={12}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-block ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Access My Profile"}
            </button>
          </form>

          <div className="divider">OR</div>

          <Link href="/dashboard" className="btn btn-ghost btn-block">
            Go to Dashboard
          </Link>

          <p className="text-xs text-center text-base-content/50 mt-4">
            Your school or coach should have provided this code. Contact them if
            you don&apos;t have one.
          </p>
        </div>
      </div>
    </div>
  );
}
