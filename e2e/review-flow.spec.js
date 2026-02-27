import { expect, test } from "@playwright/test";
import { mockPracticeApi } from "./helpers/mock-routes.js";
import { uiText } from "../src/content/strings.js";

test("review mode supports filter controls", async ({ page }) => {
  await mockPracticeApi(page);
  await page.goto("/practice");
  await page.getByRole("button", { name: uiText.practice.start }).click();

  await page.locator(".choice-item").nth(1).click();
  await page.getByRole("button", { name: uiText.practice.buttons.saveAndNext }).click();
  await page.getByRole("button", { name: uiText.practice.buttons.skipAndFinish }).click();

  await expect(page.getByRole("heading", { name: uiText.practice.reviewTitle })).toBeVisible();

  await page.getByLabel(uiText.review.controls.filterLabel).selectOption("mistakes");
  await expect(
    page.getByText(`${uiText.review.status.prefix} ${uiText.review.status.labels.incorrect}`)
  ).toBeVisible();

  await page.getByLabel(uiText.review.controls.showExplanations).uncheck();
  await expect(page.getByText(uiText.practice.explanationLabel)).toHaveCount(0);
});
