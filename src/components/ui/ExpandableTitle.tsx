"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Same rough "does this need a toggle" heuristic as ReadMore, tuned for a
// single-line title context (shorter threshold since there's less room).
const CHARS_PER_LINE = 40;

export function ExpandableTitle({ text, className }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > CHARS_PER_LINE;

  return (
    <div>
      <p className={cn(className, !expanded && isLong && "truncate")}>{text}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-primary-soft transition-colors hover:text-primary-strong"
        >
          {expanded ? "ย่อข้อความ" : "ดูเพิ่มเติม"}
        </button>
      )}
    </div>
  );
}
