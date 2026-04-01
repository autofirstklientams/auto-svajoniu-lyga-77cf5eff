import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from 'jsr:@matmen/imagescript';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = 'gemini-2.5-flash-image';

class RecoverableUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecoverableUserError';
  }
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const normalizeImageUrl = (imageUrl: string) => {
  let normalized = imageUrl;
  if (normalized.includes('/storage/v1/render/image/public/')) {
    normalized = normalized.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/');
  }
  const queryIndex = normalized.indexOf('?');
  if (queryIndex !== -1) {
    normalized = normalized.slice(0, queryIndex);
  }
  return normalized;
};

const extractStoragePath = (normalizedUrl: string) => {
  const bucketPrefix = '/storage/v1/object/public/car-images/';
  const pathStart = normalizedUrl.indexOf(bucketPrefix);
  if (pathStart === -1) {
    throw new Error('URL nėra saugyklos nuotraukos URL');
  }
  return normalizedUrl.slice(pathStart + bucketPrefix.length);
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
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
  normalizedUrl: string
): Promise<{ bytes: Uint8Array; mimeType: string }> => {
  const storagePath = extractStoragePath(normalizedUrl);
  console.log('Downloading from storage path:', storagePath);

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('car-images')
    .download(storagePath);

  if (downloadError || !fileData) {
    console.error('Storage download error:', downloadError);
    const statusCode = (downloadError as any)?.statusCode;
    const message = (downloadError as any)?.message || '';
    if (statusCode === '404' || statusCode === 404 || message.includes('Object not found')) {
      throw new RecoverableUserError(
        'Originali nuotrauka nerasta saugykloje. Įkelkite nuotrauką iš naujo ir bandykite dar kartą.'
      );
    }

    const fallbackResponse = await fetch(normalizedUrl);
    if (!fallbackResponse.ok) {
      if (fallbackResponse.status === 400 || fallbackResponse.status === 404) {
        throw new RecoverableUserError(
          'Originali nuotrauka nerasta saugykloje. Įkelkite nuotrauką iš naujo ir bandykite dar kartą.'
        );
      }
      throw new Error(`Fetch fallback failed: ${fallbackResponse.status}`);
    }
    return {
      bytes: new Uint8Array(await fallbackResponse.arrayBuffer()),
      mimeType: fallbackResponse.headers.get('content-type') || 'image/jpeg',
    };
  }

  return {
    bytes: new Uint8Array(await fileData.arrayBuffer()),
    mimeType: fileData.type || 'image/jpeg',
  };
};

const parseGeneratedImageBase64 = (aiData: any): string | null => {
  const parts = aiData?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(
    (p: any) => p?.inlineData?.mimeType?.startsWith('image/') || p?.inline_data?.mime_type?.startsWith('image/')
  );
  return imagePart?.inlineData?.data ?? imagePart?.inline_data?.data ?? null;
};

const replaceBackgroundWithAi = async (
  apiKey: string,
  mimeType: string,
  imageBase64: string
): Promise<Uint8Array> => {
  const prompt = `You are a background replacement tool. Your ONLY job is to replace the background. You must NOT touch the car AT ALL.

STEP 1 — Identify the car:
- Detect every single pixel that belongs to the car (body, paint, wheels, tires, rims, lights, mirrors, glass, reflections on paint, shadows on body, badges, emblems, license plates, antenna, wipers, door handles, exhaust pipes, interior visible through windows)
- Create a precise mask around the car — every car pixel must be preserved EXACTLY as-is

STEP 2 — Replace ONLY the background pixels with:
- Clean, bright studio setting with soft professional lighting
- Light gray to white gradient background, similar to a car showroom or photography studio
- Subtle reflective floor surface beneath the car showing a gentle reflection/shadow
- Soft, even lighting with no harsh shadows — like professional automotive photography
- The environment should look like a high-end car dealership photo studio

ABSOLUTE RULES — VIOLATION = FAILURE:
- The car must be IDENTICAL to the input — copy every car pixel exactly, do NOT regenerate, redraw, recolor, reshape, or enhance the car
- Do NOT change paint color, shine, reflections, scratches, dirt — keep them ALL
- Do NOT alter wheels, tires, rims, brake calipers — they must be IDENTICAL
- Do NOT modify headlights, taillights, indicators, fog lights
- Do NOT change the car's position, angle, scale, proportions, or perspective
- Do NOT smooth, sharpen, denoise, or enhance ANY part of the car
- Do NOT change window tint, glass reflections, or interior visibility
- Do NOT add any text, watermarks, logos, or overlays
- Output at the EXACT same resolution as the input
- If ANY pixel is uncertain whether it belongs to the car or background, treat it as CAR and leave it untouched`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          temperature: 0,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);

    if (response.status === 429) {
      throw new Error('Per daug užklausų, bandykite vėliau');
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('Neteisingas Gemini API raktas');
    }
    throw new Error(`AI API klaida: ${response.status}`);
  }

  const aiData = await response.json();
  const resultBase64 = parseGeneratedImageBase64(aiData);

  if (!resultBase64) {
    console.error('No image in AI response:', JSON.stringify(aiData).slice(0, 500));
    throw new Error('AI nepateikė nuotraukos rezultato');
  }

  return base64ToBytes(resultBase64);
};

