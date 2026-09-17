"use client";

import { useState } from "react";

// Roughly how many characters fit within `lines` at the description's usual
// width before it needs a toggle — good enough as a show/hide heuristic
// without measuring the actual rendered height.
const CHARS_PER_LINE = 70;

export function ReadMore({ text, lines = 3 }: { text: string; lines?: number }) {
  const [expanded, setExpanded] = useState(false);
  const threshold = CHARS_PER_LINE * lines;
  const isLong = text.length > threshold;

  return (
    <div>
      <p
        style={
          !expanded && isLong
            ? { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }
            : undefined
        }
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-primary-soft transition-colors hover:text-primary-strong"
        >
          {expanded ? "แสดงน้อยลง" : "อ่านเพิ่มเติม"}
        </button>
      )}
    </div>
  );
}
