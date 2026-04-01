import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from 'jsr:@matmen/imagescript';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MASK_MODEL = 'google/gemini-3.1-flash-image-preview';
const BG_COLOR = { r: 240, g: 240, b: 240 };

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
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

const rgbaToPixel = (r: number, g: number, b: number, a: number) =>
  ((((r & 255) << 24) >>> 0) | ((g & 255) << 16) | ((b & 255) << 8) | (a & 255)) >>> 0;

const blendChannel = (foreground: number, background: number, keepStrength: number) =>
  Math.round(foreground * keepStrength + background * (1 - keepStrength));

const getKeepStrength = (maskRgba: Uint8ClampedArray) => {
  const luminance = (0.299 * maskRgba[0] + 0.587 * maskRgba[1] + 0.114 * maskRgba[2]) / 255;
  const alpha = maskRgba[3] / 255;
  const raw = Math.max(luminance, alpha);

  if (raw <= 0.12) return 0;
  if (raw >= 0.88) return 1;
  return (raw - 0.12) / (0.88 - 0.12);
};

const parseGeneratedImageBase64 = (aiData: any): string | null => {
  // Lovable AI Gateway returns OpenAI-compatible format
  const content = aiData?.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    // Check if it's a base64 image in markdown format
    const match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (match) return match[1];
  }
  // Also check for inline_data format (Gemini native)
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part?.type === 'image_url' && part?.image_url?.url) {
        const m = part.image_url.url.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (m) return m[1];
      }
    }
  }
  // Fallback: check candidates format (direct Gemini)
  const parts = aiData?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(
    (p: any) => p?.inlineData?.mimeType?.startsWith('image/') || p?.inline_data?.mime_type?.startsWith('image/')
  );
  return imagePart?.inlineData?.data ?? imagePart?.inline_data?.data ?? null;
};

const generateMaskWithAi = async (apiKey: string, mimeType: string, imageBase64: string) => {
  const maskPrompt = `Create ONLY a binary segmentation mask for the main vehicle in this image.

Output rules:
- Return one image only, at EXACTLY the same resolution.
- White (#FFFFFF) = vehicle pixels to keep (body, paint, trim, lights, mirrors, wheels, tires, glass, badges, plate, visible interior through windows).
- Include the natural contact shadow directly under the vehicle in white.
- Black (#000000) = everything else (full background).
- No colors, no text, no logos, no gradients, no gray background.
- Do NOT crop, zoom, rotate, move, or redraw anything.`;

  const aiResponse = await fetch(
    'https://ai.gateway.lovable.dev/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MASK_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: maskPrompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        }],
        temperature: 0,
      }),
    }
  );

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('Mask generation API error:', aiResponse.status, errorText);

    if (aiResponse.status === 429) {
      throw new HttpError(429, 'Per daug užklausų, bandykite vėliau');
    }
    if (aiResponse.status === 402) {
      throw new HttpError(402, 'AI kreditas išnaudotas, papildykite sąskaitą');
    }
    if (aiResponse.status === 401 || aiResponse.status === 403) {
      throw new HttpError(401, 'Neteisingas AI API raktas');
    }
    throw new HttpError(500, `AI API klaida: ${aiResponse.status}`);
  }

  const aiData = await aiResponse.json();
  console.log('AI response keys:', Object.keys(aiData));
  const maskBase64 = parseGeneratedImageBase64(aiData);

  if (!maskBase64) {
    console.error('No mask image in AI response:', JSON.stringify(aiData).slice(0, 800));
    throw new Error('AI nepateikė kaukės rezultato');
  }

  return base64ToBytes(maskBase64);
};

const composeWithOriginalCar = async (originalBytes: Uint8Array, maskBytes: Uint8Array) => {
  const originalImage = await Image.decode(originalBytes);
  const maskImage = await Image.decode(maskBytes);

  if (maskImage.width !== originalImage.width || maskImage.height !== originalImage.height) {
    maskImage.resize(originalImage.width, originalImage.height);
  }

  const outputImage = new Image(originalImage.width, originalImage.height);

  for (let y = 1; y <= originalImage.height; y++) {
    for (let x = 1; x <= originalImage.width; x++) {
      const source = originalImage.getRGBAAt(x, y);
      const mask = maskImage.getRGBAAt(x, y);
      const keepStrength = getKeepStrength(mask);

      const r = blendChannel(source[0], BG_COLOR.r, keepStrength);
      const g = blendChannel(source[1], BG_COLOR.g, keepStrength);
      const b = blendChannel(source[2], BG_COLOR.b, keepStrength);

      outputImage.setPixelAt(x, y, rgbaToPixel(r, g, b, 255));
    }
  }

  return await outputImage.encode();
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

    const { imageUrl, carId } = await req.json();
    if (!imageUrl || !carId) {
      return jsonResponse({ error: 'Missing imageUrl or carId' }, 400);
    }

    const normalizedUrl = normalizeImageUrl(imageUrl);
    console.log(`Processing strict background removal for car ${carId}, imageUrl: ${normalizedUrl.slice(0, 120)}`);

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

    let originalBytes: Uint8Array;
    let sourceMimeType = 'image/jpeg';

    try {
      const storagePath = extractStoragePath(normalizedUrl);
      console.log('Downloading from storage path:', storagePath);

      const { data: fileData, error: downloadError } = await supabase.storage.from('car-images').download(storagePath);

      if (downloadError || !fileData) {
        console.error('Storage download error:', downloadError);
        const fallbackResponse = await fetch(normalizedUrl);
        if (!fallbackResponse.ok) {
          throw new Error(`Fetch fallback failed: ${fallbackResponse.status}`);
        }

        sourceMimeType = fallbackResponse.headers.get('content-type') || sourceMimeType;
        originalBytes = new Uint8Array(await fallbackResponse.arrayBuffer());
      } else {
        sourceMimeType = fileData.type || sourceMimeType;
        originalBytes = new Uint8Array(await fileData.arrayBuffer());
      }
    } catch (downloadError) {
      console.error('Failed to download source image:', downloadError);
      throw new Error('Nepavyko atsisiųsti originalios nuotraukos');
    }

    const originalBase64 = bytesToBase64(originalBytes);
    const maskBytes = await generateMaskWithAi(geminiApiKey, sourceMimeType, originalBase64);
    const composedPng = await composeWithOriginalCar(originalBytes, maskBytes);

    const fileName = `showroom/${carId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_bg-removed.png`;

    const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, composedPng, {
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

    console.log(`Background removed with locked car pixels: ${publicUrl}`);

    return jsonResponse({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Background replacement error:', error);

    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    return jsonResponse({ error: error instanceof Error ? error.message : 'Nežinoma klaida' }, 500);
  }
});
