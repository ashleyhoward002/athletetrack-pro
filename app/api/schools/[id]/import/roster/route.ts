export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";

interface RosterRow {
    name: string;
    birth_date?: string;
    grade?: string;
    position?: string;
    jersey_number?: number;
    primary_sport?: string;
}

interface ImportResult {
    success: boolean;
    name: string;
    error?: string;
    athlete_id?: string;
    student_id?: string;
}

// Helper to calculate age
function calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Helper to generate invite code
function generateInviteCode(length: number = 8): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Parse various date formats
function parseDate(value: any): string | null {
    if (!value) return null;

    // If it's already a Date object (from Excel)
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }

    // If it's a number (Excel serial date)
    if (typeof value === "number") {
        const date = XLSX.SSF.parse_date_code(value);
        if (date) {
            return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
        }
    }

    // If it's a string, try parsing
    if (typeof value === "string") {
        const str = value.trim();

        // Try ISO format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            return str;
        }

        // Try MM/DD/YYYY
        const mdyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mdyMatch) {
            return `${mdyMatch[3]}-${mdyMatch[1].padStart(2, "0")}-${mdyMatch[2].padStart(2, "0")}`;
        }

        // Try DD/MM/YYYY (assume if first number > 12)
        const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmyMatch && parseInt(dmyMatch[1]) > 12) {
            return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
        }

        // Try parsing with Date
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split("T")[0];
        }
    }

    return null;
}

// Normalize column names for matching
function normalizeColumnName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Map common column name variations
const COLUMN_MAPPINGS: Record<string, string[]> = {
    name: ["name", "fullname", "playername", "studentname", "athlete", "player"],
    birth_date: ["birthdate", "dob", "dateofbirth", "birthday", "bday"],
    grade: ["grade", "year", "class", "gradelevel"],
    position: ["position", "pos", "role"],
    jersey_number: ["jersey", "jerseynumber", "number", "num", "jerseynumber"],
    primary_sport: ["sport", "primarysport", "mainsport"],
};

function mapColumns(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};

    headers.forEach((header, index) => {
        const normalized = normalizeColumnName(header);

        for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
            if (variations.includes(normalized)) {
                mapping[field] = index;
                break;
            }
        }
    });

    return mapping;
}

