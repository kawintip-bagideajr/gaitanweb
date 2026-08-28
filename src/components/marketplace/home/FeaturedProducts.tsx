import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-foreground">สินค้าแนะนำ</h2>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary-soft"
        >
          ดูทั้งหมด
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
