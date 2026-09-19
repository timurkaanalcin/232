import { expect, test } from "@playwright/test";

test.describe("public surface", () => {
  test("landing page renders the market dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /piyasa eğilimleri/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /piyasalar/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /haberler/i }).first()).toBeVisible();
  });

  test("can open a quote from the markets table", async ({ page }) => {
    await page.goto("/markets");
    await expect(page.getByRole("heading", { name: /piyasalar/i })).toBeVisible();
    const symbol = page.locator("table a[href^='/quote/']").first();
    await expect(symbol).toBeVisible();
    await symbol.click();
    await expect(page).toHaveURL(/\/quote\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("can navigate to register and login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await page.goto("/register");
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test("forgot password shows a privacy-preserving confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText(/a password reset link is on its way/i)).toBeVisible();
  });

  test("news index lists articles", async ({ page }) => {
    await page.goto("/news");
    await expect(page.getByRole("heading", { name: /haberler/i })).toBeVisible();
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

  test("markets overview api returns ticker data", async ({ request }) => {
    const response = await request.get("/api/markets/overview");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.overview.featured.length).toBeGreaterThan(0);
    expect(body.overview.news.length).toBeGreaterThan(0);
  });
});
