import Link from "next/link";

/**
 * Logotipo provisional hecho con CSS/tipografía.
 * Para usar el definitivo: coloca `public/brand/logo.svg` y reemplaza el contenido de este
 * componente por <Image src="/brand/logo.svg" alt="Sin Varo Cancún" width={120} height={64} />.
 */
export function Logo({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link href={href} aria-label="Sin Varo Cancún" className={`inline-flex flex-col leading-[0.85] ${className}`}>
      <span className="font-display text-[1.65rem] tracking-tight text-sv-black -rotate-3">SIN</span>
      <span className="font-display text-[1.65rem] tracking-tight text-sv-black -rotate-3">VARO</span>
      <span className="mt-0.5 -rotate-3 self-start rounded-sm bg-sv-yellow px-1 font-accent text-[0.6rem] tracking-widest text-sv-black">CANCÚN</span>
    </Link>
  );
}
