import Image from "next/image";
import Link from "next/link";

// Full logo lockup (icon + wordmark + tagline baked into one image) —
// user-generated brand art. Shown whole rather than cropped since the
// source has no alpha/transparency to crop against cleanly.
export function Logo() {
  return (
    <Link href="/" className="group flex items-center transition-transform duration-300 hover:scale-105">
      <Image
        src="/logo-xelvex.png"
        alt="Xelvex — Level Up Your Game"
        width={607}
        height={607}
        priority
        className="h-10 w-10 object-contain sm:h-11 sm:w-11"
      />
    </Link>
  );
}
