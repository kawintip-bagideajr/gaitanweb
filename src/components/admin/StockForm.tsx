"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ProductOption {
  id: string;
  title: string;
  subtitle: string | null;
}

export function StockForm({ products }: { products: ProductOption[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [codes, setCodes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const codeCount = codes.split("\n").map((c) => c.trim()).filter(Boolean).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, codes }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "เพิ่มสต๊อกไม่สำเร็จ");
      return;
    }

    router.push("/admin/stock");
    router.refresh();
  }

  return (
    <Card className="max-w-xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">สินค้า</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="clip-x-sm h-11 w-full border border-border bg-surface-2 px-4 text-sm text-foreground outline-none focus:border-primary"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.subtitle}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">โค้ด (บรรทัดละ 1 โค้ด)</label>
          <textarea
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            rows={8}
            placeholder={"RBLX-XXXX-XXXX-XXXX\nRBLX-YYYY-YYYY-YYYY"}
            className="clip-x-sm w-full resize-none border border-border bg-surface-2 p-3 font-mono text-xs text-foreground placeholder:text-muted-2 outline-none focus:border-primary"
          />
          <span className="text-xs text-muted-2">{codeCount} โค้ด</span>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={submitting || codeCount === 0}>
            {submitting ? "กำลังเพิ่ม..." : `เพิ่ม ${codeCount || ""} โค้ด`}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/stock")}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </Card>
  );
}
