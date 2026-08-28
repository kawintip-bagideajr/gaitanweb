/**
 * Single source of truth for brand placeholder.
 * Swap STORE_NAME here when the real brand name is decided —
 * nothing else in the codebase should hardcode a name.
 */
export const STORE_NAME = "{{STORE_NAME}}";

export const SITE_CONFIG = {
  name: STORE_NAME,
  tagline: "DIGITAL GAMING MARKETPLACE",
  description:
    "จำหน่ายสินค้าดิจิทัลสำหรับเกม พร้อมระบบจัดส่งอัตโนมัติและการจัดการคำสั่งซื้อที่ปลอดภัย",
  nav: [
    { label: "หน้าแรก", href: "/" },
    { label: "เกม", href: "/games" },
    { label: "สินค้า", href: "/products" },
    { label: "วิธีใช้งาน", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
  ],
  footer: {
    product: [
      { label: "สินค้า", href: "/products" },
      { label: "เกม", href: "/games" },
      { label: "วิธีใช้งาน", href: "/how-it-works" },
      { label: "FAQ", href: "/faq" },
    ],
    support: [
      { label: "ติดต่อเรา", href: "/contact" },
      { label: "Discord", href: "#" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
} as const;
