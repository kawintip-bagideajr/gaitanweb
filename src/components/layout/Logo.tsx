import { useId } from "react";
import Link from "next/link";
import { STORE_NAME } from "@/lib/site-config";

export function Logo() {
  const gradId = `xmark-${useId()}`;

  return (
    <Link href="/" className="group flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 shrink-0 drop-shadow-[0_0_10px_rgba(139,92,246,0.55)] transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <radialGradient id={gradId} cx="16" cy="16" r="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary-soft)" />
          </radialGradient>
        </defs>
        <polygon points="16,16 28,4 25,10" fill={`url(#${gradId})`} />
        <polygon points="16,16 4,4 7,10" fill={`url(#${gradId})`} />
        <polygon points="16,16 4,28 7,22" fill={`url(#${gradId})`} />
        <polygon points="16,16 28,28 25,22" fill={`url(#${gradId})`} />
      </svg>
      <span className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary-soft">
        {STORE_NAME}
      </span>
    </Link>
  );
}
