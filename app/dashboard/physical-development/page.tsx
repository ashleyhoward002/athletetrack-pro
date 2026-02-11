import PhysicalDevelopment from "@/components/sports/PhysicalDevelopment";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PhysicalDevelopmentPage() {
  return (
    <div className="p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Physical Development</h1>
            <p className="text-base-content/70 mt-1">
              Track athletic measurements and physical progress over time
            </p>
          </div>
          <Link href="/dashboard/athletes" className="btn btn-ghost btn-sm">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Athletes
          </Link>
        </div>

        {/* Info Banner */}
        <div className="alert alert-info">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Track Physical Progress</h3>
            <p className="text-sm">
              Record physical measurements like height, weight, vertical jump, speed tests, and sport-specific metrics.
              Each sport has its own set of relevant physical tests and benchmarks.
            </p>
          </div>
        </div>

        {/* Physical Development Component */}
        <PhysicalDevelopment />

        {/* Metrics Guide */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Understanding Benchmarks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
              <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                <span className="badge badge-error">Below Avg</span>
                <span className="text-sm text-base-content/70">Needs work</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                <span className="badge badge-warning">Average</span>
                <span className="text-sm text-base-content/70">On track</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                <span className="badge badge-info">Good</span>
                <span className="text-sm text-base-content/70">Above average</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-base-100 rounded-lg">
                <span className="badge badge-success">Elite</span>
                <span className="text-sm text-base-content/70">Top tier</span>
              </div>
            </div>
            <p className="text-sm text-base-content/60 mt-3">
              Benchmarks are based on high school athletic standards. Youth athletes should use these as long-term goals.
              Click the info icon next to each metric to see detailed measurement instructions.
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Measurement Tips
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-base-content/70 mt-2">
              <li>Take measurements at the same time of day for consistency (morning is best)</li>
              <li>Record measurements monthly to track long-term progress</li>
              <li>Warm up properly before any explosive tests (jumps, sprints)</li>
              <li>Use proper technique for accurate results - click the info icons for guidance</li>
              <li>Compare progress over time rather than focusing on single measurements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
