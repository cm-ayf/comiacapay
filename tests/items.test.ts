import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("docs/items.md", () => {
  test("商品の追加", async ({ page, user, guild }) => {
    await user.signin();
    await page.goto(`/${guild.id}`);

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

  test("商品の編集", async ({ page, user, guild, items: [item1] }) => {
    await user.signin();
    await page.goto(`/${guild.id}`);

    // Click the item card to edit
    await page.getByRole("button", { name: item1.name }).click();

    // Update item details
    await page.getByRole("textbox", { name: "商品名" }).fill("Updated Item");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/new.jpg");
    await page.getByRole("button", { name: "保存" }).click();

    // Verify item was updated
    await expect(page.getByLabel("Updated Item")).toBeVisible();
    await expect(page.getByLabel(item1.name)).not.toBeVisible();
  });

  test("すでにいずれかのイベントのお品書きに登録されている商品は削除できません", async ({
    page,
    user,
    guild,
    items: [item1],
    displays: _, // depends on existence
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}`);

    // Try to delete the item
    await page.getByRole("button", { name: item1.name }).click();

    await expect(page.getByRole("button", { name: "削除" })).toBeDisabled();
  });

  test("商品の削除", async ({ page, user, guild, items: [item1] }) => {
    await user.signin();
    await page.goto(`/${guild.id}`);

    // Delete the item
    await page.getByRole("button", { name: item1.name }).click();
    await page.getByRole("button", { name: "削除" }).click();

    // Verify item was deleted
    await expect(page.getByLabel(item1.name)).not.toBeVisible();
  });
});
