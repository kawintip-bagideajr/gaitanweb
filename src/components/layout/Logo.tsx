import Link from "next/link";
import { STORE_NAME } from "@/lib/site-config";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span
        className="clip-x-sm relative flex h-8 w-8 items-center justify-center text-primary-foreground"
        style={{ background: "linear-gradient(135deg, var(--primary), #c026d3)" }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M5 5L19 19M19 5L5 19" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-base font-bold tracking-tight text-foreground group-hover:text-primary-soft transition-colors">
        {STORE_NAME}
      </span>
    </Link>
  );
}
