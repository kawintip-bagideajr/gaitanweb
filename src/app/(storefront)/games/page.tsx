import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { GameCard } from "@/components/marketplace/GameCard";
import { getGames } from "@/lib/queries";

export default async function GamesPage() {
  const games = await getGames();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "หน้าแรก", href: "/" }, { label: "เกม" }]} />
      <h1 className="mt-4 mb-8 text-2xl font-bold text-foreground">เกมทั้งหมด</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
