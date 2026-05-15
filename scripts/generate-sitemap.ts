// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.autokopers.lt";
const SUPABASE_URL = "https://vjdzzaerrxfctkkiwkmn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZHp6YWVycnhmY3Rra2l3a21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDg0NTMsImV4cCI6MjA3NjEyNDQ1M30.GeSztoIRuyqxlAqp-PBSIRSlA3K8OzTPQmXjiwxcCJs";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/automobiliai", changefreq: "daily", priority: "0.9" },
  { path: "/car-search", changefreq: "weekly", priority: "0.8" },
  { path: "/car-purchase", changefreq: "monthly", priority: "0.7" },
  { path: "/leasing", changefreq: "monthly", priority: "0.8" },
  { path: "/lizingas", changefreq: "monthly", priority: "0.8" },
  { path: "/sell-your-car", changefreq: "monthly", priority: "0.7" },
  { path: "/didmena", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

async function fetchCars(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cars?select=slug,updated_at&slug=not.is.null&or=(is_sold.is.null,is_sold.eq.false)&limit=5000`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );
    if (!res.ok) {
      console.warn(`sitemap: car fetch failed (${res.status}), skipping dynamic entries`);
      return [];
    }
    const rows = (await res.json()) as Array<{ slug: string; updated_at: string }>;
    return rows
      .filter((r) => r.slug)
      .map((r) => ({
        path: `/automobiliai/${r.slug}`,
        lastmod: r.updated_at?.slice(0, 10),
        changefreq: "weekly" as const,
        priority: "0.8",
      }));
  } catch (e) {
    console.warn("sitemap: car fetch error, skipping dynamic entries:", e);
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const dynamicEntries = await fetchCars();
const entries = [...staticEntries, ...dynamicEntries];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries: ${staticEntries.length} static + ${dynamicEntries.length} cars)`);
