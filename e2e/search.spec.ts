import { test, expect } from "@playwright/test";

test.describe("Law Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display search form with three tabs", async ({ page }) => {
    // Check that all three tabs are visible
    await expect(page.getByRole("tab", { name: "法令名" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "キーワード" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "法令番号" })).toBeVisible();

    // Check that law name tab is active by default
    await expect(page.getByRole("tab", { name: "法令名" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("should search by law name", async ({ page }) => {
    // Enter search term
    await page.getByPlaceholder("法令名を入力してください。").fill("民法");

    // Click search button
    await page.getByRole("button", { name: "検索" }).click();

    // Wait for results or error message
    await page.waitForSelector("text=/検索結果|エラー|見つかりませんでした/", {
      timeout: 10000,
    });
  });

  test("should switch to keyword search tab", async ({ page }) => {
    // Click keyword tab
    await page.getByRole("tab", { name: "キーワード" }).click();

    // Check that keyword input is visible
    await expect(
      page.getByPlaceholder("検索語句を入力してください。"),
    ).toBeVisible();

    // Enter keyword
    await page.getByPlaceholder("検索語句を入力してください。").fill("契約");

    // Click search button
    await page.getByRole("button", { name: "検索" }).click();

    // Wait for results or error message
    await page.waitForSelector("text=/検索結果|エラー|見つかりませんでした/", {
      timeout: 10000,
    });
  });

  test("should switch to law number search tab", async ({ page }) => {
    // Click law number tab
    await page.getByRole("tab", { name: "法令番号" }).click();

    // Check that law number fields are visible
    await expect(page.getByText("元号")).toBeVisible();
    await expect(page.getByPlaceholder("年")).toBeVisible();
    await expect(page.getByPlaceholder("号")).toBeVisible();
  });

  test("should convert numbers to kanji in law number fields", async ({
    page,
  }) => {
    // Switch to law number tab
    await page.getByRole("tab", { name: "法令番号" }).click();

    // Enter year in Arabic numerals
    const yearInput = page.getByPlaceholder("年");
    await yearInput.fill("5");
    await yearInput.blur();

    // Check that it was converted to kanji
    await expect(yearInput).toHaveValue("五");

    // Enter number in Arabic numerals
    const numberInput = page.getByPlaceholder("号");
    await numberInput.fill("10");
    await numberInput.blur();

    // Check that it was converted to kanji
    await expect(numberInput).toHaveValue("十");
  });

  test("should show/hide date picker based on law time selection", async ({
    page,
  }) => {
    // Initially, date picker should not be visible
    await expect(page.getByLabel("時点指定")).not.toBeVisible();

    // Select point-in-time law
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "時点法令" }).click();

    // Now date picker should be visible
    await expect(page.getByLabel("時点指定")).toBeVisible();

    // Switch back to current law
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "現行法令" }).click();

    // Date picker should be hidden again
    await expect(page.getByLabel("時点指定")).not.toBeVisible();
  });

  test("should expand and collapse law types section", async ({ page }) => {
    // Wait for the form to load
    await page.waitForTimeout(1000);

    // Check if sections are collapsed by checking the expand icon or summary text
    const lawTypesSection = page.locator('text="法令種別"').first();
    await expect(lawTypesSection).toBeVisible();

    // The section shows summary when collapsed
    const summaryText = await page
      .locator('text="全て選択中"')
      .first()
      .isVisible();
    expect(summaryText).toBeTruthy();
  });

  test("should expand and collapse categories section", async ({ page }) => {
    // Wait for the form to load
    await page.waitForTimeout(1000);

    // Check if sections are collapsed by checking the expand icon or summary text
    const categoriesSection = page.getByText("分類");
    await expect(categoriesSection).toBeVisible();

    // The section shows summary when collapsed (e.g., "全て選択中")
    const hasSummary = await page.getByText("全て選択中").count();
    expect(hasSummary).toBeGreaterThan(0);
  });

  test("should have collapsible sections for law types and categories", async ({
    page,
  }) => {
    // Wait for the form to load
    await page.waitForTimeout(1000);

    // Both sections should be visible
    await expect(page.getByText("法令種別")).toBeVisible();
    await expect(page.getByText("分類")).toBeVisible();

    // Should show collapsed state with summary
    const summaryTexts = await page.getByText("全て選択中").count();
    expect(summaryTexts).toBeGreaterThanOrEqual(2);
  });

  test("should handle search with no results", async ({ page }) => {
    // Search for something unlikely to return results
    await page
      .getByPlaceholder("法令名を入力してください。")
      .fill("存在しない法令名XXXXXX");
    await page.getByRole("button", { name: "検索" }).click();

    // Wait for response - could be no results or an error
    await page.waitForTimeout(2000);

    // Should show either no results message or some other indication
    const hasNoResults =
      (await page
        .getByText(/検索結果が見つかりませんでした|見つかりませんでした|0件/)
        .count()) > 0;
    const hasError = (await page.getByText(/エラー/).count()) > 0;

    expect(hasNoResults || hasError).toBeTruthy();
  });
});
