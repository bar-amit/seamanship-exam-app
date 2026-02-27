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

  await page.locator(".choice-item").first().click();
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

test("last question replaces next controls with finish controls", async ({ page }) => {
  await mockPracticeApi(page);
  await page.goto("/practice");

  await page.getByRole("button", { name: uiText.practice.start }).click();
  await page.getByRole("button", { name: uiText.practice.buttons.saveAndNext }).click();

  const activeActions = page.locator("main section.card.practice-block").first().locator(".practice-actions");
  await expect(
    activeActions.getByRole("button", { name: uiText.practice.buttons.saveAndNext, exact: true })
  ).toHaveCount(0);
  await expect(
    activeActions.getByRole("button", { name: uiText.practice.buttons.skip, exact: true })
  ).toHaveCount(0);
  await expect(
    activeActions.getByRole("button", { name: uiText.practice.buttons.finishAndReview, exact: true })
  ).toBeVisible();
  await expect(
    activeActions.getByRole("button", { name: uiText.practice.buttons.skipAndFinish, exact: true })
  ).toBeVisible();
});

test("last question skip-and-finish moves to review with skipped answer", async ({ page }) => {
  await mockPracticeApi(page);
  await page.goto("/practice");

  await page.getByRole("button", { name: uiText.practice.start }).click();
  await page.getByRole("button", { name: uiText.practice.buttons.saveAndNext }).click();
  await page.getByRole("button", { name: uiText.practice.buttons.skipAndFinish }).click();

  await expect(page.getByRole("heading", { name: uiText.practice.reviewTitle })).toBeVisible();
  await expect(page.getByText(uiText.review.status.labels.skipped)).toBeVisible();
});
