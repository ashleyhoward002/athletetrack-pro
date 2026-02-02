import AthletesClient from "@/components/dashboard/athletes/AthletesClient";

export const dynamic = "force-dynamic";

export default function AthletesPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <AthletesClient />
    </div>
  );
}
