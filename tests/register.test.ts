import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("docs/register.md", () => {
  test("一連の流れ - 1", async ({
    page,
    user,
    guild,
    event,
    items: [item1],
    displays: [display1],
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}/register`);

    await page
      .locator("div.MuiPaper-root", { hasText: item1.name })
      .getByRole("button", { name: "1" })
      .click();

    const total = 1 * display1.price;
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(
      `¥${total}`,
    );

    await page.getByRole("button", { name: "登録" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(`¥0`);
  });

  test("一連の流れ - 2", async ({
    page,
    user,
    guild,
    event,
    items: [item1, item2],
    displays: [display1, display2],
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}/register`);

    await page
      .locator("div.MuiPaper-root", { hasText: item1.name })
      .getByRole("button", { name: "1" })
      .click();

    const item2PlusButton = page
      .locator("div.MuiPaper-root", { hasText: item2.name })
      .getByRole("button", { name: "+" });
    await item2PlusButton.click();
    await item2PlusButton.click();

    await expect(
      page
        .locator("div.MuiPaper-root", { hasText: item2.name })
        .getByRole("spinbutton", { name: "売上数" }),
    ).toHaveValue("3");

    const total = 1 * display1.price + 3 * display2.price;
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(
      `¥${total}`,
    );

    await page.getByRole("button", { name: "登録" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(`¥0`);
  });

  test("一連の流れ - 3", async ({
    page,
    user,
    guild,
    event,
    items: [item1],
    displays: [display1],
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}/register`);

    await page
      .locator("div.MuiPaper-root", { hasText: item1.name })
      .getByRole("spinbutton", { name: "売上数" })
      .fill("5");

    const total = 5 * display1.price;
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(
      `¥${total}`,
    );

    // Clear all
    await page.getByRole("button", { name: "登録" }).click();
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(`¥0`);
  });

  test("一連の流れ - 4", async ({
    page,
    user,
    guild,
    event,
    items: [item1, item2],
    displays: [display1],
  }) => {
    await user.signin();
    await page.goto(`/${guild.id}/${event.id}/register`);

    await page
      .locator("div.MuiPaper-root", { hasText: item1.name })
      .getByRole("button", { name: "1" })
      .click();
    await page
      .locator("div.MuiPaper-root", { hasText: item1.name })
      .getByRole("checkbox", { name: "部内" })
      .click();

    await page
      .locator("div.MuiPaper-root", { hasText: item2.name })
      .getByRole("button", { name: "1" })
      .click();
    await page
      .locator("div.MuiPaper-root", { hasText: item2.name })
      .getByRole("checkbox", { name: "献本" })
      .click();

    const total = 1 * display1.internalPrice!;

    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(
      `¥${total}`,
    );
    await page.getByRole("button", { name: "登録" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(`¥0`);
  });

  test("オフラインでの機能", async ({
    browserName,
    context,
    page,
    user,
    guild,
    event,
    items: [item1],
    displays: [display1],
  }) => {
    test.skip(
      browserName !== "chromium",
      "https://playwright.dev/docs/service-workers-experimental is only supported in Chromium",
    );

    await user.signin();
    await page.goto(`/`);
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);

    await page.getByRole("link", { name: event.name }).click();
    await page.waitForURL(`/${guild.id}/${event.id}/register`);
    await page.waitForLoadState("networkidle");

    await page
      .locator("div.MuiPaper-root", { hasText: item1.name })
      .getByRole("button", { name: "1" })
      .click();

    const total = 1 * display1.price;
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(
      `¥${total}`,
    );

    await page.getByRole("button", { name: "登録" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("contentinfo").getByText("¥")).toHaveText(`¥0`);

    await context.setOffline(false);

    await page.goto(`/${guild.id}/${event.id}/receipts`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("cell").getByText("¥")).toHaveText(
      `¥${total.toLocaleString()}`,
    );
  });
});
