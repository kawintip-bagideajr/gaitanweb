"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminActionButton({
  label,
  pendingLabel,
  tone = "primary",
  onClick,
}: {
  label: string;
  pendingLabel?: string;
  tone?: "primary" | "danger";
  onClick: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            await onClick();
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
          } finally {
            setPending(false);
          }
        }}
        className={cn(
          "text-xs font-medium hover:underline disabled:opacity-50",
          tone === "danger" ? "text-danger" : "text-primary-soft"
        )}
      >
        {pending ? (pendingLabel ?? "กำลังดำเนินการ...") : label}
      </button>
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </div>
  );
}

export async function patchJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "เกิดข้อผิดพลาด");
  }
  return res.json();
}
