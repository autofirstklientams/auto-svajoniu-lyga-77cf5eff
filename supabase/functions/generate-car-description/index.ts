const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');
    if (!COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY is not configured');
    }

    const { make, model, year, mileage, fuel_type, transmission, body_type, color, engine_capacity, power_kw, doors, seats, condition, features, defects } = await req.json();

    if (!make || !model) {
      return new Response(JSON.stringify({ error: 'Markė ir modelis privalomi' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build feature list from features object
    let featureList = '';
    if (features && typeof features === 'object') {
      const allFeatures: string[] = [];
      for (const category of Object.values(features)) {
        if (Array.isArray(category)) {
          allFeatures.push(...category);
        }
      }
      if (allFeatures.length > 0) {
        featureList = `\nĮranga: ${allFeatures.join(', ')}`;
      }
    }

    const carInfo = [
      `Markė: ${make}`,
      `Modelis: ${model}`,
      year ? `Metai: ${year}` : null,
      mileage ? `Rida: ${mileage.toLocaleString()} km` : null,
      fuel_type ? `Kuras: ${fuel_type}` : null,
      transmission ? `Pavarų dėžė: ${transmission}` : null,
      body_type ? `Kėbulo tipas: ${body_type}` : null,
      color ? `Spalva: ${color}` : null,
      engine_capacity ? `Variklio tūris: ${engine_capacity} l` : null,
      power_kw ? `Galia: ${power_kw} kW (${Math.round(power_kw * 1.36)} AG)` : null,
      doors ? `Durys: ${doors}` : null,
      seats ? `Vietos: ${seats}` : null,
      condition ? `Būklė: ${condition}` : null,
      defects ? `Defektai: ${defects}` : null,
      featureList || null,
    ].filter(Boolean).join('\n');

    const prompt = `Esi profesionalus automobilių pardavėjas Lietuvoje, dirbantis AutoKOPERS įmonėje Kaune. 
Parašyk patrauklų, profesionalų automobilio skelbimo aprašymą lietuvių kalba.

Automobilio duomenys:
${carInfo}

TAISYKLĖS:
- Rašyk TIKTAI lietuviškai, natūralia kalba
- Aprašymas turi būti 3-5 sakinių, informatyvus ir patrauklus
- Pabrėžk pagrindinius privalumus ir ypatybes
- Jei yra defektų, paminėk juos sąžiningai bet diplomatiškai
- Nerašyk kainos, kontaktų ar kvietimų susisiekti
- Nerašyk "AutoKOPERS" ar įmonės pavadinimo
- Nenaudok šauktukų ar per daug emocinio teksto
- Pradėk nuo automobilio pristatymo, ne nuo žodžio "Siūlome"`;

    const response = await fetch('https://api.cohere.com/v2/chat', that
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) raising
, {
      const errorText = await response.text();
      console.error('Cohere API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Per daug užklausų, bandykite vėliau' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: 'Neteisingas Cohere API raktas' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.message?.content?.[0]?.text || '';

    if (!description) {
      throw new Error('AI nepateikė aprašymo');
    }

    return new Response(
      JSON.stringify({ success: true, description: description.trim() }),
      { O headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Description generation error:', error);
    return    Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Nežinoma klaida' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
