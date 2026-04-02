import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "jsr:@matmen/imagescript";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};



class RecoverableUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecoverableUserError";
  }
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalizeImageUrl = (imageUrl: string) => {
  let normalized = imageUrl;
  if (normalized.includes("/storage/v1/render/image/public/")) {
    normalized = normalized.replace(
      "/storage/v1/render/image/public/",
      "/storage/v1/object/public/",
    );
  }
  const queryIndex = normalized.indexOf("?");
  if (queryIndex !== -1) {
    normalized = normalized.slice(0, queryIndex);
  }
  return normalized;
};

const extractStoragePath = (normalizedUrl: string) => {
  const bucketPrefix = "/storage/v1/object/public/car-images/";
  const pathStart = normalizedUrl.indexOf(bucketPrefix);
  if (pathStart === -1) {
    throw new Error("URL nėra saugyklos nuotraukos URL");
  }
  return normalizedUrl.slice(pathStart + bucketPrefix.length);
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const downloadSourceImage = async (
  supabase: any,
  normalizedUrl: string,
): Promise<{ bytes: Uint8Array; mimeType: string }> => {
  const storagePath = extractStoragePath(normalizedUrl);
  console.log("Downloading from storage path:", storagePath);

  const { data: fileData, error: downloadError } = await supabase.storage
    .from("car-images")
    .download(storagePath);

  if (downloadError || !fileData) {
    console.error("Storage download error:", downloadError);
    const statusCode = (downloadError as any)?.statusCode;
    const message = (downloadError as any)?.message || "";
    if (
      statusCode === "404" || statusCode === 404 ||
      message.includes("Object not found")
    ) {
      throw new RecoverableUserError(
        "Originali nuotrauka nerasta saugykloje. Įkelkite nuotrauką iš naujo ir bandykite dar kartą.",
      );
    }

    const fallbackResponse = await fetch(normalizedUrl);
    if (!fallbackResponse.ok) {
      if (fallbackResponse.status === 400 || fallbackResponse.status === 404) {
        throw new RecoverableUserError(
          "Originali nuotrauka nerasta saugykloje. Įkelkite nuotrauką iš naujo ir bandykite dar kartą.",
        );
      }
      throw new Error(`Fetch fallback failed: ${fallbackResponse.status}`);
    }
    return {
      bytes: new Uint8Array(await fallbackResponse.arrayBuffer()),
      mimeType: fallbackResponse.headers.get("content-type") || "image/jpeg",
    };
  }

  return {
    bytes: new Uint8Array(await fileData.arrayBuffer()),
    mimeType: fileData.type || "image/jpeg",
  };
};

const PROMPT =
  `Replace ONLY the background behind this car. Do NOT modify the car in any way.

BACKGROUND STYLE — THIS IS CRITICAL, follow exactly:
- Think of a FLAT PHOTOGRAPH of a white wall, NOT a 3D room render
- The background is a SINGLE flat surface: a smooth warm-white / very light gray painted wall
- The wall fills the ENTIRE background behind the car from edge to edge, top to bottom
- There are NO corners, NO side walls, NO ceiling, NO floor-to-wall curves, NO 3D perspective
- The floor is light gray smooth epoxy, matte finish, with a very subtle contact shadow under the car
- The wall and floor meet at a simple straight horizontal line — no curved sweep, no cove, no ramp
- Lighting: bright, even, soft, diffused — like a professional car photography studio flat backdrop
- The upper wall area must be completely clean and empty (no text, no logos, no signs)
- This must look like a REAL dealership photo with a flat painted wall — NOT a CGI studio, NOT a cyclorama, NOT a 3D-rendered room

WHAT TO ABSOLUTELY AVOID:
- ❌ NO 3D room with visible corners where walls meet
- ❌ NO curved infinity cove / cyclorama sweep between wall and floor  
- ❌ NO visible ceiling or ceiling lights
- ❌ NO side walls or wall edges
- ❌ NO dark shadows in corners
- ❌ NO dramatic lighting or gradients on walls
- ❌ The result must NOT look like a box or enclosed room

CAR PRESERVATION — MANDATORY:
- Copy every car pixel exactly as-is — do NOT regenerate, redraw, recolor, reshape, or enhance
- Do NOT change paint color, shine, reflections, scratches, wheels, lights, glass, interior
- Do NOT change position, angle, scale, proportions, or perspective
- Do NOT add any text, watermarks, logos, or overlays
- Output at the EXACT same resolution as the input
- If uncertain whether a pixel belongs to the car or background, treat it as CAR`;

const callAiGateway = async (
  apiKey: string,
  imageDataUrl: string,
): Promise<any> => {
  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
        temperature: 0,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw { retryable: true, message: "Rate limited" };
    }
    if (response.status === 402) {
      throw new Error("AI kreditai išnaudoti. Papildykite balansą per Settings → Workspace → Usage.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Neteisingas API raktas");
    }
    throw new Error(`AI API klaida: ${response.status}`);
  }

  const aiData = await response.json();

  // Check for gateway-level errors wrapped in 200 response
  if (aiData?.error) {
    const errCode = aiData.error.code || aiData.error.status;
    const errMsg = aiData.error.message || "Unknown AI error";
    console.error("AI gateway error in response body:", errCode, errMsg);
    if (errCode === 429) {
      throw { retryable: true, message: "Rate limited (in body)" };
    }
    if (errCode === 402) {
      throw new Error("AI kreditai išnaudoti. Papildykite balansą per Settings → Workspace → Usage.");
    }
    throw new Error(`AI klaida: ${errMsg}`);
  }

  return aiData;
};

