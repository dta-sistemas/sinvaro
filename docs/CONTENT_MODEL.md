# Modelo de contenido

Definido con Zod en `src/content/schemas.ts` (fuente de verdad). Resumen:

**Comunes:** `id` (estable), `slug` (único, `[a-z0-9-]`), `status` (`published|draft|archived`), `createdAt`, `updatedAt`, `verification {status: verified|pending, lastVerified}`, `seo?`, `photos[]`, `categoryId`, `tagIds[]`.

- **Place:** `title`, `summary`, `description`, `location {area, address?, coordinates|null}`, `access (free|paid|reservation|unknown)`, `isSecret`, `priceNote?`, `hours?`, `howToGet?`, `tips`.
- **Restaurant:** igual que Place más `mealTypes[]`, `priceBand (under50|under100|under150|unknown)` (filtro orientativo), `externalUrl?`.
- **Offer:** `business`, `benefit`, `conditions[]`, `startsAt|null`, `endsAt|null`, `couponCode|null`, `redeemUrl|null`, `featured`, `isSample`.
- **Coupon:** `offerId`, `code`, `status`.
- **Article:** `excerpt`, `body` (párrafos; `## ` = subtítulo), `author`, `publishedAt`, `featuredImage?`.
- **Category:** `kind (place|restaurant|offer|article)`, `name`, `description`, `color`, `icon`, `active`.
- **Tag:** `name`.

Los textos son `{es, en}`; ambos idiomas son obligatorios. Reglas de integridad que valida `npm run validate:content`: ids y slugs únicos, categorías existentes del `kind` correcto, tags existentes, `endsAt ≥ startsAt`, cupones que apuntan a ofertas existentes.

El modelo está pensado para mapear 1:1 a tablas de PostgreSQL en la Fase 2 (categorías en una sola tabla con `kind`).
