import { Layers, Lock, ShieldCheck, Warehouse, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";

const TRUST_ITEMS = [
  { icon: Zap, title: "AUTO DELIVERY", desc: "ส่งสินค้าดิจิทัลโดยระบบหลังบ้าน ไม่ต้องรอแอดมิน", pct: 100 },
  { icon: Lock, title: "ANTI DOUBLE-SELL", desc: "ล็อกโค้ดต่อคำสั่งซื้อแบบอะตอมมิก ขายซ้ำไม่ได้", pct: 100 },
  { icon: ShieldCheck, title: "SERVER-SIDE PRICE", desc: "ราคา/สต๊อกอ้างอิงฝั่งเซิร์ฟเวอร์เสมอ ไม่เชื่อค่าจากไคลเอนต์", pct: 100 },
  { icon: Warehouse, title: "LIVE STOCK", desc: "ตรวจสอบสต๊อกจริงก่อนยืนยันคำสั่งซื้อทุกครั้ง", pct: 100 },
];

export function TrustSection() {
  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <h2 className="text-sm font-bold tracking-[0.2em] text-muted">SYSTEM STATUS</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc, pct }, i) => (
            <Card
              key={title}
              brackets
              className="animate-fade-up p-6 transition-colors hover:border-border-strong"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="clip-x-sm flex h-11 w-11 items-center justify-center bg-primary/10 text-primary-strong">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-success">ACTIVE</span>
              </div>
              <h3 className="mt-4 text-sm font-bold tracking-wide text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{desc}</p>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
