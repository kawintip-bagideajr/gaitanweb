"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, Zap } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTHB } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";

export default function CartPage() {
  const { items, setQuantity, removeItem, subtotal } = useCart();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "หน้าแรก", href: "/" }, { label: "ตะกร้าสินค้า" }]} />
      <h1 className="mt-4 mb-8 text-2xl font-bold text-foreground">ตะกร้าสินค้า</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="ตะกร้าว่างเปล่า"
          description="ยังไม่มีสินค้าในตะกร้า เลือกซื้อสินค้าที่ต้องการได้เลย"
          action={
            <Link href="/products">
              <Button className="mt-2">เลือกซื้อสินค้า</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Card key={item.productId} className="flex items-center gap-4 p-4">
                <div className="clip-x-sm flex h-16 w-16 shrink-0 items-center justify-center bg-surface-2 text-muted-2">
                  <Zap className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs uppercase tracking-wide text-muted-2">
                    {item.gameName}
                  </span>
                  <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted">{formatTHB(item.price)}</p>
                </div>

                <div className="clip-x-sm flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center text-muted hover:text-foreground"
                    aria-label="ลดจำนวน"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center text-muted hover:text-foreground"
                    aria-label="เพิ่มจำนวน"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span className="w-24 shrink-0 text-right text-sm font-bold text-foreground">
                  {formatTHB(item.price * item.quantity)}
                </span>

                <button
                  onClick={() => removeItem(item.productId)}
                  aria-label="ลบสินค้า"
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-2 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>

          <Card className="h-fit p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">สรุปคำสั่งซื้อ</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>ยอดรวมสินค้า</span>
                <span>{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
                <span>ยอดชำระทั้งหมด</span>
                <span>{formatTHB(subtotal)}</span>
              </div>
            </div>
            <Button className="mt-5 w-full" size="lg" onClick={() => router.push("/checkout")}>
              ดำเนินการชำระเงิน
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
