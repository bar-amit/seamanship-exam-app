import { expect, test } from "@playwright/test";
import { mockPracticeApi } from "./helpers/mock-routes.js";

test("review mode supports filter controls", async ({ page }) => {
  await mockPracticeApi(page);
  await page.goto("/practice");
  await page.getByRole("button", { name: "התחל" }).click();

  await page.locator('input[type="radio"]').nth(1).check();
  await page.getByRole("button", { name: "סיים ועבור לבדיקה" }).click();

  await expect(page.getByRole("heading", { name: "בדיקה וסיכום" })).toBeVisible();

  await page.getByLabel("סינון").selectOption("mistakes");
  await expect(page.getByText("סטטוס: שגויה")).toBeVisible();

  await page.getByLabel("הצג הסברים").uncheck();
  await expect(page.getByText("הסבר/פתרון:")).toHaveCount(0);
});
