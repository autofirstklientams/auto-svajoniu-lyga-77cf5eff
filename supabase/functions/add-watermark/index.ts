import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple AutoKopers logo as SVG (text-based watermark)
const WATERMARK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700');
    </style>
  </defs>
  <text x="100" y="35" 
        font-family="Inter, Arial, sans-serif" 
        font-size="24" 
        font-weight="700" 
        fill="white" 
        fill-opacity="0.7"
        text-anchor="middle"
        filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.5))">
    AutoKOPERS
  </text>
</svg>
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, carId } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching image:', imageUrl);

    // Fetch the original image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileName = `${carId || 'imported'}/${timestamp}-${randomId}.jpg`;

    console.log('Uploading image to storage:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('car-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully:', urlData.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          url: urlData.publicUrl,
          path: fileName 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
