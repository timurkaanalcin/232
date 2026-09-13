import { describe, expect, it } from "vitest";
import { filterVehicles } from "@/data/store";
import { estimateValuation } from "@/data/valuation";
import { formatTRY } from "@/lib/money";
import { slugify } from "@/data/store";

describe("vehicle filters", () => {
  it("filters available inventory by brand and fuel", () => {
    const { items, total } = filterVehicles({ brand: "Toyota", fuel: "hibrit", status: "available", pageSize: 20 });
    expect(total).toBeGreaterThan(0);
    expect(items.every((v) => v.brand === "Toyota" && v.fuel === "hibrit")).toBe(true);
  });

  it("sorts by price ascending", () => {
    const { items } = filterVehicles({ sort: "price_asc", status: "available", pageSize: 20 });
    const prices = items.map((v) => v.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

describe("valuation", () => {
  it("returns a 7-day window around a mid estimate", () => {
    const result = estimateValuation({
      year: 2021,
      brand: "Volkswagen",
      model: "Golf",
      transmission: "otomatik",
      km: 40000,
      condition: { hasar: "yok", boya: "orijinal", tramer: "yok", sigara: "hayir", bakim: "yetkili" },
      name: "Test",
      email: "test@example.com",
      phone: "05550000000",
    });
    expect(result.estimateMin).toBeLessThan(result.estimateMid);
    expect(result.estimateMax).toBeGreaterThan(result.estimateMid);
    expect(result.validUntil).toBeGreaterThan(Date.now());
  });

  it("discounts heavy damage", () => {
    const clean = estimateValuation({
      year: 2020,
      brand: "Fiat",
      model: "Egea",
      transmission: "manuel",
      km: 60000,
      condition: { hasar: "yok" },
      name: "A",
      email: "a@b.com",
      phone: "1",
    });
    const damaged = estimateValuation({
      year: 2020,
      brand: "Fiat",
      model: "Egea",
      transmission: "manuel",
      km: 60000,
      condition: { hasar: "agir" },
      name: "A",
      email: "a@b.com",
      phone: "1",
    });
    expect(damaged.estimateMid).toBeLessThan(clean.estimateMid);
  });
});

describe("formatters", () => {
  it("formats TRY in Turkish locale", () => {
    expect(formatTRY(1_285_000)).toMatch(/1.285.000|1\.285\.000/);
  });

  it("slugifies Turkish characters", () => {
    expect(slugify("Şişli Üstü")).toBe("sisli-ustu");
  });
});
