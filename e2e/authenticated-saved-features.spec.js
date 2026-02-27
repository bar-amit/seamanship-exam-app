import { expect, test } from "@playwright/test";
import {
  mockAuthSessionSyncNoop,
  mockCollectionsApi,
  mockProgressApi
} from "./helpers/mock-routes.js";
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

test("authenticated user can access dashboard and collections", async ({ context, page }) => {
  await setUserCookies(context, "tester@example.com");
  await mockAuthSessionSyncNoop(page);
  await mockCollectionsApi(page);
  await mockProgressApi(page);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: uiText.dashboard.title })).toBeVisible();
  await expect(page.getByText(uiText.dashboard.cards.collectionsCountLabel)).toBeVisible();
  await expect(page.getByRole("heading", { name: uiText.dashboard.cards.progressTitle })).toBeVisible();

  await page.goto("/collections");
  await expect(page.getByRole("heading", { name: uiText.collections.title })).toBeVisible();
  const createSection = page
    .locator("section.card.practice-block")
    .filter({ has: page.getByRole("heading", { name: uiText.collections.createTitle }) });
  await createSection.getByLabel(uiText.collections.fields.name).fill("אוסף חדש");
  await createSection.getByRole("button", { name: uiText.collections.buttons.create }).click();
  await expect(page.locator(".review-list").getByRole("heading", { name: "אוסף חדש", exact: true })).toBeVisible();
});
