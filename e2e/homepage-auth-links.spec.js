import { expect, test } from "@playwright/test";
import { mockAuthSessionSyncNoop } from "./helpers/mock-routes.js";
import { uiText } from "../src/content/strings.js";

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

  await expect(page.getByRole("link", { name: uiText.home.links.practice })).toBeVisible();
  await expect(page.getByRole("link", { name: uiText.home.links.tagPractice })).toBeVisible();
  await expect(page.getByRole("link", { name: uiText.home.links.collections })).toHaveCount(0);
  await expect(page.getByRole("link", { name: uiText.home.links.progress })).toHaveCount(0);
  await expect(page.getByText(uiText.home.loginHint)).toBeVisible();
});

test("homepage shows protected links when logged in", async ({ context, page }) => {
  await setUserCookies(context, "tester@example.com");
  await mockAuthSessionSyncNoop(page);
  await page.goto("/");

  await expect(page.getByRole("link", { name: uiText.home.links.collections })).toBeVisible();
  await expect(page.getByRole("link", { name: uiText.home.links.progress })).toBeVisible();
  await expect(page.getByText(uiText.home.loginHint)).toHaveCount(0);
});
