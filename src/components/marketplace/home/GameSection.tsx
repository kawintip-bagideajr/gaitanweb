import { GameCard } from "@/components/marketplace/GameCard";
import type { Game } from "@/types";

export function GameSection({ games }: { games: Game[] }) {
  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-foreground">เลือกเกม</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
}
