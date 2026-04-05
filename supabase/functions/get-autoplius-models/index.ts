import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory cache (per isolate lifetime)
const modelCache = new Map<string, { data: Array<{ name: string; id: string }>; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const makeId = url.searchParams.get("make_id");

    if (!makeId) {
      return new Response(
        JSON.stringify({ error: "make_id parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache
    const cached = modelCache.get(makeId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch from Autoplius datacollector with browser-like headers
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ];
    const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
    const targetUrl = `https://autoplius.lt/importhandler?datacollector=1&category_id=2&make_id=${makeId}`;

    const resp = await fetch(targetUrl, {
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "lt-LT,lt;q=0.9,en;q=0.8",
        "Referer": "https://autoplius.lt/",
        "Cache-Control": "no-cache",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Autoplius API error: ${resp.status}`, text.substring(0, 200));

      // Fallback: try via Firecrawl
      const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (firecrawlKey) {
        console.log("Trying Firecrawl fallback...");
        const fcResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: targetUrl,
            formats: ["html"],
            waitFor: 2000,
          }),
        });

        if (fcResp.ok) {
          const fcData = await fcResp.json();
          const htmlContent = fcData?.data?.html || "";
          if (htmlContent) {
            const fcModels: Array<{ name: string; id: string }> = [];
            const fcRegex = /<item>\s*<id>(\d+)<\/id>\s*<title>([^<]+)<\/title>\s*<\/item>/gi;
            let fcMatch;
            while ((fcMatch = fcRegex.exec(htmlContent)) !== null) {
              const name = fcMatch[2].trim();
              if (name !== "-kita-") {
                fcModels.push({ id: fcMatch[1], name });
              }
            }
            fcModels.sort((a, b) => a.name.localeCompare(b.name));
            modelCache.set(makeId, { data: fcModels, ts: Date.now() });
            return new Response(JSON.stringify(fcModels), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          const fcErr = await fcResp.text();
          console.error("Firecrawl fallback failed:", fcErr.substring(0, 200));
        }
      }

      return new Response(
        JSON.stringify({ error: "Failed to fetch models from Autoplius" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const xmlText = await resp.text();

    // Parse <item><id>ID</id><title>NAME</title></item>
    const models: Array<{ name: string; id: string }> = [];
    const itemRegex = /<item>\s*<id>(\d+)<\/id>\s*<title>([^<]+)<\/title>\s*<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const name = match[2].trim();
      // Skip the "-kita-" entry from display
      if (name !== "-kita-") {
        models.push({ id: match[1], name });
      }
    }

    models.sort((a, b) => a.name.localeCompare(b.name));

    // Cache result
    modelCache.set(makeId, { data: models, ts: Date.now() });

    return new Response(JSON.stringify(models), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
