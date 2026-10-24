import { describe, expect, it } from "vitest";
import { translateSql } from "@/node-runtime/pg-d1";

describe("translateSql (SQLite -> PostgreSQL)", () => {
  it("numbers ? placeholders but ignores ? inside string literals", () => {
    expect(translateSql("SELECT * FROM t WHERE a = ? AND b = '?' AND c = ?")).toBe(
      "SELECT * FROM t WHERE a = $1 AND b = '?' AND c = $2",
    );
  });

  it("makes LIKE case-insensitive like SQLite", () => {
    expect(translateSql("WHERE (email LIKE ? OR name LIKE ?)")).toBe("WHERE (email ILIKE $1 OR name ILIKE $2)");
    expect(translateSql("WHERE a ILIKE ?")).toBe("WHERE a ILIKE $1");
  });

  it("casts ROUND(x, n) arguments to numeric", () => {
    expect(translateSql("SELECT ROUND(last_lat, 1) AS lat")).toBe("SELECT ROUND((last_lat)::numeric, 1) AS lat");
  });
});
