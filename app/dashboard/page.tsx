import StatsOverview from "@/components/sports/StatsOverview";
import QuickGameEntry from "@/components/sports/QuickGameEntry";
import RecentGames from "@/components/sports/RecentGames";
import ProgressTracking from "@/components/sports/ProgressTracking";
import PhysicalDevelopment from "@/components/sports/PhysicalDevelopment";
import Link from "next/link";
import SplitText from "@/components/ui/SplitText";
import ShinyButton from "@/components/ui/ShinyButton";
import QuickDrills from "@/components/dashboard/QuickDrills";
import UpcomingGames from "@/components/dashboard/UpcomingGames";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
      <div className="p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                <SplitText text="Dashboard" animationType="blur" delay={80} />
              </h1>
              <p className="text-base-content/70 mt-1">Track, analyze, and improve your game</p>
            </div>
            <Link href="/dashboard/parent" className="btn btn-outline btn-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Parent View
            </Link>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-3">
            <label htmlFor="quick-entry-modal" className="btn btn-success">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Quick Game Entry
            </label>
            <button className="btn btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export Stats
            </button>
            <button className="btn btn-secondary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Upload Video
            </button>
            <Link href="/dashboard/drills">
              <ShinyButton variant="gradient" size="md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Drill Library
              </ShinyButton>
            </Link>
            <Link href="/dashboard/highlights" className="btn btn-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Highlights
            </Link>
          </div>

          {/* Stats Overview Cards */}
          <StatsOverview />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Game Entry */}
            <div className="lg:col-span-2 space-y-6">
              <QuickGameEntry />
              <ProgressTracking />
              <PhysicalDevelopment compact={true} />
              <RecentGames />
            </div>

            {/* Right Column: Calendar & Drills */}
            <div className="lg:col-span-1 space-y-6">
              <UpcomingGames />
              <QuickDrills />
            </div>
          </div>
        </div>

        {/* Quick Entry Modal */}
        <input type="checkbox" id="quick-entry-modal" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Quick Game Entry</h3>
            <QuickGameEntry isModal={true} />
          </div>
          <label className="modal-backdrop" htmlFor="quick-entry-modal">Close</label>
        </div>
      </div>
  );
}