// POST: import roster from file
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const schoolId = params.id;

        // Check if user is admin/owner of this school
        const { data: membership } = await supabase
            .from("school_members")
            .select("role")
            .eq("school_id", schoolId)
            .eq("user_id", session.user.id)
            .single();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Get form data
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const defaultSport = formData.get("default_sport") as string || "basketball";
        const skipDuplicates = formData.get("skip_duplicates") === "true";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Read file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (rows.length < 2) {
            return NextResponse.json({ error: "File must have headers and at least one data row" }, { status: 400 });
        }

        // Map columns
        const headers = rows[0].map(h => String(h || ""));
        const columnMap = mapColumns(headers);

        if (columnMap.name === undefined) {
            return NextResponse.json({
                error: "Could not find 'Name' column. Please ensure your file has a column for player names.",
                detected_columns: headers
            }, { status: 400 });
        }

        // Check student capacity
        const { data: school } = await supabase
            .from("schools")
            .select("max_students")
            .eq("id", schoolId)
            .single();

        const { count: currentCount } = await supabase
            .from("school_students")
            .select("id", { count: "exact", head: true })
            .eq("school_id", schoolId);

        const availableSlots = school ? school.max_students - (currentCount || 0) : 500;
        const dataRows = rows.slice(1).filter(row => row[columnMap.name]);

        if (dataRows.length > availableSlots) {
            return NextResponse.json({
                error: `Can only import ${availableSlots} more students (trying to import ${dataRows.length})`
            }, { status: 400 });
        }

        // Get existing athletes for duplicate checking
        let existingNames: Set<string> = new Set();
        if (skipDuplicates) {
            const { data: existingStudents } = await supabase
                .from("school_students")
                .select("athletes(name)")
                .eq("school_id", schoolId);

            existingStudents?.forEach((s: any) => {
                if (s.athletes?.name) {
                    existingNames.add(s.athletes.name.toLowerCase().trim());
                }
            });
        }

        // Process each row
        const results: ImportResult[] = [];

        for (const row of dataRows) {
            const name = String(row[columnMap.name] || "").trim();

            if (!name) {
                continue;
            }

            // Check for duplicate
            if (skipDuplicates && existingNames.has(name.toLowerCase())) {
                results.push({
                    success: false,
                    name,
                    error: "Duplicate - skipped"
                });
                continue;
            }

            // Parse row data
            const rosterData: RosterRow = {
                name,
                birth_date: columnMap.birth_date !== undefined ? parseDate(row[columnMap.birth_date]) || undefined : undefined,
                grade: columnMap.grade !== undefined ? String(row[columnMap.grade] || "") || undefined : undefined,
                position: columnMap.position !== undefined ? String(row[columnMap.position] || "") || undefined : undefined,
                jersey_number: columnMap.jersey_number !== undefined ? parseInt(row[columnMap.jersey_number]) || undefined : undefined,
                primary_sport: columnMap.primary_sport !== undefined ? String(row[columnMap.primary_sport] || defaultSport) : defaultSport,
            };

            // Default birth date if not provided (estimate from grade or use placeholder)
            if (!rosterData.birth_date) {
                // Use a default date that makes them 14 (allows student account)
                const defaultYear = new Date().getFullYear() - 14;
                rosterData.birth_date = `${defaultYear}-01-01`;
            }

            try {
                // Create athlete
                const { data: athlete, error: athleteError } = await supabase
                    .from("athletes")
                    .insert({
                        user_id: session.user.id,
                        name: rosterData.name,
                        birth_date: rosterData.birth_date,
                        primary_sport: rosterData.primary_sport || defaultSport,
                        sports: [rosterData.primary_sport || defaultSport],
                        position: rosterData.position || null,
                        jersey_number: rosterData.jersey_number || null,
                        school: "",
                    })
                    .select()
                    .single();

                if (athleteError || !athlete) {
                    results.push({
                        success: false,
                        name,
                        error: athleteError?.message || "Failed to create athlete"
                    });
                    continue;
                }

                // Calculate age and generate codes
                const age = calculateAge(rosterData.birth_date);
                const studentInviteCode = age >= 13 ? generateInviteCode(10) : null;

                // Create school student
                const { data: student, error: studentError } = await supabase
                    .from("school_students")
                    .insert({
                        school_id: schoolId,
                        athlete_id: athlete.id,
                        grade: rosterData.grade || null,
                        birth_date: rosterData.birth_date,
                        student_invite_code: studentInviteCode,
                    })
                    .select()
                    .single();

                if (studentError || !student) {
                    // Rollback athlete
                    await supabase.from("athletes").delete().eq("id", athlete.id);
                    results.push({
                        success: false,
                        name,
                        error: studentError?.message || "Failed to create student"
                    });
                    continue;
                }

                // Create parent invite link
                await supabase
                    .from("parent_student_links")
                    .insert({
                        school_student_id: student.id,
                        relationship: "parent",
                    });

                existingNames.add(name.toLowerCase());

                results.push({
                    success: true,
                    name,
                    athlete_id: athlete.id,
                    student_id: student.id
                });

            } catch (err: any) {
                results.push({
                    success: false,
                    name,
                    error: err.message || "Unknown error"
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            message: `Imported ${successCount} students${failCount > 0 ? `, ${failCount} failed` : ""}`,
            results,
            summary: {
                total: results.length,
                success: successCount,
                failed: failCount,
                columns_detected: Object.keys(columnMap)
            }
        });

    } catch (error: any) {
        console.error("Roster import error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to import roster" },
            { status: 500 }
        );
    }
}