const overlayLogo = async (
  resultBytes: Uint8Array,
  supabase: any,
  isMainPhoto: boolean
): Promise<Uint8Array> => {
  if (!isMainPhoto) return resultBytes;

  try {
    const resultImage = await Image.decode(resultBytes);
    const w = resultImage.width;
    const h = resultImage.height;

    // Download top logo
    const { data: topLogoData } = await supabase.storage
      .from('car-images')
      .download('branding/logo_top.png');

    if (!topLogoData) {
      console.warn('Top logo not found, skipping overlay');
      return resultBytes;
    }

    const topLogoBytes = new Uint8Array(await topLogoData.arrayBuffer());
    let topLogo = await Image.decode(topLogoBytes);

    // Scale top logo to ~28% of image width — visible but not covering the car
    const targetTopW = Math.round(w * 0.28);
    const topScale = targetTopW / topLogo.width;
    topLogo.resize(targetTopW, Math.round(topLogo.height * topScale));

    // Position: on the wall above the car, not on the car itself
    const topX = Math.round((w - topLogo.width) / 2);
    const topY = Math.round(h * 0.08);
    resultImage.composite(topLogo, topX, topY);


    return await resultImage.encode();
  } catch (err) {
    console.error('Logo overlay error (non-fatal):', err);
    return resultBytes;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { imageUrl, carId, isMainPhoto } = await req.json();
    if (!imageUrl || !carId) {
      return jsonResponse({ error: 'Missing imageUrl or carId' }, 400);
    }

    const normalizedUrl = normalizeImageUrl(imageUrl);
    console.log(`Processing background replacement for car ${carId}, isMainPhoto: ${!!isMainPhoto}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing storage credentials');
    }
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Download source image
    const { bytes: originalBytes, mimeType } = await downloadSourceImage(supabase, normalizedUrl);
    console.log(`Downloaded image: ${originalBytes.length} bytes, ${mimeType}`);

    // 2. AI replaces background ONLY (no logo, no car modification)
    const aiResultBytes = await replaceBackgroundWithAi(geminiApiKey, mimeType, bytesToBase64(originalBytes));
    console.log(`AI result: ${aiResultBytes.length} bytes`);

    // 3. Programmatically overlay logo for main photo
    const finalBytes = await overlayLogo(aiResultBytes, supabase, !!isMainPhoto);
    console.log(`Final image: ${finalBytes.length} bytes`);

    // 4. Upload result
    const fileName = `showroom/${carId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_bg-removed.png`;

    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, finalBytes, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Nepavyko įkelti nuotraukos');
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('car-images').getPublicUrl(fileName);

    console.log(`Background replaced successfully: ${publicUrl}`);

    return jsonResponse({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Background replacement error:', error);

    if (error instanceof RecoverableUserError) {
      return jsonResponse({ success: false, error: error.message }, 200);
    }

    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Nežinoma klaida' },
      500
    );
  }
});
