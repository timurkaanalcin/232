import { expect, test } from "@playwright/test";

test.describe("public surface", () => {
  test("landing page renders the core sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /borsa/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /BIST 100/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Piyasa Gündemi/i })).toBeVisible();
  });

  test("can navigate to register and login", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel(/full name/i)).toBeVisible();

    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("forgot password shows a privacy-preserving confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText(/a password reset link is on its way/i)).toBeVisible();
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
});
