import { Layers, ShieldCheck, Warehouse, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";

const TRUST_ITEMS = [
  { icon: Zap, title: "AUTO DELIVERY", desc: "ส่งสินค้าดิจิทัลโดยระบบหลังบ้าน" },
  { icon: Warehouse, title: "READY STOCK", desc: "ตรวจสอบสต๊อกก่อนซื้อ" },
  { icon: ShieldCheck, title: "SECURE", desc: "ปกป้องข้อมูลและคำสั่งซื้อ" },
  { icon: Layers, title: "MULTI GAME", desc: "รองรับการขยายไปหลายเกมในอนาคต" },
];

export function TrustSection() {
  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <Card key={title} brackets className="p-6 transition-colors hover:border-border-strong">
              <div className="clip-x-sm mb-4 flex h-11 w-11 items-center justify-center bg-primary/10 text-primary-strong">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold tracking-wide text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
