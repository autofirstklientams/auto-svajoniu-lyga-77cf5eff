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

    // Fetch from Autoplius datacollector
    const resp = await fetch(
      `https://autoplius.lt/importhandler?datacollector=1&category_id=2&make_id=${makeId}`
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Autoplius API error: ${resp.status}`, text);
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
