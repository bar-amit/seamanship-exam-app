import { expect, test } from "@playwright/test";
import { mockAuthSessionSyncNoop } from "./helpers/mock-routes.js";

async function setUserCookies(context, email) {
  await context.addCookies([
    {
      name: "auth_session",
      value: "fake-session-cookie",
      url: "http://127.0.0.1:3000"
    },
    {
      name: "user_email",
      value: email,
      url: "http://127.0.0.1:3000"
    }
  ]);
}

test("homepage hides protected links when logged out", async ({ page }) => {
  await mockAuthSessionSyncNoop(page);
  await page.goto("/");

  await expect(page.getByRole("link", { name: "תרגול מבחן" })).toBeVisible();
  await expect(page.getByRole("link", { name: "תרגול לפי תגית" })).toBeVisible();
  await expect(page.getByRole("link", { name: "האוספים שלי" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "התקדמות" })).toHaveCount(0);
  await expect(page.getByText("יש להתחבר כדי לראות קישורים לאזור האישי.")).toBeVisible();
});

test("homepage shows protected links when logged in", async ({ context, page }) => {
  await setUserCookies(context, "tester@example.com");
  await mockAuthSessionSyncNoop(page);
  await page.goto("/");

  await expect(page.getByRole("link", { name: "האוספים שלי" })).toBeVisible();
  await expect(page.getByRole("link", { name: "התקדמות" })).toBeVisible();
  await expect(page.getByText("יש להתחבר כדי לראות קישורים לאזור האישי.")).toHaveCount(0);
});
