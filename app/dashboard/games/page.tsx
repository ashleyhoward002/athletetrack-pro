import GamesClient from "@/components/dashboard/games/GamesClient";

export const dynamic = "force-dynamic";

export default function GamesPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <GamesClient />
    </div>
  );
}
