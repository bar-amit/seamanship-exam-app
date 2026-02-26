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

test("authenticated user can access dashboard, collections and progress", async ({ context, page }) => {
  await setUserCookies(context, "tester@example.com");
  await mockAuthSessionSyncNoop(page);
  await mockCollectionsApi(page);
  await mockProgressApi(page);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: uiText.dashboard.title })).toBeVisible();
  await expect(page.getByText(uiText.dashboard.cards.collectionsCountLabel)).toBeVisible();

  await page.goto("/collections");
  await expect(page.getByRole("heading", { name: uiText.collections.title })).toBeVisible();
  await page.getByLabel(uiText.collections.fields.name).fill("אוסף חדש");
  await page.getByRole("button", { name: uiText.collections.buttons.create }).click();
  await expect(page.getByRole("heading", { name: "אוסף חדש", exact: true })).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: uiText.progress.title })).toBeVisible();
  await expect(page.getByText("seamanship")).toBeVisible();
});
