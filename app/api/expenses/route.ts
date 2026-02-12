export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET all expenses for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const year = searchParams.get("year");
        const sport = searchParams.get("sport");

        let query = supabase
            .from("sports_expenses")
            .select("*, athletes(name)")
            .eq("user_id", session.user.id)
            .order("expense_date", { ascending: false });

        // Filter by year if provided
        if (year) {
            query = query
                .gte("expense_date", `${year}-01-01`)
                .lte("expense_date", `${year}-12-31`);
        }

        // Filter by sport if provided
        if (sport) {
            query = query.eq("sport", sport);
        }

        const { data: expenses, error } = await query;

        if (error) throw error;

        // Calculate totals by category
        const totals: Record<string, number> = {};
        let grandTotal = 0;

        for (const expense of expenses || []) {
            const amount = parseFloat(expense.amount) || 0;
            totals[expense.category] = (totals[expense.category] || 0) + amount;
            grandTotal += amount;
        }

        return NextResponse.json({
            expenses: expenses || [],
            totals,
            grandTotal,
        });
    } catch (error) {
        console.error("GET /api/expenses error:", error);
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

// POST create a new expense
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const expenseData = {
            user_id: session.user.id,
            athlete_id: body.athlete_id || null,
            sport: body.sport || "basketball",
            category: body.category,
            description: body.description || null,
            amount: body.amount,
            expense_date: body.expense_date || new Date().toISOString().split("T")[0],
            season: body.season || null,
            is_recurring: body.is_recurring || false,
        };

        const { data, error } = await supabase
            .from("sports_expenses")
            .insert(expenseData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("POST /api/expenses error:", error);
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
    }
}

// DELETE an expense
export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        const { error } = await supabase
            .from("sports_expenses")
            .delete()
            .eq("id", id)
            .eq("user_id", session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/expenses error:", error);
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}
