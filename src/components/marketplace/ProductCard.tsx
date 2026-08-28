"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatTHB } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockCount > 0;
  const lowStock = inStock && product.stockCount <= 10;
  const { addItem } = useCart();
  const router = useRouter();

  return (
    <Card
      brackets
      className="group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-2">
              <Zap className="h-8 w-8" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge tone={inStock ? (lowStock ? "warning" : "success") : "neutral"}>
              {inStock ? (lowStock ? `เหลือ ${product.stockCount}` : "พร้อมส่ง") : "หมดสต๊อก"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-2">
            {product.gameName}
          </span>
          <h3 className="text-sm font-semibold text-foreground">{product.title}</h3>
          {product.subtitle && (
            <p className="text-sm text-primary-soft">{product.subtitle}</p>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-border p-4">
        <span className="text-lg font-bold text-foreground">{formatTHB(product.price)}</span>
        <Button
          size="sm"
          disabled={!inStock}
          className={cn(!inStock && "cursor-not-allowed")}
          onClick={() => {
            addItem(product, 1);
            router.push("/cart");
          }}
        >
          {inStock ? "ซื้อเลย" : "หมด"}
        </Button>
      </div>
    </Card>
  );
}
