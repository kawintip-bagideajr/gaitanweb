import { Gamepad2, Package, ShieldCheck, Zap } from "lucide-react";
import type { StoreStats } from "@/lib/queries";

export function StatsBar({ stats }: { stats: StoreStats }) {
  const TILES = [
    { icon: Gamepad2, value: String(stats.gameCount), label: "เกมยอดนิยม" },
    { icon: Package, value: `${stats.productCount}+`, label: "รายการสินค้า" },
    { icon: Zap, value: "24/7", label: "ส่งอัตโนมัติ" },
    { icon: ShieldCheck, value: "100%", label: "ป้องกันขายซ้ำ" },
  ];

  return (
    <section className="border-b border-border bg-surface/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
        {TILES.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="clip-x-sm flex flex-col items-center gap-1.5 border border-border bg-surface py-5 text-center"
          >
            <Icon className="h-5 w-5 text-primary-strong" />
            <span className="text-2xl font-extrabold text-foreground sm:text-3xl">{value}</span>
            <span className="text-xs text-muted">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
