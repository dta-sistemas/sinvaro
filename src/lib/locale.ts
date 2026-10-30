import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/schemas";

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

export async function getLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
