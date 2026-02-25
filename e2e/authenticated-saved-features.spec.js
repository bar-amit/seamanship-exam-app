import { expect, test } from "@playwright/test";
import {
  mockAuthSessionSyncNoop,
  mockCollectionsApi,
  mockProgressApi
} from "./helpers/mock-routes.js";

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
  await expect(page.getByRole("heading", { name: "לוח משתמש" })).toBeVisible();
  await expect(page.getByText("סה״כ אוספים:")).toBeVisible();

  await page.goto("/collections");
  await expect(page.getByRole("heading", { name: "האוספים שלי" })).toBeVisible();
  await page.getByLabel("שם האוסף").fill("אוסף חדש");
  await page.getByRole("button", { name: "צור אוסף" }).click();
  await expect(page.getByRole("heading", { name: "אוסף חדש", exact: true })).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "התקדמות לפי תגיות" })).toBeVisible();
  await expect(page.getByText("seamanship")).toBeVisible();
});
