import Image from "next/image";
import Link from "next/link";

// Full logo lockup (icon + wordmark + tagline baked into one image) —
// user-generated brand art. Source has no alpha channel (solid black
// background), so .logo-cutout (globals.css) removes it via an SVG
// brightness-to-alpha filter defined in the root layout.
export function Logo() {
  return (
    <Link href="/" className="group flex items-center transition-transform duration-300 hover:scale-105">
      <Image
        src="/logo-xelvex.png"
        alt="Xelvex — Level Up Your Game"
        width={607}
        height={607}
        priority
        className="logo-cutout h-10 w-10 object-contain sm:h-11 sm:w-11"
      />
    </Link>
  );
}
