import { expect, test } from "@playwright/test";
import { mockCollectionsApi, mockPracticeApi } from "./helpers/mock-routes.js";
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

test("test-practice review can add question to collection and closes modal on success", async ({
  context,
  page
}) => {
  await setUserCookies(context, "tester@example.com");
  await mockPracticeApi(page);
  await mockCollectionsApi(page, {
    collections: [
      {
        id: "col_empty",
        owner_email: "tester@example.com",
        name: "אוסף ריק",
        description: "ללא שאלות",
        question_ids: [],
        updated_at: "2026-02-19T10:00:00.000Z"
      }
    ]
  });

  await page.goto("/practice");
  await page.getByRole("button", { name: uiText.practice.start }).click();

  await page.locator(".choice-item").first().click();
  await page.getByRole("button", { name: uiText.practice.buttons.saveAndNext }).click();
  await page.locator(".choice-item").first().click();
  await page.getByRole("button", { name: uiText.practice.buttons.finishAndReview }).click();

  const reviewItem = page.locator(".review-item").first();
  await reviewItem.getByRole("button", { name: uiText.collections.addModal.trigger }).click();

  const modal = page.locator(".app-modal-card");
  await expect(modal.getByRole("heading", { name: uiText.collections.addModal.title })).toBeVisible();
  await expect(modal.getByText("ללא שאלות")).toHaveCount(0);
  await modal.getByRole("button", { name: uiText.collections.addModal.addToCollection }).first().click();
  await expect(modal).toHaveCount(0);

  await reviewItem.getByRole("button", { name: uiText.collections.addModal.trigger }).click();
  const reopenedModal = page.locator(".app-modal-card");
  await expect(reopenedModal).toBeVisible();
  await reopenedModal.getByLabel(uiText.collections.addModal.createNameLabel).fill("אוסף חדש מהבדיקה");
  await reopenedModal.getByRole("button", { name: uiText.collections.addModal.createAction }).click();
  await expect(reopenedModal).toHaveCount(0);
});

test("tag-practice review card can open add-to-collection modal", async ({ context, page }) => {
  await setUserCookies(context, "tester@example.com");
  await mockPracticeApi(page);
  await mockCollectionsApi(page);

  await page.goto("/practice/tags");
  await page.getByRole("button", { name: uiText.practiceTags.start }).click();
  await page.getByRole("button", { name: uiText.practiceTags.showStudyAids }).click();
  await page.getByRole("button", { name: uiText.collections.addModal.trigger }).click();

  const modal = page.locator(".app-modal-card");
  await expect(modal.getByRole("heading", { name: uiText.collections.addModal.title })).toBeVisible();
  await expect(modal.getByText(uiText.collections.addModal.createTitle)).toBeVisible();
});
