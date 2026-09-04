import Link from "next/link";
import { PackageSearch, Search } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { cn, TIER_STYLES } from "@/lib/utils";
import { getAllProducts, getGames } from "@/lib/queries";

// See src/app/(storefront)/games/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; q?: string }>;
}) {
  const { game: gameSlug, q } = await searchParams;
  const [games, products] = await Promise.all([getGames(), getAllProducts(gameSlug, q)]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "หน้าแรก", href: "/" }, { label: "สินค้า" }]} />

      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">สินค้าทั้งหมด</h1>
        <div className="flex items-center gap-4">
          <form method="GET" className="clip-x-sm flex h-10 w-56 items-center gap-2 border border-border bg-surface-2 px-3">
            {gameSlug && <input type="hidden" name="game" value={gameSlug} />}
            <Search className="h-4 w-4 text-muted-2" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="ค้นหาสินค้า..."
              className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-2 outline-none"
            />
          </form>
          <span className="text-sm text-muted">{products.length} รายการ</span>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-2">ระดับสินค้า:</span>
        {Object.values(TIER_STYLES).map((t) => (
          <Badge key={t.label} tone={t.badgeTone} className="font-bold tracking-wider">
            {t.label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-2">
              เกม
            </h3>
            <div className="flex flex-col gap-1">
              <Link
                href={q ? `/products?q=${encodeURIComponent(q)}` : "/products"}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  !gameSlug ? "bg-primary/10 text-primary-soft" : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                ทั้งหมด
              </Link>
              {games.map((g) => (
                <Link
                  key={g.id}
                  href={`/products?game=${g.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    gameSlug === g.slug
                      ? "bg-primary/10 text-primary-soft"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  {g.name}
                  <span className="text-xs text-muted-2">{g.productCount}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="ไม่พบสินค้า"
              description={q ? `ไม่พบสินค้าที่ตรงกับ "${q}"` : "ลองเลือกเกมอื่น หรือกลับมาดูใหม่อีกครั้ง"}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
