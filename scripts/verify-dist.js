import fs from "node:fs";

const home = fs.readFileSync("dist/index.html", "utf-8");
console.log("=== VERIFYING dist/index.html ===");
const h1Home = home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
console.log("1. Has H1:", Boolean(h1Home));
console.log("   H1 content:", h1Home ? h1Home[1].replace(/<[^>]+>/g, "").trim() : "NONE");
console.log("2. Has Product names (e.g. Pastel Bunny):", home.includes("Pastel Bunny Amigurumi"));
console.log("3. Has Category names (e.g. Amigurumi Toys):", home.includes("Amigurumi Toys"));
console.log("4. Has Hero image alt:", home.includes('alt="Handmade crochet item 1"'));
console.log("5. Has Category image alt:", home.includes('alt="Amigurumi Toys"'));
console.log("6. Has Product Card image alt:", home.includes('alt="Pastel Bunny Amigurumi"'));

const prod = fs.readFileSync("dist/product/amigurumi-bunny-pastel/index.html", "utf-8");
console.log("\n=== VERIFYING dist/product/amigurumi-bunny-pastel/index.html ===");
const h1Prod = prod.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
console.log("1. Has H1:", Boolean(h1Prod));
console.log("   H1 content:", h1Prod ? h1Prod[1].replace(/<[^>]+>/g, "").trim() : "NONE");
console.log("2. Has Product Name in title:", prod.includes("<title>Pastel Bunny Amigurumi | Sri Yarn &amp; Tales</title>") || prod.includes("<title>Pastel Bunny Amigurumi | Sri Yarn & Tales</title>"));
console.log("3. Has Price (649):", prod.includes("649"));
console.log("4. Has Description:", prod.includes("Meet our adorable Pastel Bunny, handcrafted with ultra-soft premium cotton yarn"));
console.log("5. Has Image alt (Main view):", prod.includes('alt="Pastel Bunny Amigurumi - view 1"'));
console.log("6. Has Image alt (Thumbnails):", prod.includes('alt="Pastel Bunny Amigurumi thumbnail 1"'));
console.log("7. Has Schema JSON-LD:", prod.includes("application/ld+json"));

const shop = fs.readFileSync("dist/shop/index.html", "utf-8");
console.log("\n=== VERIFYING dist/shop/index.html ===");
const h1Shop = shop.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
console.log("1. Has H1:", Boolean(h1Shop));
console.log("   H1 content:", h1Shop ? h1Shop[1].replace(/<[^>]+>/g, "").trim() : "NONE");
console.log("2. Has Products in shop:", shop.includes("Pastel Bunny Amigurumi"));

