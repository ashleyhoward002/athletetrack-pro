import Link from "next/link";
import CreateProgramForm from "@/components/training/CreateProgramForm";

export default function NewProgramPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/training" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold">Create Training Program</h1>
                        <p className="text-base-content/60">
                            Build a custom workout program with drills for each day.
                        </p>
                    </div>
                </div>

                <CreateProgramForm />
            </div>
        </main>
    );
}
