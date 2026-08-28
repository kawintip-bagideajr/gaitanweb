"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatTHB } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";

const PAYMENT_METHODS = [
  { key: "truemoney", label: "TrueMoney Wallet" },
  { key: "promptpay", label: "พร้อมเพย์ / QR Code" },
  { key: "card", label: "บัตรเครดิต / เดบิต" },
] as const;

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["key"]>(PAYMENT_METHODS[0].key);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    // 1. Create the order — server recomputes price/stock from the DB,
    //    never trusts the cart's client-side numbers.
    const createRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: method,
      }),
    });
    const created = await createRes.json().catch(() => ({}));

    if (!createRes.ok) {
      setError(created.error ?? "ไม่สามารถสร้างคำสั่งซื้อได้");
      setSubmitting(false);
      return;
    }

    const orderNumber: string = created.orderNumber;
    clear();

    // 2. No real payment gateway is wired up yet — this stands in for
    //    the gateway confirming payment and firing its webhook. The
    //    result page then reads the order's real, server-decided status.
    await fetch("/api/dev/simulate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, outcome: "SUCCESS" }),
    });

    router.push(`/orders/${orderNumber}/result`);
  }

  return (
    <>
      {items.length === 0 ? (
        <EmptyState title="ไม่มีสินค้าสำหรับชำระเงิน" description="กรุณาเลือกสินค้าก่อนทำการชำระเงิน" />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Order Summary</h2>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatTHB(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">ช่องทางชำระเงิน</h2>
              <div className="flex flex-col gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMethod(m.key)}
                    className={cn(
                      "clip-x-sm flex items-center justify-between border px-4 py-3 text-left text-sm transition-colors",
                      method === m.key
                        ? "border-primary bg-primary/10 text-primary-soft"
                        : "border-border text-muted hover:border-border-strong hover:text-foreground"
                    )}
                  >
                    {m.label}
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full border-2",
                        method === m.key ? "border-primary bg-primary" : "border-border-strong"
                      )}
                    />
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <Card className="h-fit p-5">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
                <span>Total</span>
                <span>{formatTHB(subtotal)}</span>
              </div>
            </div>

            <Button className="mt-5 w-full" size="lg" disabled={submitting} onClick={handleConfirm}>
              {submitting ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
            </Button>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}

            <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-strong" />
              ระบบจะตรวจสอบการชำระเงินก่อนจัดส่งสินค้า
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
