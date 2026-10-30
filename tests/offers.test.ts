import { describe, expect, it } from "vitest";
import { getOfferStatus, todayInCancun } from "@/lib/offers";

const at = (iso: string) => new Date(iso);

describe("vigencia de ofertas", () => {
  it("activa dentro del rango", () => {
    expect(getOfferStatus({ startsAt: "2026-01-01", endsAt: "2026-12-31" }, at("2026-06-15T12:00:00Z"))).toBe("active");
  });
  it("vencida después de endsAt", () => {
    expect(getOfferStatus({ startsAt: null, endsAt: "2026-01-31" }, at("2026-02-01T12:00:00Z"))).toBe("expired");
  });
  it("próxima antes de startsAt", () => {
    expect(getOfferStatus({ startsAt: "2026-07-01", endsAt: null }, at("2026-06-15T12:00:00Z"))).toBe("upcoming");
  });
  it("sin fecha de fin se considera activa", () => {
    expect(getOfferStatus({ startsAt: null, endsAt: null }, at("2030-01-01T12:00:00Z"))).toBe("active");
  });
  it("vence al terminar el día de endsAt en hora de Cancún (UTC-5)", () => {
    expect(getOfferStatus({ startsAt: null, endsAt: "2026-01-31" }, at("2026-02-01T04:30:00Z"))).toBe("active");
    expect(getOfferStatus({ startsAt: null, endsAt: "2026-01-31" }, at("2026-02-01T05:30:00Z"))).toBe("expired");
    expect(todayInCancun(at("2026-02-01T04:30:00Z"))).toBe("2026-01-31");
  });
});
