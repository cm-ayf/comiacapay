import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("docs/event.md", () => {
  test("イベントの追加 - basic", async ({ page, user, guild }) => {
    await user.signin();
    await page.goto(`/${guild.id}`);

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

  test("イベントの追加 - お品書きをコピー", async ({
    page,
    user,
    guild,
    event,
    items: [item1],
    displays: [display1],
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}`);
    await page.waitForLoadState("networkidle");

    // Go back and create second event copying displays from first
    await page.getByRole("button", { name: "イベントを追加" }).click();
    await page.getByRole("textbox", { name: "イベント名" }).fill("Event 2");
    await page.getByRole("textbox", { name: "日付" }).fill("2025-06-14");
    await page.getByRole("combobox", { name: "お品書きをコピー" }).click();
    await page.getByRole("option", { name: event.name }).click();
    await page.getByRole("button", { name: "保存" }).click();

    // Verify copied display exists
    await page.waitForURL(/\/\d+\/\d+/);
    await page.reload();

    await expect(page.getByText(item1.name)).toBeVisible();
    // Price might be displayed in different formats
    await expect(page.getByText(`¥${display1.price}`)).toBeVisible();
  });

  test("「イベント名」と「日付」の編集", async ({
    page,
    user,
    guild,
    event,
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}`);
    await page.waitForLoadState("networkidle");

    // Edit event details
    await page.getByRole("button", { name: event.name }).click();
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

  test("お品書きの追加と編集と削除", async ({
    page,
    user,
    guild,
    event,
    items: [item1],
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}`);
    await page.waitForLoadState("networkidle");

    // Add display
    await page.getByRole("combobox", { name: "お品書きを追加" }).click();
    await page.getByRole("option", { name: item1.name }).click();
    await page
      .getByRole("spinbutton", { name: "価格", exact: true })
      .fill("1000");
    await page.getByRole("spinbutton", { name: "部内頒布価格" }).fill("500");
    await page.getByRole("button", { name: "保存" }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(100); // TODO: fix app so that this is not needed

    // Verify display was added
    await expect(page.getByText(item1.name)).toBeVisible();
    await expect(page.getByText("¥1000")).toBeVisible();

    // Edit display
    await page
      .locator("div", { hasText: item1.name })
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
      .locator("div", { hasText: item1.name })
      .getByRole("button", { name: "編集" })
      .click();
    await page.getByRole("button", { name: "削除" }).click();
    await page.waitForTimeout(100); // TODO: fix app so that this is not needed
    await page.waitForLoadState("networkidle");

    // Verify display was removed
    await expect(page.getByText(item1.name)).not.toBeVisible();
    await expect(page.getByText("¥1200")).not.toBeVisible();
    await expect(page.getByText("¥600")).not.toBeVisible();
  });

  test("セット割引の追加と削除", async ({
    page,
    user,
    guild,
    event,
    items: [item1, item2],
    displays: _, // depends on existence
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}`);
    await page.waitForLoadState("networkidle");

    // Add set discount
    await page.getByRole("combobox", { name: "割引等を追加" }).click();
    await page.getByRole("option", { name: "セット割引" }).click();

    await page.getByRole("combobox", { name: "商品の組み合わせ" }).click();
    await page.getByRole("option", { name: item1.name }).click();
    await page.getByRole("option", { name: item2.name }).click();
    await page.keyboard.press("Tab"); // TODO: better way test better accessibility
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

  test("イベントの削除", async ({ page, user, guild, event }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}`);
    await page.waitForLoadState("networkidle");

    // Delete event
    await page.getByRole("button", { name: event.name }).click();
    await page.getByRole("button", { name: "削除" }).click();

    // Verify event was deleted
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: event.name }),
    ).not.toBeVisible();
  });

  test("すでに売上が登録されているイベントは削除できません．", async ({
    page,
    user,
    guild,
    event,
    receipts: _, // depends on existence
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}`);
    await page.waitForLoadState("networkidle");

    // Try to delete event
    await page.getByRole("button", { name: event.name }).click();

    // Verify delete button is disabled
    await expect(page.getByRole("button", { name: "削除" })).toBeDisabled();
  });
});
