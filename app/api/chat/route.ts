export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { query, sport } = await req.json();
        const sportName = sport || "basketball";

        // Fetch user's recent games for context
        const { data: recentGames } = await supabase
            .from("games")
            .select("*")
            .eq("user_id", session.user.id)
            .order("date", { ascending: false })
            .limit(5);

        // Fetch available drills for the sport
        const { data: drills } = await supabase
            .from("drills")
            .select("name, category, difficulty, description")
            .eq("sport", sportName)
            .limit(10);

        // Build stats context from recent games
        let statsContext = "";
        if (recentGames && recentGames.length > 0) {
            statsContext = "Recent Game Stats:\n" + recentGames.map((g: any) => {
                if (sportName === "basketball") {
                    return `- vs ${g.opponent} (${g.date}): ${g.points || 0} pts, ${(g.rebounds_off || 0) + (g.rebounds_def || 0)} reb, ${g.assists || 0} ast`;
                }
                return `- vs ${g.opponent} (${g.date}): ${JSON.stringify(g.stats || {})}`;
            }).join("\n");
        }

        const drillsText = drills?.map((d: any) => `- ${d.name} (${d.category}, ${d.difficulty}): ${d.description}`).join("\n") || "";

        // Use Supabase Edge Function for AI (no external API key needed in Next.js)
        const { data, error } = await supabase.functions.invoke("ai-coach", {
            body: {
                query,
                sport: sportName,
                statsContext,
                drillsText
            }
        });

        if (error) {
            console.error("Edge function error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ answer: data.answer });

    } catch (error: any) {
        console.error("Chat error:", error?.message || error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate answer." },
            { status: 500 }
        );
    }
}