const replaceBackgroundWithAi = async (
  apiKey: string,
  mimeType: string,
  imageBase64: string,
): Promise<Uint8Array> => {
  const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [5000, 10000, 20000]; // 5s, 10s, 20s

  let lastError: any;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = RETRY_DELAYS[attempt - 1] || 20000;
        console.log(`Retry attempt ${attempt}/${MAX_RETRIES}, waiting ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }

      const aiData = await callAiGateway(apiKey, imageDataUrl);

      // Extract image from response
      const images = aiData?.choices?.[0]?.message?.images;
      if (images && images.length > 0) {
        const imgUrl = images[0]?.image_url?.url;
        if (imgUrl && imgUrl.startsWith("data:")) {
          const base64Part = imgUrl.split(",")[1];
          if (base64Part) {
            return base64ToBytes(base64Part);
          }
        }
      }

      // Fallback: inline_data format
      const parts = aiData?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(
        (p: any) =>
          p?.inlineData?.mimeType?.startsWith("image/") ||
          p?.inline_data?.mime_type?.startsWith("image/"),
      );
      const resultBase64 = imagePart?.inlineData?.data ?? imagePart?.inline_data?.data;
      if (resultBase64) {
        return base64ToBytes(resultBase64);
      }

      console.error("No image in AI response:", JSON.stringify(aiData).slice(0, 500));
      throw new Error("AI nepateikė nuotraukos rezultato");

    } catch (err: any) {
      lastError = err;
      if (err?.retryable && attempt < MAX_RETRIES) {
        console.warn(`Rate limited, will retry (attempt ${attempt + 1}/${MAX_RETRIES})`);
        continue;
      }
      throw err?.retryable
        ? new Error("Per daug užklausų. Bandykite vėliau arba keiskite nuotraukas po vieną.")
        : err;
    }
  }

  throw lastError;
};

const overlayLogo = async (
  resultBytes: Uint8Array,
  supabase: any,
  isMainPhoto: boolean,
): Promise<Uint8Array> => {
  if (!isMainPhoto) return resultBytes;

  try {
    const resultImage = await Image.decode(resultBytes);
    const w = resultImage.width;
    const h = resultImage.height;

    const { data: topLogoData } = await supabase.storage
      .from("car-images")
      .download("branding/logo_top.png");

    if (!topLogoData) {
      console.warn("Top logo not found, skipping overlay");
      return resultBytes;
    }

    const topLogoBytes = new Uint8Array(await topLogoData.arrayBuffer());
    let topLogo = await Image.decode(topLogoBytes);

    // Logo: large, centered horizontally on the wall above the car
    const targetTopW = Math.round(w * 0.50);
    const topScale = targetTopW / topLogo.width;
    topLogo.resize(targetTopW, Math.round(topLogo.height * topScale));

    const topX = Math.round((w - targetTopW) / 2); // centered
    const topY = Math.round(h * 0.08); // high on wall
    resultImage.composite(topLogo, topX, topY);

    return await resultImage.encode();
  } catch (err) {
    console.error("Logo overlay error (non-fatal):", err);
    return resultBytes;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { imageUrl, carId, isMainPhoto } = await req.json();
    if (!imageUrl || !carId) {
      return jsonResponse({ error: "Missing imageUrl or carId" }, 400);
    }

    const normalizedUrl = normalizeImageUrl(imageUrl);
    console.log(
      `Processing background replacement for car ${carId}, isMainPhoto: ${!!isMainPhoto}`,
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing storage credentials");
    }
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Download source image
    const { bytes: originalBytes, mimeType } = await downloadSourceImage(
      supabase,
      normalizedUrl,
    );
    console.log(`Downloaded image: ${originalBytes.length} bytes, ${mimeType}`);

    // 2. AI replaces background via Lovable AI
    const aiResultBytes = await replaceBackgroundWithAi(
      lovableApiKey,
      mimeType,
      bytesToBase64(originalBytes),
    );
    console.log(`AI result: ${aiResultBytes.length} bytes`);

    // 3. Programmatically overlay logo for main photo
    const finalBytes = await overlayLogo(
      aiResultBytes,
      supabase,
      !!isMainPhoto,
    );
    console.log(`Final image: ${finalBytes.length} bytes`);

    // 4. Upload result
    const fileName = `showroom/${carId}/${Date.now()}_${
      Math.random().toString(36).slice(2, 8)
    }_bg-removed.png`;

    const { error: uploadError } = await supabase.storage
      .from("car-images")
      .upload(fileName, finalBytes, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Nepavyko įkelti nuotraukos");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("car-images").getPublicUrl(fileName);

    console.log(`Background replaced successfully: ${publicUrl}`);

    return jsonResponse({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Background replacement error:", error);

    if (error instanceof RecoverableUserError) {
      return jsonResponse({ success: false, error: error.message }, 200);
    }

    return jsonResponse(
      { error: error instanceof Error ? error.message : "Nežinoma klaida" },
      500,
    );
  }
});
