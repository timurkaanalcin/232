import { expect, test } from "@playwright/test";

test.describe("public marketplace", () => {
  test("landing page renders the core sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /güvenilir ikinci el/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /araçları gör/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /öne çıkan araçlar/i })).toBeVisible();
  });

  test("inventory and detail pages work", async ({ page }) => {
    await page.goto("/araclar");
    await expect(page.getByRole("heading", { name: /satılık ikinci el/i })).toBeVisible();
    await page.getByRole("link", { name: /volkswagen golf/i }).first().click();
    await expect(page).toHaveURL(/\/araclar\//);
    await expect(page.getByText(/ekspertiz skoru/i)).toBeVisible();
  });

  test("can navigate to register and login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^giriş$/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel("Email")).toBeVisible();

    await page.getByRole("link", { name: /kayıt olun/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test("forgot password shows a privacy-preserving confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText(/a password reset link is on its way/i)).toBeVisible();
  });

  test("valuation wizard completes", async ({ page }) => {
    await page.goto("/sat");
    await page.getByRole("button", { name: /devam/i }).click();
    await page.getByRole("button", { name: /devam/i }).click();
    await page.getByRole("button", { name: /devam/i }).click();
    await page.getByLabel("Ad soyad").fill("Ayşe Yılmaz");
    await page.getByLabel("E-posta").fill("ayse@example.com");
    await page.getByLabel("Telefon").fill("05551234567");
    await page.getByRole("button", { name: /değerleme al/i }).click();
    await expect(page.getByText(/7 gün geçerli ön teklif/i)).toBeVisible();
  });
});

test.describe("access control", () => {
  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin routes redirect unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("health", () => {
  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty("checks");
  });

  test("vehicles api returns inventory", async ({ request }) => {
    const response = await request.get("/api/vehicles");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.total).toBeGreaterThan(0);
    expect(Array.isArray(body.items)).toBe(true);
  });
});
