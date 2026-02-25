import AthleteDetailClient from "@/components/dashboard/athletes/AthleteDetailClient";

export const dynamic = "force-dynamic";

export default function AthleteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <AthleteDetailClient athleteId={params.id} />
    </div>
  );
}
