"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface GameOption {
  id: string;
  name: string;
}

export interface ProductFormValues {
  id?: string;
  gameId: string;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  autoDelivery: boolean;
}

export function ProductForm({ games, initial }: { games: GameOption[]; initial?: ProductFormValues }) {
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? { gameId: games[0]?.id ?? "", title: "", subtitle: "", category: "", price: 0, autoDelivery: true }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: values.gameId,
        title: values.title,
        subtitle: values.subtitle,
        category: values.category,
        price: Number(values.price),
        autoDelivery: values.autoDelivery,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <Card className="max-w-xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">เกม</label>
          <select
            value={values.gameId}
            onChange={(e) => setValues((v) => ({ ...v, gameId: e.target.value }))}
            className="clip-x-sm h-11 w-full border border-border bg-surface-2 px-4 text-sm text-foreground outline-none focus:border-primary"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="ชื่อสินค้า"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="Roblox Gift Card"
          required
        />
        <Input
          label="รายละเอียดย่อย (เช่น จำนวน ROBUX)"
          value={values.subtitle}
          onChange={(e) => setValues((v) => ({ ...v, subtitle: e.target.value }))}
          placeholder="500 ROBUX"
        />
        <Input
          label="หมวดหมู่ (เช่น Robux, Blox Fruits, เพชร) — ไม่บังคับ"
          value={values.category}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          placeholder="Robux"
        />
        <Input
          label="ราคา (บาท)"
          type="number"
          min={1}
          value={values.price}
          onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
          required
        />

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={values.autoDelivery}
            onChange={(e) => setValues((v) => ({ ...v, autoDelivery: e.target.checked }))}
            className="h-4 w-4 rounded border-border-strong bg-surface-2 accent-primary"
          />
          จัดส่งอัตโนมัติ (Auto Delivery)
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างสินค้า"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </Card>
  );
}
