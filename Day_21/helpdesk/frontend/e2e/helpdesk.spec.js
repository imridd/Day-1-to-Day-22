import { test, expect } from "@playwright/test";
test("manager can sign in and see dashboard", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email address").fill("manager@helpdesk.local");
  await page.getByLabel("Password").fill("Helpdesk@123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText(/Ticket activity/)).toBeVisible();
});
test("customer can register or sign in", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email address").fill("ridha@helpdesk.local");
  await page.getByLabel("Password").fill("Helpdesk@123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(
    page.getByRole("button", { name: /Raise ticket/ }),
  ).toBeVisible();
});
