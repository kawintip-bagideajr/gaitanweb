import { CreditCard, PackageOpen, ScanSearch, ShoppingBag } from "lucide-react";

const STEPS = [
  { step: "01", icon: ShoppingBag, title: "เลือกสินค้า", desc: "เลือกเกมและสินค้าที่ต้องการ" },
  { step: "02", icon: CreditCard, title: "ชำระเงิน", desc: "เลือกช่องทางชำระเงินและยืนยันรายการ" },
  { step: "03", icon: ScanSearch, title: "ระบบตรวจสอบ", desc: "ระบบตรวจสอบการชำระเงินจากฝั่ง Server" },
  { step: "04", icon: PackageOpen, title: "รับสินค้า", desc: "สินค้าจะปรากฏใน My Orders อัตโนมัติ" },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="mb-12 text-center text-2xl font-bold text-foreground">วิธีใช้งาน</h2>

      <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent lg:block" />

        {STEPS.map(({ step, icon: Icon, title, desc }, i) => (
          <div key={step} className="relative flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="clip-x-md corner-brackets relative z-10 flex h-16 w-16 items-center justify-center border border-border-strong bg-surface">
              <Icon className="h-6 w-6 text-primary-strong" />
            </div>
            <span className="mt-4 text-xs font-bold tracking-widest text-primary/70">
              STEP {step}
            </span>
            <h3 className="mt-1 text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 max-w-[200px] text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
