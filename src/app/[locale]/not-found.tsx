import { ButtonLink } from "@/components/ui";

// Idioma: el not-found de segmento no recibe params; mostramos ambos idiomas para no adivinar.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="font-display text-7xl text-sv-pink">404</p>
      <h1 className="mt-4 font-display text-3xl">Esta página no existe · This page does not exist</h1>
      <p className="mt-2 text-neutral-700">El enlace cambió o el contenido ya no está disponible. / The link may have changed or the content is no longer available.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Volver al inicio</ButtonLink>
        <ButtonLink href="/en" variant="light">Back to home</ButtonLink>
      </div>
    </div>
  );
}
