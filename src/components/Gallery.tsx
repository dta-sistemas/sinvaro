"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { fmt } from "@/i18n/dictionaries";

export interface GalleryLabels { viewGallery: string; photoOf: string; prev: string; next: string; close: string }
interface Photo { src: string; alt: string; credit?: string }

/** Foto principal + miniaturas; "Ver galería completa" abre un visor a pantalla completa (teclado: ← → Esc). */
export function Gallery({ photos, labels }: { photos: Photo[]; labels: GalleryLabels }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState(0);
  const total = photos.length;
  const go = useCallback((d: number) => setI((n) => (n + d + total) % total), [total]);
  const open = (n: number) => { setI(n); dlg.current?.showModal(); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dlg.current?.open) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (total === 0) return null;
  const thumbs = photos.slice(1, 4);
  const cur = photos[i];

  return (
    <div>
      <div className={`grid gap-2 ${thumbs.length ? "grid-cols-3 grid-rows-3" : "grid-cols-1"} h-72 sm:h-80`}>
        <button type="button" onClick={() => open(0)} aria-label={`${labels.viewGallery}: ${photos[0].alt}`}
          className={`group relative overflow-hidden rounded-2xl ${thumbs.length ? "col-span-2 row-span-3" : ""}`}>
          <Image src={photos[0].src} alt={photos[0].alt} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-black/65 px-3 py-2 text-xs font-bold text-white"><Images aria-hidden className="h-4 w-4" />{labels.viewGallery}</span>
        </button>
        {thumbs.map((p, n) => (
          <button key={p.src} type="button" onClick={() => open(n + 1)} aria-label={p.alt}
            className={`group relative overflow-hidden rounded-xl ${thumbs.length === 1 ? "row-span-3" : thumbs.length === 2 ? "row-span-3 sm:row-span-1" : ""}`}>
            <Image src={p.src} alt={p.alt} fill sizes="20vw" className="object-cover transition duration-500 group-hover:scale-105" />
          </button>
        ))}
      </div>

      <dialog ref={dlg} aria-label={labels.viewGallery} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
        className="m-0 h-full max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <p aria-live="polite" className="text-sm font-semibold">{fmt(labels.photoOf, { n: i + 1, total })}</p>
            <button type="button" onClick={() => dlg.current?.close()} aria-label={labels.close} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15"><X aria-hidden className="h-6 w-6" /></button>
          </div>
          <div className="relative flex-1">
            <Image key={cur.src} src={cur.src} alt={cur.alt} fill sizes="100vw" className="object-contain" />
            {total > 1 && (<>
              <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 hover:bg-black"><ChevronLeft aria-hidden className="h-6 w-6" /></button>
              <button type="button" onClick={() => go(1)} aria-label={labels.next} className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 hover:bg-black"><ChevronRight aria-hidden className="h-6 w-6" /></button>
            </>)}
          </div>
          <p className="px-4 py-3 text-center text-sm text-neutral-200">{cur.alt}{cur.credit ? ` · ${cur.credit}` : ""}</p>
        </div>
      </dialog>
    </div>
  );
}
