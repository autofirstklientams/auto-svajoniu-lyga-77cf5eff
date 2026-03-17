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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

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
=== BRANDING ON WALL ===
On the back wall behind the car, place a company logo/sign reading "AUTOKOPERS" in large dark blue capital letters (hex #2B5A8C). The text should be:
- Centered horizontally on the wall
- Positioned in the upper third of the wall (above car roof level)
- Clean sans-serif bold font
- The word "AUTO" should have a dark blue rounded rectangle background behind it, and "KOPERS" should be dark grey (#4A4A4A) without background — like a professional dealership sign
- Size: large enough to be clearly readable but not overwhelming — approximately 15-20% of wall width
- Flat on the wall surface, not floating
` : '';

    const forbiddenSigns = isMainPhoto 
      ? '- No other cars, people, plants, signs (except the AUTOKOPERS sign), text, watermarks'
      : '- No other cars, people, plants, signs, logos, text, watermarks';

    const prompt = `You are an expert photo compositor. Your ONLY task: replace the OUTDOOR/EXTERIOR background behind and around the car with a showroom environment. Do NOT touch any part of the car itself, including dark/black areas like tires, grilles, window tints, shadows under the car, or dark paint.

=== CAR PRESERVATION (ABSOLUTE) ===
- The car pixels must remain 100% unchanged: shape, color, reflections, dirt, scratches, wheels, license plate, angle, size, position in frame
- Do NOT relight, recolor, sharpen, blur, crop, scale, or reposition the car
- Preserve the exact pixel boundary/silhouette of the car
- CRITICAL: Dark areas that are PART OF THE CAR (black paint, dark tires, tinted windows, grille, exhaust, shadow underneath) must NOT be treated as background. Only replace what is clearly outdoor scenery (sky, trees, buildings, road, grass, parking lot, etc.)

=== SHOWROOM SPECIFICATION (MUST MATCH EXACTLY) ===
Environment: A single large empty rectangular room, no columns, no furniture, no decorations
Floor: Smooth polished LIGHT GREY epoxy (hex ~#D0D0D0), perfectly flat, extends to walls. Shows a soft diffused reflection of the car (not mirror-sharp, ~30% opacity)
Walls: Flat matte white (#F0F0F0), completely blank, no panels, no windows, no doors, no trim
Ceiling: Not visible or implied by even overhead lighting
Lighting: Bright diffused overhead LED panels creating EVEN illumination with NO visible light sources, NO spotlights, NO directional shadows. Soft ambient fill from all sides
Color temperature: Neutral daylight ~5500K, no warm/cool tint
Atmosphere: Clean, minimal, sterile — like a white photography studio with grey floor
Shadow: The car casts a single soft contact shadow directly beneath it on the grey floor
${brandingSection}
=== FORBIDDEN ===
${forbiddenSigns}
- No windows, glass walls, outdoor scenery, sky reflections
- No colored accent lighting, neon, spotlights
- No visible ceiling structure, beams, or vents
- No gradients on walls (keep solid flat white)
- Do NOT replace dark car parts (tires, grille, black trim, tinted glass) with showroom — only replace actual outdoor background

Output one photorealistic image.`;

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

    // Call Lovable AI Gateway with the base64 image
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Per daug užklausų, bandykite vėliau' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI kreditas išnaudotas' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('No image in AI response:', JSON.stringify(aiData).slice(0, 500));
      throw new Error('AI nepateikė nuotraukos rezultato');
    }

    // Convert base64 to blob and upload to storage
    const base64Data = generatedImageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

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
