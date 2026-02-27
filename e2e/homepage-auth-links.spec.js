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

  await expect(page.getByRole("button", { name: uiText.nav.menuAriaLabel })).toHaveCount(0);
  await expect(page.getByRole("link", { name: uiText.home.links.practice })).toBeVisible();
  await expect(page.getByRole("link", { name: uiText.home.links.tagPractice })).toBeVisible();
  await expect(page.getByRole("link", { name: uiText.home.links.collections })).toHaveCount(0);
  await expect(page.getByRole("link", { name: uiText.home.links.dashboard })).toHaveCount(0);
  await expect(page.getByText(uiText.home.loginHint)).toBeVisible();

  await page.goto("/practice");
  await expect(page.getByRole("button", { name: uiText.nav.menuAriaLabel })).toBeVisible();
  await page.getByRole("button", { name: uiText.nav.menuAriaLabel }).click();
  const menuPanel = page.getByRole("navigation", { name: uiText.nav.menuAriaLabel });
  await expect(menuPanel.getByRole("link", { name: uiText.nav.links.home, exact: true })).toBeVisible();
  await expect(menuPanel.getByRole("link", { name: uiText.nav.links.practice, exact: true })).toBeVisible();
  await expect(menuPanel.getByRole("link", { name: uiText.nav.links.tagPractice, exact: true })).toBeVisible();
  await expect(menuPanel.getByRole("link", { name: uiText.nav.links.dashboard, exact: true })).toHaveCount(0);
  await expect(menuPanel.getByRole("link", { name: uiText.nav.links.collections, exact: true })).toHaveCount(0);
});

test("homepage shows protected links when logged in", async ({ context, page }) => {
  await setUserCookies(context, "tester@example.com");
  await mockAuthSessionSyncNoop(page);
  await page.goto("/");

  await expect(page.getByRole("link", { name: uiText.home.links.collections })).toBeVisible();
  await expect(page.getByRole("link", { name: uiText.home.links.dashboard })).toBeVisible();
  await expect(page.getByText(uiText.home.loginHint)).toHaveCount(0);

  await page.goto("/practice");
  await page.getByRole("button", { name: uiText.nav.menuAriaLabel }).click();
  const menuPanel = page.getByRole("navigation", { name: uiText.nav.menuAriaLabel });
  await expect(menuPanel.getByRole("link", { name: uiText.nav.links.dashboard, exact: true })).toBeVisible();
  await expect(menuPanel.getByRole("link", { name: uiText.nav.links.collections, exact: true })).toBeVisible();
});
