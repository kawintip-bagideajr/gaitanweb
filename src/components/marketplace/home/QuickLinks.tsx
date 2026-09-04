import Link from "next/link";
import { HelpCircle, MessageCircle, PackageSearch, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

const LINKS = [
  { href: "/products", icon: PackageSearch, label: "สินค้าขายดี", accent: "#8b5cf6" },
  { href: "/how-it-works", icon: Sparkles, label: "วิธีใช้งาน", accent: "#22d3ee" },
  { href: "/faq", icon: HelpCircle, label: "คำถามที่พบบ่อย", accent: "#f97316" },
  { href: "/contact", icon: MessageCircle, label: "ติดต่อแอดมิน", accent: "#fb7185" },
];

export function QuickLinks() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKS.map(({ href, icon: Icon, label, accent }) => (
          <Link key={href} href={href}>
            <Card
              brackets
              className="group flex flex-col items-center gap-2.5 p-5 text-center transition-colors hover:border-border-strong"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${accent}1f`, color: accent }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
