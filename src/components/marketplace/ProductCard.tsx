"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatTHB, getProductTier, TIER_STYLES } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types";

// Decorative reference cap for the stock bar — not a real inventory ceiling,
// just what reads as a "full" bar in the HUD-style meter.
const STOCK_BAR_CAP = 10;

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockCount > 0;
  const lowStock = inStock && product.stockCount <= 10;
  const { addItem } = useCart();
  const router = useRouter();
  const tier = getProductTier(product.price);
  const tierStyle = TIER_STYLES[tier];
  const stockPct = Math.round((Math.min(product.stockCount, STOCK_BAR_CAP) / STOCK_BAR_CAP) * 100);

  return (
    <Card
      brackets
      className={cn(
        "group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1",
        tierStyle.ring
      )}
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
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <Badge tone={inStock ? (lowStock ? "warning" : "success") : "neutral"}>
              {inStock ? (lowStock ? `เหลือ ${product.stockCount}` : "พร้อมส่ง") : "หมดสต๊อก"}
            </Badge>
            <Badge tone={tierStyle.badgeTone} className="font-bold tracking-wider">
              {tierStyle.label}
            </Badge>
          </div>

          {/* HUD-style stock meter */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <div
              className={cn("h-full transition-all", inStock ? tierStyle.barColor : "bg-muted-2")}
              style={{ width: `${inStock ? Math.max(stockPct, 6) : 100}%`, opacity: inStock ? 1 : 0.3 }}
            />
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
