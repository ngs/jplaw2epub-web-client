import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should display header with title", async ({ page }) => {
    await page.goto("/");

    await page.screenshot({ path: "screenshots/01-01.png", fullPage: true });

    // Check header title
    await expect(page.getByText("法令検索・EPUB ダウンロード")).toBeVisible();
  });

  test("should navigate to home when clicking title", async ({ page }) => {
    await page.goto("/");

    // Click on the title link
    await page
      .getByRole("link", { name: "法令検索・EPUB ダウンロード" })
      .click();

    // Should stay on home page
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("tab", { name: "法令名" })).toBeVisible();

    await page.screenshot({ path: "screenshots/02-01.png", fullPage: true });
  });

  test("should open help page in new tab", async ({ page, context }) => {
    await page.goto("/");

    // Listen for new page
    const pagePromise = context.waitForEvent("page");

    // Click help link
    await page.getByRole("link", { name: "ヘルプ" }).click();

    // Get the new page
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    await page.screenshot({ path: "screenshots/03-01.png", fullPage: true });

    // Should navigate to help page in new tab
    await expect(newPage).toHaveURL(/\/help\/$/);

    // Check that help content is displayed
    await expect(
      newPage.getByRole("heading", {
        name: "法令検索・EPUB ダウンロード ヘルプ",
      }),
    ).toBeVisible();
  });

  test("should display help page correctly", async ({ page }) => {
    // Go to help page directly
    await page.goto("/help/");

    // Check that help content is displayed
    await expect(
      page.getByRole("heading", { name: "法令検索・EPUB ダウンロード ヘルプ" }),
    ).toBeVisible();

    // Check some help content exists
    await expect(page.getByText("使い方")).toBeVisible();
  });

  test("should preserve search state in URL", async ({ page }) => {
    await page.goto("/");

    // Enter search term
    await page.getByPlaceholder("法令名を入力してください。").fill("民法");

    await page.screenshot({ path: "screenshots/04-01.png", fullPage: true });

    // Click search
    await page.getByRole("button", { name: "検索" }).click();

    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });

    await page.screenshot({ path: "screenshots/04-02.png", fullPage: true });

    // URL should contain search parameters
    const url = page.url();
    expect(url).toContain("lawTitle=");

    // Reload the page
    await page.reload();

    // Search term should still be in the input
    await expect(
      page.getByPlaceholder("法令名を入力してください。"),
    ).toHaveValue("民法");

    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });
    await page.screenshot({ path: "screenshots/04-03.png", fullPage: true });
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("/");

    // Perform first search
    await page.getByPlaceholder("法令名を入力してください。").fill("民法");
    await page.getByRole("button", { name: "検索" }).click();
    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });
    await page.screenshot({ path: "screenshots/05-01.png", fullPage: true });

    // Perform second search
    await page.getByPlaceholder("法令名を入力してください。").fill("刑法");
    await page.getByRole("button", { name: "検索" }).click();
    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });

    await page.screenshot({ path: "screenshots/05-02.png", fullPage: true });

    // Go back
    await page.goBack();
    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });

    await page.screenshot({ path: "screenshots/05-03.png", fullPage: true });

    // Should show first search
    await expect(
      page.getByPlaceholder("法令名を入力してください。"),
    ).toHaveValue("民法");

    // Go forward
    await page.goForward();
    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });

    await page.screenshot({ path: "screenshots/05-04.png", fullPage: true });

    // Should show second search
    await expect(
      page.getByPlaceholder("法令名を入力してください。"),
    ).toHaveValue("刑法");
  });

  test("should handle direct URL navigation with search params", async ({
    page,
  }) => {
    // Navigate directly to a URL with search parameters
    await page.goto("/?lawTitle=憲法");

    // Search input should be populated
    await expect(
      page.getByPlaceholder("法令名を入力してください。"),
    ).toHaveValue("憲法");

    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });

    await page.screenshot({ path: "screenshots/06-01.png", fullPage: true });
  });

  test("should handle tab switching via URL", async ({ page }) => {
    // Navigate to keyword search tab via URL
    await page.goto("/?searchMode=keyword&keyword=契約");

    // Keyword tab should be active
    await expect(page.getByRole("tab", { name: "キーワード" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Keyword input should be populated
    await expect(
      page.getByPlaceholder("検索語句を入力してください。"),
    ).toHaveValue("契約");

    await page.waitForSelector("text=/検索結果/", {
      timeout: 10000,
    });

    await page.screenshot({ path: "screenshots/07-01.png", fullPage: true });
  });

  test("should maintain scroll position on search", async ({ page }) => {
    await page.goto("/");

    // Perform a search
    await page.getByPlaceholder("法令名を入力してください。").fill("法");
    await page.getByRole("button", { name: "検索" }).click();

    // Wait for results
    await page.waitForSelector("text=/検索結果|エラー|見つかりませんでした/", {
      timeout: 10000,
    });

    // If there are results, scroll should be at top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThanOrEqual(100);

    await page.screenshot({ path: "screenshots/08-01.png", fullPage: true });
  });
});
