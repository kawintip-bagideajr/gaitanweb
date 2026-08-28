import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Game } from "@/types";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.slug}`} className="block">
      <Card
        brackets
        className="group relative aspect-[4/5] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      >
        {game.coverImage ? (
          <Image
            src={game.coverImage}
            alt={game.name}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-2 text-muted-2">
            <Gamepad2 className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{game.name}</h3>
            <p className="text-xs text-muted">{game.productCount} สินค้า</p>
          </div>
          <div className="clip-x-sm flex h-9 w-9 items-center justify-center border border-border-strong bg-surface/80 text-muted transition-colors group-hover:border-primary group-hover:text-primary-strong">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
