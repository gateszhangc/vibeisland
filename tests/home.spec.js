const { test, expect } = require("@playwright/test");

test.describe("Vibe Island homepage", () => {
  test("desktop homepage renders key marketing sections and metadata", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Vibe Island/i);
    await expect(page.locator("h1")).toHaveText(/dynamic island/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /macOS dynamic island/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://vibeisland.lol/");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "site.webmanifest");
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Vibe Island");
    await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
      "content",
      /dynamic island agent controls/i
    );

    await expect(page.getByRole("link", { name: "Download preview" })).toBeVisible();
    await expect(page.locator(".feature-card")).toHaveCount(6);
    await expect(page.locator(".update-card")).toHaveCount(3);
    await expect(page.locator(".faq-list details")).toHaveCount(6);

    const jsonLdEntries = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
      nodes.map((node) => JSON.parse(node.textContent || "{}"))
    );

    const softwareApplication = jsonLdEntries.find((entry) => entry["@type"] === "SoftwareApplication");
    const faqPage = jsonLdEntries.find((entry) => entry["@type"] === "FAQPage");
    const organization = jsonLdEntries.find((entry) => entry["@type"] === "Organization");
    const website = jsonLdEntries.find((entry) => entry["@type"] === "WebSite");

    expect(softwareApplication?.operatingSystem).toBe("macOS");
    expect(softwareApplication?.offers?.price).toBe("19.99");
    expect(faqPage?.mainEntity).toHaveLength(6);
    expect(organization?.url).toBe("https://vibeisland.lol/");
    expect(website?.name).toBe("Vibe Island");

    await page.getByText("Can I approve actions without switching to the terminal?").click();
    await expect(page.getByText(/core part of the product story/i)).toBeVisible();

    const imagesLoaded = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imagesLoaded).toBe(true);
  });

  test("seo support files stay accessible and aligned with the production domain", async ({ page }) => {
    const robotsResponse = await page.request.get("/robots.txt");
    const sitemapResponse = await page.request.get("/sitemap.xml");
    const manifestResponse = await page.request.get("/site.webmanifest");
    const healthResponse = await page.request.get("/healthz");

    expect(robotsResponse.ok()).toBe(true);
    expect(await robotsResponse.text()).toContain("Sitemap: https://vibeisland.lol/sitemap.xml");
    expect(await robotsResponse.text()).toContain("Host: vibeisland.lol");

    expect(sitemapResponse.ok()).toBe(true);
    expect(await sitemapResponse.text()).toContain("<loc>https://vibeisland.lol/</loc>");
    expect(await sitemapResponse.text()).toContain("<lastmod>2026-04-20</lastmod>");

    expect(manifestResponse.ok()).toBe(true);
    expect(await manifestResponse.json()).toMatchObject({
      name: "Vibe Island",
      scope: "/",
      start_url: "/"
    });

    expect(healthResponse.ok()).toBe(true);
    expect(await healthResponse.json()).toEqual({ ok: true });
  });

  test("mobile homepage keeps pricing and faq accessible without horizontal overflow", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.getByRole("link", { name: "Download preview" })).toBeVisible();
    await page.getByRole("link", { name: "See pricing" }).click();
    await expect(page.locator("#pricing")).toBeInViewport();

    const localFaq = page.locator("details", {
      has: page.locator("summary", { hasText: "Does my data leave my machine?" })
    });

    await localFaq.locator("summary").click();
    await expect(localFaq.locator("p")).toHaveText(/fully local/i);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await context.close();
  });
});
