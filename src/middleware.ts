import { NextResponse, type NextRequest } from "next/server";
import { SEGMENTS } from "@/i18n/routes";

const entries = Object.values(SEGMENTS);
const enToEs = new Map<string, string>(entries.map((s) => [s.en, s.es]));
const esSet = new Set<string>(entries.map((s) => s.es));

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (isEn) {
    const segs = pathname.slice(3).split("/").filter(Boolean);
    const [first, ...rest] = segs;
    if (first && enToEs.has(first)) {
      const es = enToEs.get(first)!;
      url.pathname = `/en/${[es, ...rest].join("/")}`;
      return NextResponse.rewrite(url);
    }
    // Ruta en español bajo /en/ cuyo equivalente en inglés es distinto: redirigir al canónico.
    if (first && esSet.has(first)) {
      const key = entries.find((s) => s.es === first)!;
      if (key.en !== key.es) {
        url.pathname = `/en/${[key.en, ...rest].join("/")}`;
        return NextResponse.redirect(url, 308);
      }
    }
    return NextResponse.next();
  }

  url.pathname = `/es${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
