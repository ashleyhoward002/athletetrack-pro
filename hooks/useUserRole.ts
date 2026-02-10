"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export type UserRole = "admin" | "member" | "coach";

interface UserRoleState {
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isMember: boolean;
  userId: string | null;
}

export function useUserRole(): UserRoleState {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching role:", error);
        }

        setRole(data?.role || "member");
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isMember: role === "member",
    userId,
  };
}
