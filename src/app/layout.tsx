import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { SITE_CONFIG } from "@/lib/site-config";
import { CartProvider } from "@/lib/cart-store";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — Digital Gaming Marketplace`,
  description: SITE_CONFIG.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Hidden filter def, referenced by .logo-cutout (globals.css) —
            turns the logo art's black background transparent based on
            pixel brightness, since the source PNG has no alpha channel.
            More robust than mix-blend-mode, which stops working once an
            ancestor (animation/transform/overflow) creates a new
            stacking context. */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="logo-cutout-filter">
            {/* Alpha row is luma weights boosted ~1.8x (clamps to fully
                opaque past a moderate brightness) so mid-tones read as
                solid color instead of a faded, translucent wash. */}
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0.38 1.29 0.13 0 0"
            />
          </filter>
        </svg>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
