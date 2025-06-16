import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("docs/receipts.md", () => {
  test("「概要」タブ", async ({
    page,
    user,
    guild,
    event,
    receipts: [receipt1, receipt2, receipt3],
  }, testInfo) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}/receipts`);

    const total = receipt1.total + receipt2.total + receipt3.total;
    await expect(page.getByText(`¥${total.toLocaleString()}`)).toBeVisible();

    const screenshot = await page.screenshot();
    await testInfo.attach("「概要」タブ", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("「表」タブ", async ({
    page,
    user,
    guild,
    event,
    receipts: _, // depends on existence
  }, testInfo) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}/receipts`);

    await page.getByRole("tab", { name: "表" }).click();
    await page.waitForLoadState("networkidle");

    const screenshot = await page.screenshot();
    await testInfo.attach("「表」タブ", {
      body: screenshot,
      contentType: "image/png",
    });
  });

  test("「グラフ」タブ", async ({
    page,
    user,
    guild,
    event,
    receipts: _, // depends on existence
  }, testInfo) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}/receipts`);

    await page.getByRole("tab", { name: "グラフ" }).click();
    await page.waitForLoadState("networkidle");

    const screenshot = await page.screenshot();
    await testInfo.attach("「グラフ」タブ", {
      body: screenshot,
      contentType: "image/png",
    });
  });
});
