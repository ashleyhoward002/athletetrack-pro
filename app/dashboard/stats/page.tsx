import StatsClient from "@/components/dashboard/stats/StatsClient";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <StatsClient />
    </div>
  );
}
