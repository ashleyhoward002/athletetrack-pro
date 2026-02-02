import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GlassCard } from "@/components/ui/GlassCard";
import AddDrillForm from "@/components/drills/AddDrillForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DrillsPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: drills } = await supabase
        .from("drills")
        .select("*")
        .order("created_at", { ascending: false });

    // Group by Difficulty for a nicer layout? Or just list them.
    // Let's just list them for now but use badges.

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case "Rookie": return "badge-success";
            case "Pro": return "badge-warning";
            case "All-Star": return "badge-error";
            default: return "badge-ghost";
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24 bg-gradient-to-br from-[#0A192F] to-[#004D99]">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn btn-circle btn-ghost text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-extrabold text-white">Drill Library</h1>
                        <p className="text-blue-200">Manage and assign training exercises.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Add Drill Form */}
                    <div className="lg:col-span-1">
                        <GlassCard title="Add New Drill" className="sticky top-8">
                            <AddDrillForm />
                        </GlassCard>
                    </div>

                    {/* Right Col: Drill List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {drills?.map((drill) => (
                                <GlassCard key={drill.id} className="hover:scale-[1.02] transition-transform">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="badge badge-outline text-white">{drill.category}</span>
                                        <span className={`badge ${getDifficultyColor(drill.difficulty)}`}>{drill.difficulty}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{drill.name}</h3>
                                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{drill.description}</p>
                                    {drill.video_url && (
                                        <a
                                            href={drill.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary text-sm flex items-center gap-1 hover:underline"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                            Watch Video
                                        </a>
                                    )}
                                </GlassCard>
                            ))}

                            {(!drills || drills.length === 0) && (
                                <div className="col-span-full text-center py-12 text-gray-400">
                                    No drills found. Add your first one!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
