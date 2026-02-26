import { expect, test } from "@playwright/test";
import { mockAdminApi, mockAuthSessionSyncNoop } from "./helpers/mock-routes.js";
import { uiText } from "../src/content/strings.js";

async function setAdminCookies(context) {
  await context.addCookies([
    {
      name: "auth_session",
      value: "fake-session-cookie",
      url: "http://127.0.0.1:3000"
    },
    {
      name: "user_email",
      value: "admin@example.com",
      url: "http://127.0.0.1:3000"
    }
  ]);
}

test("admin can load editor, inspect json and save changes", async ({ context, page }) => {
  await setAdminCookies(context);
  await mockAuthSessionSyncNoop(page);
  await mockAdminApi(page);

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: uiText.admin.title })).toBeVisible();
  await expect(page.getByRole("button", { name: "sq1-q001" })).toBeVisible();

  await page.getByRole("button", { name: "sq1-q001" }).click();
  await page.getByLabel(uiText.admin.questionTextLabel).fill("טקסט חדש לשאלה");

  await page.getByRole("button", { name: uiText.admin.showQuestionJson }).click();
  await expect(page.getByText('"id": "sq1-q001"')).toBeVisible();

  await page.getByRole("button", { name: uiText.admin.showPayloadJson }).click();
  await expect(page.getByText('"text": "טקסט חדש לשאלה"')).toBeVisible();

  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/admin/questions/") &&
      response.request().method() === "PUT" &&
      response.status() === 200
  );
  await page.getByRole("button", { name: uiText.admin.saveChanges }).click();
  await saveResponsePromise;
});
