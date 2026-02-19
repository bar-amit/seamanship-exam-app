import { expect, test } from "@playwright/test";
import { mockPracticeApi } from "./helpers/mock-routes.js";

test("anonymous user can complete practice test flow", async ({ page }) => {
  await mockPracticeApi(page);
  await page.goto("/practice");

  await page.getByRole("button", { name: "התחל" }).click();
  await expect(page.getByText("שאלה 1 מתוך 2")).toBeVisible();

  await page.locator('input[type="radio"]').first().check();
  await page.getByRole("button", { name: "שמור והמשך" }).click();
  await expect(page.getByText("שאלה 2 מתוך 2")).toBeVisible();

  await page.getByRole("button", { name: "סיים ועבור לבדיקה" }).click();
  await expect(page.getByRole("heading", { name: "בדיקה וסיכום" })).toBeVisible();
  await expect(page.getByText("ציון סופי:")).toBeVisible();
});
