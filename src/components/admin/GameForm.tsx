"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface GameFormValues {
  id?: string;
  name: string;
  slug: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function GameForm({ initial }: { initial?: GameFormValues }) {
  const [values, setValues] = useState<GameFormValues>(initial ?? { name: "", slug: "" });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(isEdit ? `/api/admin/games/${initial!.id}` : "/api/admin/games", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { name: values.name } : { name: values.name, slug: values.slug }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    router.push("/admin/games");
    router.refresh();
  }

  return (
    <Card className="max-w-xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="ชื่อเกม"
          value={values.name}
          onChange={(e) => {
            const name = e.target.value;
            setValues((v) => ({ ...v, name, slug: slugTouched ? v.slug : slugify(name) }));
          }}
          placeholder="Roblox"
          required
        />
        <Input
          label="Slug (ใช้ใน URL)"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setValues((v) => ({ ...v, slug: e.target.value }));
          }}
          placeholder="roblox"
          disabled={isEdit}
          required
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างเกม"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/games")}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </Card>
  );
}
