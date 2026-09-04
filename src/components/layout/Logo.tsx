import Image from "next/image";
import Link from "next/link";

// Full logo lockup (icon + wordmark + tagline baked into one image) —
// user-generated brand art. Source has no alpha channel (solid black
// background). Rather than approximating a cutout with a filter (which
// softened fine detail no matter how it was tuned), it's cropped and
// framed instead — full original sharpness, no per-pixel manipulation.
export function Logo() {
  return (
    <Link href="/" className="group flex items-center transition-transform duration-300 hover:scale-105">
      <span className="clip-x-sm relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-primary/40 shadow-[0_0_16px_-4px_var(--primary-glow)] sm:h-11 sm:w-11">
        <Image
          src="/logo-xelvex.png"
          alt="Xelvex — Level Up Your Game"
          fill
          sizes="44px"
          priority
          className="scale-125 object-cover"
        />
      </span>
    </Link>
  );
}
