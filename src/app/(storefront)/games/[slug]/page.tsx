import { notFound } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAllProducts, getGameBySlug } from "@/lib/queries";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const products = await getAllProducts(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "หน้าแรก", href: "/" }, { label: "เกม", href: "/games" }, { label: game.name }]} />

      <div className="mt-4 mb-8 flex items-center gap-4">
        <div className="clip-x-md flex h-16 w-16 items-center justify-center border border-border bg-surface-2 text-muted-2">
          <Gamepad2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{game.name}</h1>
          <p className="text-sm text-muted">{products.length} สินค้า</p>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState title="ยังไม่มีสินค้าสำหรับเกมนี้" description="กลับมาดูใหม่อีกครั้งเร็ว ๆ นี้" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
