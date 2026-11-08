import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const serverEntryPath = path.resolve(distDir, "server", "entry-server.js");

const SITE_URL = "https://sri-yarn-tales.vercel.app";

async function prerender() {
  console.log("\n🚀 Starting Static Site Generation / Pre-rendering...\n");

  if (!fs.existsSync(serverEntryPath)) {
    console.error(`❌ Server build not found at: ${serverEntryPath}`);
    console.error("Please run 'vite build --ssr src/entry-server.jsx --outDir dist/server' first.");
    process.exit(1);
  }

  const templatePath = path.resolve(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Client build template not found at: ${templatePath}`);
    console.error("Please run 'vite build' first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");
  const { render } = await import(`file://${serverEntryPath}`);

  // Load products and categories data for routes
  const productsPath = path.resolve(rootDir, "src", "data", "products.json");
  const categoriesPath = path.resolve(rootDir, "src", "data", "categories.json");

  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));

  // Routes to pre-render
  const staticRoutes = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/shop", priority: "0.9", changefreq: "daily" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/custom-orders", priority: "0.8", changefreq: "weekly" },
    { url: "/cart", priority: "0.5", changefreq: "monthly" },
    { url: "/wishlist", priority: "0.5", changefreq: "monthly" },
  ];

  const categoryRoutes = categories.map((c) => ({
    url: `/shop/${c.slug}`,
    priority: "0.8",
    changefreq: "weekly",
  }));

  const productRoutes = products.map((p) => ({
    url: `/product/${p.slug}`,
    priority: "0.9",
    changefreq: "weekly",
  }));

  const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];
  console.log(`📦 Discovered ${allRoutes.length} routes to pre-render into static HTML.`);

  let successCount = 0;

  for (const { url } of allRoutes) {
    try {
      const helmetContext = {};
      const { html } = render(url, helmetContext);

      // Extract title and meta tags if present in rendered HTML
      let pageHtml = template;

      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/);
      if (titleMatch && titleMatch[1]) {
        pageHtml = pageHtml.replace(
          /<title[^>]*>.*?<\/title>/i,
          `<title>${titleMatch[1]}</title>`
        );
      }

      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*\/?>/i);
      if (descMatch && descMatch[1]) {
        pageHtml = pageHtml.replace(
          /<meta[^>]*name=["']description["'][^>]*content=["'][^"']*["'][^>]*\/?>/i,
          `<meta name="description" content="${descMatch[1]}" />`
        );
      }

      // Extract JSON-LD schema script if present
      const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLdMatch && jsonLdMatch[0]) {
        pageHtml = pageHtml.replace("</head>", `  ${jsonLdMatch[0]}\n</head>`);
      }

      // Inject rendered app HTML into root container
      pageHtml = pageHtml.replace(
        /<div\s+id=["']root["']>[\s\S]*?<\/div>/,
        `<div id="root">${html}</div>`
      );

      // Determine output file path
      const filePath =
        url === "/"
          ? path.resolve(distDir, "index.html")
          : path.resolve(distDir, url.replace(/^\//, ""), "index.html");

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, pageHtml, "utf-8");

      successCount++;
      process.stdout.write(`  [${successCount}/${allRoutes.length}] Pre-rendered: ${url}\n`);
    } catch (err) {
      console.error(`\n❌ Failed to pre-render route "${url}":`, err);
    }
  }

  // Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.url === "/" ? "" : r.url}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  fs.writeFileSync(path.resolve(distDir, "sitemap.xml"), sitemapXml, "utf-8");
  console.log("\n📄 Generated sitemap.xml with all routes.");

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.resolve(distDir, "robots.txt"), robotsTxt, "utf-8");
  console.log("🤖 Generated robots.txt.");

  // Clean up server build directory to keep dist clean
  const serverDir = path.resolve(distDir, "server");
  if (fs.existsSync(serverDir)) {
    fs.rmSync(serverDir, { recursive: true, force: true });
    console.log("🧹 Cleaned temporary server bundle.");
  }

  console.log(`\n✨ Static Site Generation complete! ${successCount} pages ready for deployment.\n`);
}

prerender();

