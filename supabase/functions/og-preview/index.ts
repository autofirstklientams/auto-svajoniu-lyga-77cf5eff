// Edge function that returns OG-rich HTML to social crawlers
// and 302-redirects real users to the actual car page.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://www.autokopers.lt";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const isBot = (ua: string) => {
  if (!ua) return false;
  const u = ua.toLowerCase();
  return /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|viber|skypeuripreview|pinterest|redditbot|googlebot|bingbot|embedly|preview|vkshare|yandexbot|applebot|line/i.test(u);
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || url.searchParams.get("id");
  const ua = req.headers.get("user-agent") || "";

  const targetUrl = slug ? `${SITE}/automobiliai/${slug}` : SITE;

  // Real users → redirect immediately
  if (!isBot(ua)) {
    return Response.redirect(targetUrl, 302);
  }

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    // Try slug first, then UUID id
    let { data: car } = await supabase
      .from("cars")
      .select("id, slug, make, model, year, price, mileage, fuel_type, image_url, description")
      .eq("slug", slug)
      .maybeSingle();

    if (!car) {
      const { data: byId } = await supabase
        .from("cars")
        .select("id, slug, make, model, year, price, mileage, fuel_type, image_url, description")
        .eq("id", slug)
        .maybeSingle();
      car = byId;
    }

    if (!car) {
      return new Response("Not found", { status: 404 });
    }

    // First image
    let image = car.image_url || `${SITE}/autokopers-social-v3.jpg`;
    const { data: imgs } = await supabase
      .from("car_images")
      .select("image_url")
      .eq("car_id", car.id)
      .order("display_order", { ascending: true })
      .limit(1);
    if (imgs && imgs.length > 0) image = imgs[0].image_url;

    const priceFmt = new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(car.price || 0);
    const title = `${car.make} ${car.model} (${car.year}) – ${priceFmt}`;
    const desc = [
      car.mileage ? `${car.mileage.toLocaleString("lt-LT")} km` : null,
      car.fuel_type,
      "Autokopers – patikimi automobiliai ir finansavimas.",
    ].filter(Boolean).join(" • ");

    const canonical = `${SITE}/automobiliai/${car.slug || car.id}`;

    const html = `<!DOCTYPE html>
<html lang="lt">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta http-equiv="refresh" content="0; url=${canonical}">
</head>
<body><a href="${canonical}">${escapeHtml(title)}</a></body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    console.error("og-preview error:", e);
    return Response.redirect(targetUrl, 302);
  }
});
