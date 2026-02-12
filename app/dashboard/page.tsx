import StatsOverview from "@/components/sports/StatsOverview";
import QuickGameEntry from "@/components/sports/QuickGameEntry";
import RecentGames from "@/components/sports/RecentGames";
import ProgressTracking from "@/components/sports/ProgressTracking";
import PhysicalDevelopment from "@/components/sports/PhysicalDevelopment";
import SplitText from "@/components/ui/SplitText";
import QuickDrills from "@/components/dashboard/QuickDrills";
import UpcomingGames from "@/components/dashboard/UpcomingGames";
import RoleBasedActions, { RoleBadge } from "@/components/dashboard/RoleBasedActions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
      <div className="p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  <SplitText text="Dashboard" animationType="blur" delay={80} />
                </h1>
                <RoleBadge />
              </div>
              <p className="text-base-content/70 mt-1">Track, analyze, and improve your game</p>
            </div>
          </div>

          {/* Quick Actions Bar - Role-based */}
          <RoleBasedActions />

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
