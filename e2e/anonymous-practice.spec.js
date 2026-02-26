import { expect, test } from "@playwright/test";
import { mockPracticeApi } from "./helpers/mock-routes.js";
import { uiText } from "../src/content/strings.js";

test("anonymous user can complete practice test flow", async ({ page }) => {
  await mockPracticeApi(page);
  await page.goto("/practice");

  await page.getByRole("button", { name: uiText.practice.start }).click();
  await expect(
    page.getByText(
      `${uiText.practice.questionProgressPrefix} 1 ${uiText.practice.questionProgressOutOf} 2`
    )
  ).toBeVisible();

  await page.locator('input[type="radio"]').first().check();
  await page.getByRole("button", { name: uiText.practice.buttons.saveAndNext }).click();
  await expect(
    page.getByText(
      `${uiText.practice.questionProgressPrefix} 2 ${uiText.practice.questionProgressOutOf} 2`
    )
  ).toBeVisible();

  await page.getByRole("button", { name: uiText.practice.buttons.finishAndReview }).click();
  await expect(page.getByRole("heading", { name: uiText.practice.reviewTitle })).toBeVisible();
  await expect(page.getByText(uiText.practice.finalScoreLabel)).toBeVisible();
});
