import { expect, test } from "@playwright/test";

const completedConsent = JSON.stringify({
  version: 1,
  completedAt: Date.now(),
  location: false,
  notifications: false,
  marketingOptIn: false,
});

test.describe("first-launch bulk consent", () => {
  test("lists location and notifications and allows continuing with all declined", async ({ page }) => {
    let geoCalls = 0;
    await page.addInitScript(() => {
      const geo = navigator.geolocation;
      geo.getCurrentPosition = ((_ok, err) => {
        (window as unknown as { __geoCalls?: number }).__geoCalls =
          ((window as unknown as { __geoCalls?: number }).__geoCalls ?? 0) + 1;
        err?.({ code: 1, message: "denied", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
      }) as typeof geo.getCurrentPosition;
    });

    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: /gizli değil/ });
    await expect(dialog).toBeVisible();
    await expect(page.getByText("Konum (LiveTrack / CanlıSite)")).toBeVisible();
    await expect(page.getByText("Bildirimler", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("switch", { name: "Konum iznini kabul et" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await expect(page.getByRole("switch", { name: "Bildirim iznini kabul et" })).toHaveAttribute(
      "aria-checked",
      "false",
    );

    await page.getByRole("button", { name: "Seçtiklerimle devam et" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /platform sitesi/i })).toBeVisible();

    geoCalls = await page.evaluate(() => (window as unknown as { __geoCalls?: number }).__geoCalls ?? 0);
    expect(geoCalls).toBe(0);
  });

  test("requests geolocation only after location is accepted", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = ((ok) => {
        (window as unknown as { __geoCalls?: number }).__geoCalls =
          ((window as unknown as { __geoCalls?: number }).__geoCalls ?? 0) + 1;
        ok({
          coords: {
            latitude: 41,
            longitude: 29,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON() {
              return this;
            },
          },
          timestamp: Date.now(),
          toJSON() {
            return this;
          },
        } as GeolocationPosition);
      }) as typeof navigator.geolocation.getCurrentPosition;
    });

    await page.goto("/login");
    const dialog = page.getByRole("dialog", { name: /gizli değil/ });
    await expect(dialog).toBeVisible();
    await page.getByRole("switch", { name: "Konum iznini kabul et" }).click();
    await page.getByRole("button", { name: "Seçtiklerimle devam et" }).click();
    await expect(dialog).toHaveCount(0);

    const geoCalls = await page.evaluate(() => (window as unknown as { __geoCalls?: number }).__geoCalls ?? 0);
    expect(geoCalls).toBeGreaterThan(0);
  });
});

test.describe("public surface", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((value) => {
      window.localStorage.setItem("canlisite.firstLaunchConsent.v1", value);
    }, completedConsent);
  });

  test("landing page renders the core sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /platform sitesi/i })).toBeVisible();
    await expect(page.locator("#ozellikler")).toBeVisible();
    await expect(page.locator("#cozumler")).toBeVisible();
    await expect(page.locator("#paketler")).toBeVisible();
  });

  test("can navigate to register and login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /giriş/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel("Email")).toBeVisible();

    await page.getByRole("link", { name: /hesap oluştur/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel(/ad soyad/i)).toBeVisible();
  });

  test("forgot password shows a privacy-preserving confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText(/a password reset link is on its way/i)).toBeVisible();
  });

  test("privacy notice is public and consent-first", async ({ page }) => {
    await page.goto("/gizlilik");
    await expect(page.getByRole("heading", { name: /gizlilik bildirimi/i })).toBeVisible();
    await expect(page.getByText(/gizli izleme/i)).toBeVisible();
    await expect(page.getByText(/açılışta konum ve bildirimler/)).toBeVisible();
  });
});

test.describe("access control", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((value) => {
      window.localStorage.setItem("canlisite.firstLaunchConsent.v1", value);
    }, completedConsent);
  });

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
