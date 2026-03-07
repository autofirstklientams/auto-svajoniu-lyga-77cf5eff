import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const makeIdMapping: Record<string, string> = {
  "Abarth": "102", "Acura": "103", "Alfa Romeo": "104", "Audi": "99",
  "BMW": "97", "Bentley": "98", "Buick": "96", "BYD": "32287",
  "Cadillac": "95", "Chevrolet": "94", "Chrysler": "93", "Citroen": "92",
  "Cupra": "28897", "Dacia": "110", "Daewoo": "91", "Daihatsu": "90",
  "Dodge": "89", "DS Automobiles": "29763", "Ferrari": "87", "Fiat": "86",
  "Ford": "85", "Genesis": "32616", "GMC": "41", "Honda": "84",
  "Hummer": "83", "Hyundai": "82", "Infiniti": "81", "Isuzu": "80",
  "Jaguar": "79", "Jeep": "78", "Kia": "77", "Lada": "76",
  "Lamborghini": "75", "Lancia": "74", "Land Rover": "73", "Lexus": "72",
  "Lincoln": "71", "Lotus": "70", "Maserati": "69", "Mazda": "68",
  "McLaren": "24629", "Mercedes-Benz": "67", "MG": "65", "Mini": "64",
  "Mitsubishi": "63", "Nissan": "62", "Oldsmobile": "61", "Opel": "60",
  "Peugeot": "59", "Plymouth": "58", "Polestar": "31465", "Pontiac": "57",
  "Porsche": "56", "Renault": "54", "Rolls-Royce": "53", "Rover": "52",
  "Saab": "51", "Seat": "49", "Skoda": "48", "Smart": "47",
  "SsangYong": "40", "Subaru": "46", "Suzuki": "45", "Tesla": "19524",
  "Toyota": "44", "Volkswagen": "43", "Volvo": "42",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const make = url.searchParams.get("make");

    // If no make, return list of makes
    if (!make) {
      const makes = Object.keys(makeIdMapping).sort();
      return new Response(JSON.stringify({ makes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const makeId = makeIdMapping[make];
    if (!makeId) {
      return new Response(JSON.stringify({ error: "Unknown make", models: [] }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(
      `https://autoplius.lt/importhandler?datacollector=1&category_id=2&make_id=${makeId}`
    );

    if (!resp.ok) {
      throw new Error(`Autoplius API returned ${resp.status}`);
    }

    const xmlText = await resp.text();
    const models: string[] = [];
    const itemRegex = /<item>\s*<id>(\d+)<\/id>\s*<title>([^<]+)<\/title>\s*<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const title = match[2].trim();
      if (title !== "-kita-") {
        models.push(title);
      }
    }

    return new Response(JSON.stringify({ models }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg, models: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
