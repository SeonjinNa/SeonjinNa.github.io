const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

test("homepage retains personal sections and the complete news history", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Seonjin Na", exact: true })).toBeVisible();
  for (const name of ["Work Experiences", "News", "Academic Services"]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  const newsCount = fs.readdirSync(path.resolve(__dirname, "../../_news")).filter((name) => name.endsWith(".md")).length;
  const news = page.locator(".news tr");
  await expect(news).toHaveCount(newsCount);
  await expect(news.filter({ hasText: "Our technical report Nemotron 3.5 Super and Lightning:" })).toContainText("Oct 14, 2026");
  await expect(news.filter({ hasText: "Our model Nemotron 3.5 Lightning" })).toContainText("Aug 11, 2026");
  const dates = (await news.locator("th").allTextContents()).map((date) => Date.parse(date.trim()));
  expect(dates.every((date, index) => Number.isFinite(date) && (index === 0 || dates[index - 1] >= date))).toBeTruthy();
  await expect(page.locator("article")).toContainText("Senior High Performance AI Engineer");
  await expect(page.locator("article")).toContainText("HW-SW Co-Design for Efficient and Scalable AI Training/Inference");
  await expect(page.locator("article")).toContainText("Travel Grant Chair");
});

test("publications preserve report credits and downloadable PDFs", async ({ page, request }) => {
  await page.goto("/publications/");
  for (const key of ["nemotron35super_lightning", "nemotron3ultra", "nemotron3super"]) {
    const entry = page.locator(`#${key}`);
    await expect(entry.locator(".author")).toHaveText("NVIDIA (including Seonjin Na)");
    await expect(entry.locator("a").filter({ hasText: /^Blog$/ })).toBeVisible();
  }
  await expect(page.locator("#gmsbench .author")).toContainText("Seonjin Na");
  for (const pdf of ["GMSBench.pdf", "Nemotron3_5_Super_and_Lightning.pdf", "Seonjin_CV.pdf"]) {
    const response = await request.get(`/assets/pdf/${pdf}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
});

test("readers can filter publications without losing their links", async ({ page }) => {
  await page.goto("/publications/");
  const search = page.locator("#bibsearch");
  await expect(search).toBeVisible({ timeout: 3000 });
  await search.fill("GMSBench");
  await expect(page.locator("#gmsbench")).toBeVisible();
  await expect(page.locator("#nemotron3ultra")).toBeHidden();
  await search.clear();
  await expect(page.locator("#nemotron3ultra")).toBeVisible();
});

test("site search finds a personal publication through the keyboard shortcut", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#search-toggle")).toBeVisible({ timeout: 3000 });
  await page.keyboard.press("ControlOrMeta+k");
  const search = page.locator("ninja-keys input");
  await expect(search).toBeVisible();
  await search.fill("GMSBench");
  await expect(page.locator("ninja-keys")).toContainText("GMSBench");
});

test("CV preserves education, work, awards and academic service entries", async ({ page }) => {
  await page.goto("/cv/");
  for (const text of [
    "Current Information",
    "Education",
    "Working Experiences",
    "Honors and Awards",
    "Academic Services",
    "Summa Cum Laude",
    "CoC Outstanding Post-Doctoral Research Award",
    "2016",
    "2023",
    "2012",
    "2015",
    "Artifact Evaluation Committee",
    "EuroSys",
  ]) {
    await expect(page.locator("article")).toContainText(text);
  }
  await expect(page.locator("article")).toContainText(/2016\s*[-–]\s*2023/);
  await expect(page.locator("article")).toContainText(/2012\s*[-–]\s*2015/);
  await expect(page.locator("article")).toContainText("2025. 11 - Present");
  await expect(page.locator('a[href="/assets/pdf/Seonjin_CV.pdf"]').first()).toBeVisible();
});

test("mobile navigation reaches publications without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".navbar-toggler").click();
  await page.locator("#navbarNav").getByRole("link", { name: "Publications", exact: true }).click();
  await expect(page).toHaveURL(/\/publications\/$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("color theme remains usable after navigation", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if ((await page.locator("html").getAttribute("data-theme")) === "dark") break;
    await page.locator("#light-toggle").click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/publications/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("homepage news stays compact and older announcements remain scrollable", async ({ page }) => {
  await page.goto("/");
  const news = page.locator(".news .table-responsive");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const dimensions = await news.evaluate((element) => ({
      height: element.clientHeight,
      contentHeight: element.scrollHeight,
      overflowY: getComputedStyle(element).overflowY,
    }));
    expect(dimensions.height).toBeLessThanOrEqual(400);
    expect(dimensions.contentHeight).toBeGreaterThan(dimensions.height);
    expect(dimensions.overflowY).toBe("auto");
    await news.evaluate((element) => {
      element.scrollTop = 0;
    });
    await news.hover();
    await page.mouse.wheel(0, 450);
    await expect.poll(() => news.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  }
});

test("CV entry wrappers have no markers while description bullets remain visible", async ({ page }) => {
  await page.goto("/cv/");
  const wrappers = page.locator(".cv ul.list-group > li.list-group-item");
  expect(await wrappers.count()).toBeGreaterThan(0);
  const wrapperStyles = await wrappers.evaluateAll((items) =>
    items.map((item) => ({
      marker: getComputedStyle(item).listStyleType,
      display: getComputedStyle(item).display,
    }))
  );
  expect(wrapperStyles.every((style) => style.marker === "none" || !style.display.includes("list-item"))).toBeTruthy();
  const descriptions = page.locator(".cv li.list-group-item ul > li");
  expect(await descriptions.count()).toBeGreaterThan(0);
  const descriptionStyles = await descriptions.evaluateAll((items) => items.map((item) => getComputedStyle(item).listStyleType));
  expect(descriptionStyles.every((style) => style !== "none")).toBeTruthy();
});
