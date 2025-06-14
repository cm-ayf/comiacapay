import { expect, test } from "@playwright/test";
import { up, down } from "./init";

test.beforeEach(async ({ page }) => {
  const { session, guild } = await up();
  await page.context().addCookies([
    {
      name: "session",
      value: Buffer.from(JSON.stringify(session.sid)).toString("base64url"),
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto(`/${guild.id}`);
});

test.afterEach(async () => {
  await down();
});

test.describe("docs/items.md", () => {
  test("商品の追加", async ({ page }) => {
    // Click add item button
    await page.getByRole("button", { name: "商品を追加" }).click();

    // Fill out item details
    await page.getByRole("textbox", { name: "商品名" }).fill("Test Item");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/image.jpg");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");

    // Save the item
    await page.getByRole("button", { name: "保存" }).click();

    // Verify item was added
    await expect(page.getByLabel("Test Item")).toBeVisible();
  });

  test("商品の編集", async ({ page }) => {
    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Item to Edit");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/old.jpg");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    // Click the item card to edit
    await page.getByRole("button", { name: "Item to Edit" }).click();

    // Update item details
    await page.getByRole("textbox", { name: "商品名" }).fill("Updated Item");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/new.jpg");
    await page.getByRole("button", { name: "保存" }).click();

    // Verify item was updated
    await expect(page.getByLabel("Updated Item")).toBeVisible();
    await expect(page.getByLabel("Item to Edit")).not.toBeVisible();
  });

  test("すでにいずれかのイベントのお品書きに登録されている商品は削除できません", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Item in Display");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/display.jpg");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    // Create an event and add the item to its display
    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page.getByRole("textbox", { name: "イベント名" }).fill("Test Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    // Add item to event display
    await page.getByRole("combobox", { name: "お品書きを追加" }).click();
    await page.getByRole("option", { name: "Item in Display" }).click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1000");
    await page.getByRole("button", { name: "保存" }).click();

    // Try to delete the item
    await page.goBack();
    await page.getByRole("button", { name: "Item in Display" }).click();

    await expect(page.getByRole("button", { name: "削除" })).toBeDisabled();
  });

  test("商品の削除", async ({ page }) => {
    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Deletable Item");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/delete.jpg");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    // Delete the item
    await page.getByRole("button", { name: "Deletable Item" }).click();
    await page.getByRole("button", { name: "削除" }).click();

    // Verify item was deleted
    await expect(page.getByLabel("Deletable Item")).not.toBeVisible();
  });
});
