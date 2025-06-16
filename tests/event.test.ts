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
  // Wait for page to be ready
  await page.waitForLoadState("networkidle");
});

test.afterEach(async () => {
  await down();
});

test.describe("docs/event.md", () => {
  test("イベントの追加 - basic", async ({ page }) => {
    // Click add event button
    await page.getByRole("button", { name: "イベントを追加" }).click();

    // Fill out event details
    await page.getByRole("textbox", { name: "イベント名" }).fill("Test Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");

    // Save the event
    await page.getByRole("button", { name: "保存" }).click();

    // Wait for navigation to event page and verify
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Test Event" }),
    ).toBeVisible();
  });

  test("イベントの追加 - お品書きをコピー", async ({ page }) => {
    // Create first event with a display
    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Test Item");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/image.jpg");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page.getByRole("textbox", { name: "イベント名" }).fill("First Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    await page.getByRole("combobox", { name: "お品書きを追加" }).click();
    await page.getByRole("option", { name: "Test Item" }).click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1000");
    await page.getByRole("button", { name: "保存" }).click();

    // Go back and create second event copying displays from first
    await page.goBack();
    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page
      .getByRole("textbox", { name: "イベント名" })
      .fill("Second Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-14");
    await page.getByRole("combobox", { name: "お品書きをコピー" }).click();
    await page.getByRole("option", { name: "First Event" }).click();
    await page.getByRole("button", { name: "保存" }).click();

    // Verify copied display exists
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    await expect(page.getByText("Test Item")).toBeVisible();
    // Price might be displayed in different formats
    await expect(page.getByText("¥1000")).toBeVisible();
  });

  test("「イベント名」と「日付」の編集", async ({ page }) => {
    // Create event
    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page
      .getByRole("textbox", { name: "イベント名" })
      .fill("Event to Edit");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    // Edit event details
    await page.getByRole("button", { name: "Event to Edit" }).click();
    await page
      .getByRole("textbox", { name: "イベント名" })
      .fill("Updated Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-14");
    await page.getByRole("button", { name: "保存" }).click();

    // Verify changes
    await expect(
      page.getByRole("heading", { name: "Updated Event" }),
    ).toBeVisible();
    // The date might be displayed in various formats, so just check if it exists
    await expect(page.getByText("2025/6/14")).toBeVisible();
  });

  test("お品書きの追加と編集と削除", async ({ page }) => {
    // Create item and event
    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Test Item");
    await page
      .getByRole("textbox", { name: "商品画像URL" })
      .fill("https://example.com/image.jpg");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page.getByRole("textbox", { name: "イベント名" }).fill("Test Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    // Add display
    await page.getByRole("combobox", { name: "お品書きを追加" }).click();
    await page.getByRole("option", { name: "Test Item" }).click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1000");
    await page.getByRole("spinbutton", { name: "部内頒布価格" }).fill("500");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForLoadState("networkidle");

    // Verify display was added
    await expect(page.getByText("Test Item")).toBeVisible();
    await expect(page.getByText("¥1000")).toBeVisible();

    // Edit display
    await page
      .locator("div", { hasText: "Test Item" })
      .getByRole("button", { name: "編集" })
      .click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1200");
    await page.getByRole("spinbutton", { name: "部内頒布価格" }).fill("600");
    await page.getByRole("button", { name: "保存" }).click();

    // Verify changes
    await expect(page.getByText("¥1200")).toBeVisible();
    await expect(page.getByText("¥600")).toBeVisible();

    // Delete display
    await page
      .locator("div", { hasText: "Test Item" })
      .getByRole("button", { name: "編集" })
      .click();
    await page.getByRole("button", { name: "削除" }).click();
    await page.waitForTimeout(100); // TODO: fix app so that this is not needed
    await page.waitForLoadState("networkidle");

    // Verify display was removed
    await expect(page.getByText("Test Item")).not.toBeVisible();
    await expect(page.getByText("¥1200")).not.toBeVisible();
    await expect(page.getByText("¥600")).not.toBeVisible();
  });

  test("セット割引の追加と削除", async ({ page }) => {
    // Create items and event with displays
    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Item 1");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Item 2");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page.getByRole("textbox", { name: "イベント名" }).fill("Test Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    // Add displays
    await page.getByRole("combobox", { name: "お品書きを追加" }).click();
    await page.getByRole("option", { name: "Item 1" }).click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1000");
    await page.getByRole("button", { name: "保存" }).click();

    await page.getByRole("combobox", { name: "お品書きを追加" }).click();
    await page.getByRole("option", { name: "Item 2" }).click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1000");
    await page.getByRole("button", { name: "保存" }).click();

    // Add set discount
    await page.getByRole("combobox", { name: "割引等を追加" }).click();
    await page.getByRole("option", { name: "セット割引" }).click();

    await page.getByRole("combobox", { name: "商品の組み合わせ" }).click();
    await page.getByRole("option", { name: "Item 1" }).click();
    await page.getByRole("option", { name: "Item 2" }).click();
    await page.keyboard.press("Tab"); // TODO: better way with better accessibility
    await page.getByRole("spinbutton", { name: "割引額" }).fill("500");

    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForLoadState("networkidle");

    // Verify discount was added
    await expect(page.getByText("- ¥500")).toBeVisible();

    // Delete discount
    await page.getByRole("button", { name: "割引を削除" }).click();

    // Verify discount was removed
    await expect(page.getByText("- ¥500")).not.toBeVisible();
  });

  test("イベントの削除", async ({ page }) => {
    // Create event without displays
    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page
      .getByRole("textbox", { name: "イベント名" })
      .fill("Deletable Event");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    // Delete event
    await page.getByRole("button", { name: "Deletable Event" }).click();
    await page.getByRole("button", { name: "削除" }).click();

    // Verify event was deleted
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /Deletable Event$/ }),
    ).not.toBeVisible();
  });

  test("すでに売上が登録されているイベントは削除できません．", async ({
    page,
  }) => {
    // Create event with a display
    await page.getByRole("button", { name: "商品を追加" }).click();
    await page.getByRole("textbox", { name: "商品名" }).fill("Item to Sell");
    await page.getByRole("textbox", { name: "発行日" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();

    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page
      .getByRole("textbox", { name: "イベント名" })
      .fill("Event with Sales");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-13");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    // Add display
    await page.getByRole("combobox", { name: "お品書きを追加" }).click();
    await page.getByRole("option", { name: "Item to Sell" }).click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1000");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForLoadState("networkidle");

    // Simulate sales registration
    await page.getByRole("link", { name: "レジを起動" }).click();
    await page.waitForURL(/\/\d+\/\d+\/register/);
    await page.getByRole("button", { name: "1" }).click();
    await page.getByRole("button", { name: "登録" }).click();
    await page.waitForTimeout(100); // TODO: fix app so that this is not needed
    await page.waitForLoadState("networkidle");
    await page.goBack();

    // Try to delete event
    await page.getByRole("button", { name: "Event with Sales" }).click();

    // Verify delete button is disabled
    await expect(page.getByRole("button", { name: "削除" })).toBeDisabled();
  });
});
