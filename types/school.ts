// ============================================================
// School Types
// ============================================================

export type SchoolRole = "owner" | "admin" | "teacher";
export type EnrollmentStatus = "active" | "inactive" | "graduated" | "transferred";
export type SubscriptionStatus = "trial" | "active" | "suspended" | "cancelled";
export type ParentRelationship = "parent" | "guardian" | "other";

export interface School {
  id: string;
  name: string;
  domain: string | null;
  address: string | null;
  admin_user_id: string | null;
  invite_code: string;
  parent_invite_code: string;
  max_students: number;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  // Computed fields
  student_count?: number;
  member_count?: number;
}

export interface SchoolMember {
  id: string;
  school_id: string;
  user_id: string;
  role: SchoolRole;
  joined_at: string;
  // Joined fields
  display_name?: string;
  email?: string;
  avatar_url?: string | null;
}

export interface SchoolStudent {
  id: string;
  school_id: string;
  athlete_id: string;
  student_user_id: string | null;
  grade: string | null;
  enrollment_status: EnrollmentStatus;
  birth_date: string;
  student_invite_code: string | null;
  created_at: string;
  // Computed fields
  age?: number;
  can_have_account?: boolean; // true if 13+
  has_account?: boolean; // true if student_user_id is set
  // Joined fields from athletes table
  athlete_name?: string;
  athlete?: {
    id: string;
    name: string;
    primary_sport: string;
    sports: string[];
    position: string | null;
    jersey_number: number | null;
  };
}

export interface ParentStudentLink {
  id: string;
  parent_user_id: string | null;
  school_student_id: string;
  relationship: ParentRelationship;
  invite_code: string;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  // Joined fields
  student?: SchoolStudent;
  parent_name?: string;
  parent_email?: string;
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface CreateSchoolRequest {
  name: string;
  domain?: string;
  address?: string;
}

export interface UpdateSchoolRequest {
  name?: string;
  domain?: string;
  address?: string;
  max_students?: number;
}

export interface EnrollStudentRequest {
  name: string;
  birth_date: string; // ISO date string
  grade?: string;
  primary_sport?: string;
  sports?: string[];
  position?: string;
  jersey_number?: number;
}

export interface UpdateStudentRequest {
  grade?: string;
  enrollment_status?: EnrollmentStatus;
  position?: string;
  jersey_number?: number;
}

export interface JoinSchoolRequest {
  invite_code: string;
}

export interface ParentJoinRequest {
  invite_code: string;
}

export interface StudentJoinRequest {
  invite_code: string;
}

export interface GenerateCodesResponse {
  parent_invite_codes: Array<{
    invite_code: string;
    relationship: ParentRelationship;
  }>;
  student_invite_code?: string; // Only if student is 13+
}

// ============================================================
// Dashboard View Types
// ============================================================

export interface SchoolDashboardData {
  school: School;
  members: SchoolMember[];
  students: SchoolStudent[];
  recent_activity?: Array<{
    type: "enrollment" | "game" | "parent_joined" | "student_joined";
    description: string;
    timestamp: string;
  }>;
}

export interface ParentDashboardData {
  children: Array<{
    student: SchoolStudent;
    school: School;
    recent_games: Array<{
      id: string;
      date: string;
      opponent: string;
      sport: string;
      stats: Record<string, unknown>;
    }>;
    stats_summary: Record<string, unknown>;
  }>;
}

export interface StudentDashboardData {
  student: SchoolStudent;
  school: School;
  recent_games: Array<{
    id: string;
    date: string;
    opponent: string;
    sport: string;
    stats: Record<string, unknown>;
  }>;
  stats_summary: Record<string, unknown>;
}
