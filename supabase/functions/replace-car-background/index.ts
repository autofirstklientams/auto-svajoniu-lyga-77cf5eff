import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageUrl, carId, isMainPhoto = false } = await req.json();
    if (!imageUrl || !carId) {
      return new Response(JSON.stringify({ error: 'Missing imageUrl or carId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing background replacement for car ${carId}, isMainPhoto: ${isMainPhoto}, imageUrl: ${imageUrl.substring(0, 100)}`);

    // Normalize URL: convert render/image URLs back to object URLs and strip query params
    let normalizedUrl = imageUrl;
    if (normalizedUrl.includes('/storage/v1/render/image/public/')) {
      normalizedUrl = normalizedUrl.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/');
    }
    // Strip any query parameters (width, quality, resize, etc.)
    const qIdx = normalizedUrl.indexOf('?');
    if (qIdx !== -1) {
      normalizedUrl = normalizedUrl.substring(0, qIdx);
    }
    console.log(`Normalized URL: ${normalizedUrl.substring(0, 100)}`);

    const brandingSection = isMainPhoto ? `
=== MANDATORY BRANDING ON WALL ===
THIS IS THE MOST IMPORTANT REQUIREMENT FOR THIS IMAGE. You MUST place a large dealership sign on the back wall:

SIGN DESIGN (follow exactly):
- The sign consists of TWO parts side by side: "AUTO" and "KOPERS"
- "AUTO" text is WHITE and placed INSIDE a LARGE dark navy blue filled rectangle (hex #2B3A5C). The rectangle has slightly rounded corners.
- "KOPERS" text is DARK GREY (hex #4A4A4A) placed directly to the RIGHT of the blue rectangle, with NO background — just the text on the white wall
- Both parts are on the SAME horizontal line, forming one continuous sign: [AUTO] KOPERS
- Font: very bold, wide, uppercase, modern sans-serif (like Impact, Montserrat Black, or similar heavy weight)

SIGN SIZE AND POSITION:
- The sign must be VERY LARGE — approximately 30-40% of the total wall width
- The text height should be roughly 8-12% of the image height — it must be clearly dominant and readable
- Centered horizontally on the wall
- Positioned just above the car's roofline — NOT at the very top of the wall, but in the middle-upper area
- The sign must be flat on the wall surface as if physically mounted there

DO NOT make the sign small or subtle. It should be the DOMINANT visual element on the wall behind the car.
` : '';

    const forbiddenSigns = isMainPhoto 
      ? '- No other cars, people, plants, signs (except the AUTOKOPERS sign), text, watermarks'
      : '- No other cars, people, plants, signs, logos, text, watermarks';

    const prompt = `You are a professional automotive photo editor specializing in dealership photography. Your task is to seamlessly composite a car into a studio environment.

=== STEP 1: CLASSIFY THE IMAGE ===
Determine the photo type by examining the PRIMARY subject matter:
- INTERIOR photo: Dashboard, steering wheel, seats, gear shift, center console, door panels shot FROM INSIDE the cabin → Go to INTERIOR RULES
- EXTERIOR photo: Car body visible from outside → Go to EXTERIOR RULES
- ENGINE BAY / DETAIL photo: Close-up of engine, wheels, badges, damage → OUTPUT THE IMAGE UNCHANGED, no modifications needed

=== INTERIOR RULES ===
1. Keep 100% of all interior surfaces, textures, materials, stitching, screens, buttons, trim UNCHANGED
2. Keep all window glass and its reflections/tint UNCHANGED  
3. ONLY replace the scenery VISIBLE THROUGH the windows (sky, trees, buildings, parking lot, other vehicles) with a clean neutral white/light grey backdrop (#F0F0F0)
4. Maintain the original lighting on the interior — do not re-light or color-correct any cabin surface
5. OUTPUT the result. Do NOT apply showroom rules.

=== EXTERIOR RULES ===

**CAR PRESERVATION (ABSOLUTE PRIORITY — violation = failure):**
- Every pixel of the car body, paint, panels, bumpers, mirrors, door handles, roof rails, antenna, wipers MUST remain pixel-identical
- Wheels, tires, wheel arches, brake calipers, lug nuts — UNCHANGED
- All glass (windshield, side windows, rear window, sunroof) including reflections and tint — UNCHANGED
- Grille, headlights, taillights, fog lights, indicators, exhaust tips — UNCHANGED
- License plates, badges, emblems, model lettering — UNCHANGED  
- Any dirt, scratches, stone chips, imperfections on the car — KEEP THEM, do not clean or restore
- Shadow directly under the car (ground shadow) — preserve its natural shape
- CRITICAL RULE: If a region is DARK, ask yourself "Is this part of the car?" — black paint, dark tires, tinted glass, black trim, carbon fiber, dark alloys are ALL car parts. NEVER replace them.

**BACKGROUND SEGMENTATION:**
- Background = everything that is NOT the car: sky, clouds, sun, trees, grass, bushes, buildings, fences, poles, road surface beyond the car's shadow, other vehicles in the distance, people, signs
- The dividing line is the car's silhouette edge — trace it precisely
- When in doubt whether a pixel is car or background, keep it as car

**SHOWROOM ENVIRONMENT (replace background with this):**
- Room: Large open rectangular space, completely empty
- Floor: Polished light grey epoxy (#D0D0D0), seamless, extends to walls. Subtle diffused car reflection (~25-30% opacity, soft/blurred, not mirror-sharp)
- Walls: Flat matte near-white (#F0F0F0), perfectly uniform, zero texture, no panels/joints/trim/doors/windows
- Lighting: Even diffused overhead illumination, no visible light sources, no harsh shadows, no spotlights, no colored light. Neutral ~5500K daylight
- The ONLY shadow in the scene is a soft contact shadow directly beneath the car on the floor
${brandingSection}
**STRICTLY FORBIDDEN:**
${forbiddenSigns}
- No windows, glass walls, or any view to outside
- No colored accent lighting, neon strips, or spotlights  
- No visible ceiling structure, beams, ducts, or vents
- No wall gradients — solid flat color only
- No props, furniture, plants, or decorative elements
- Do NOT alter the car's color temperature, exposure, contrast, or white balance
- Do NOT sharpen, denoise, or apply any filter to the car pixels
- Do NOT crop, resize, rotate, or reposition the car in the frame

**CRITICAL FRAMING RULE — THIS IS THE #1 PRIORITY AFTER CAR PRESERVATION:**
- The car MUST occupy the EXACT SAME percentage of the image as in the input photo
- If the car fills 70% of the frame width in the original, it must fill 70% in the output
- Do NOT zoom out, pull back, or add ANY extra empty space around the car
- Do NOT make the car appear smaller, further away, or more distant
- Do NOT add more ceiling/wall/floor space than what replaces the original background
- The car's pixel boundaries (top, bottom, left, right edges) must remain at the SAME positions in the frame
- Simply REPLACE the background pixels — do not recompose or reframe the scene
- Think of it as a mask operation: keep car pixels, swap only non-car pixels

OUTPUT: One photorealistic composite image at the EXACT same resolution. The car must be IDENTICAL in size and position — only the background changes.`;

    // Download image using Supabase storage client (more reliable than raw fetch)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let imageBase64: string;
    try {
      // Extract storage path from URL: everything after /object/public/car-images/
      const bucketPrefix = '/storage/v1/object/public/car-images/';
      const pathStart = normalizedUrl.indexOf(bucketPrefix);
      if (pathStart === -1) {
        throw new Error('URL nėra Supabase storage URL');
      }
      const storagePath = normalizedUrl.substring(pathStart + bucketPrefix.length);
      console.log('Downloading from storage path:', storagePath);

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('car-images')
        .download(storagePath);

      if (downloadError || !fileData) {
        console.error('Storage download error:', downloadError);
        // Fallback: try raw fetch with full URL
        console.log('Trying raw fetch fallback...');
        const imgResponse = await fetch(normalizedUrl);
        if (!imgResponse.ok) {
          throw new Error(`Fetch fallback failed: ${imgResponse.status}`);
        }
        const imgBuffer = await imgResponse.arrayBuffer();
        const imgBytes = new Uint8Array(imgBuffer);
        const binaryStr = Array.from(imgBytes).map(b => String.fromCharCode(b)).join('');
        const base64 = btoa(binaryStr);
        const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
        imageBase64 = `data:${contentType};base64,${base64}`;
      } else {
        const arrayBuffer = await fileData.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const binaryStr = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
        const base64 = btoa(binaryStr);
        const contentType = fileData.type || 'image/jpeg';
        imageBase64 = `data:${contentType};base64,${base64}`;
      }
    } catch (fetchErr) {
      console.error('Failed to download source image:', fetchErr);
      throw new Error('Nepavyko atsisiųsti originalios nuotraukos');
    }

    // Call Gemini API directly
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Extract base64 data and mime type from data URL
    const base64Match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid base64 image format');
    }
    const mimeType = base64Match[1];
    const rawBase64 = base64Match[2];

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: rawBase64 } },
            ],
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            temperature: 0.4,
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Per daug užklausų, bandykite vėliau' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (aiResponse.status === 401 || aiResponse.status === 403) {
        return new Response(JSON.stringify({ error: 'Neteisingas Gemini API raktas' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();

    // Find the image part in the response (support both camelCase and snake_case)
    const parts = aiData.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (p: any) =>
        p.inlineData?.mimeType?.startsWith('image/') ||
        p.inline_data?.mime_type?.startsWith('image/')
    );

    const generatedBase64 = imagePart?.inlineData?.data ?? imagePart?.inline_data?.data;

    if (!generatedBase64) {
      console.error('No image in Gemini response:', JSON.stringify(aiData).slice(0, 500));
      throw new Error('AI nepateikė nuotraukos rezultato');
    }

    // Convert base64 to blob and upload to storage
    const imageBytes = Uint8Array.from(atob(generatedBase64), c => c.charCodeAt(0));

    // Reuse the supabase client created earlier

    const fileName = `showroom/${carId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;

    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, imageBytes, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Nepavyko įkelti nuotraukos');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(fileName);

    console.log(`Background replaced successfully: ${publicUrl}`);

    return new Response(
      JSON.stringify({ success: true, url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Background replacement error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Nežinoma klaida' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
