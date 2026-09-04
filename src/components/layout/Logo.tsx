import Image from "next/image";
import Link from "next/link";

// Full logo lockup (icon + wordmark + tagline baked into one image) —
// user-generated brand art. The source has a solid near-black
// background (no alpha channel), so `mix-blend-screen` is used instead
// of a real cutout: on this site's near-black surfaces, black pixels
// blend away to the backdrop and only the bright/colored art shows.
export function Logo() {
  return (
    <Link href="/" className="group flex items-center transition-transform duration-300 hover:scale-105">
      <Image
        src="/logo-xelvex.png"
        alt="Xelvex — Level Up Your Game"
        width={607}
        height={607}
        priority
        className="h-10 w-10 object-contain mix-blend-screen sm:h-11 sm:w-11"
      />
    </Link>
  );
}
