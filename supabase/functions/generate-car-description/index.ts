const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const prompt = `Esi profesionalus automobilių pardavėjas Lietuvoje, dirbantis „autokopers" įmonėje Kaune.
Parašyk profesionalų automobilio skelbimo aprašymą lietuvių kalba pagal tikslią AutoKOPERS stilistiką.

Automobilio duomenys:
${carInfo}

=== APRAŠYMO STRUKTŪRA (laikykis šios tvarkos) ===

1. ĮŽANGINIS PARAGRAFAS:
Pradėk nuo patrauklaus, bet santūraus įvado apie autokopers patirtį ir kompetenciją. Pvz.: "Pastebėjote šį skelbimą? Tuomet pataikėte į vietą, kur automobiliai – ne atsitiktinis užsiėmimas, o daugiau nei dešimtmetį trunkanti patirtis ir darbas su tuo, kas klientams svarbiausia."

2. AUTOMOBILIO PRISTATYMAS:
Vienas paragrafas apie automobilį – jo charakterį, paskirtį, variklio ypatybes, pavarų dėžę, varomųjų ratų sistemą (jei yra). Pabrėžk dinamiką, ekonomiškumą ir praktiškumą. Tonalumas – dalykiškas, bet šiltas.

3. VAIRAVIMO PATIRTIS:
Trumpas paragrafas apie vairavimo komfortą – sėdėseną, matomumą, manevringumą, važiuoklės stabilumą.

4. KOMPLEKTACIJA IR ĮRANGA:
Detalus paragrafas apie įrangą. Jei pateikti features duomenys – išvardink svarbiausius. Rašyk natūraliai, ne sausu sąrašu. Pabaigoje gali pridėti šmaikščią pastabą (pvz., "super mamasitos patirtį ;)"). Paminėk salono praktiškumą, keleivių erdvę ir bagažinę.

5. PASLAUGŲ BLOKAS (visada identiškas):
Tiksliai įrašyk šį tekstą:

"Jei būtent šis automobilis atitinka tai, ko ieškote – toliau viskuo pasirūpinsime mes:
• finansavimo pasiūlymai (lizingas / veiklos nuoma),
• papildomos garantijos iki 3 metų,
• draudimas bei visa lydinti dokumentacija."

6. INDIVIDUALIOS PAIEŠKOS BLOKAS (visada identiškas):
Tiksliai įrašyk:

"Jeigu skelbime matomas automobilis nėra būtent toks, kokio ieškote, galime pasiūlyti individualią paiešką.
Per kelias savaites surasime ir parvešime automobilį iš bet kurios Europos šalies pagal Jūsų kriterijus ir pageidaujamą išpildymą.

Dėl individualios paieškos: info@autokopers.lt
+37062851439

Į paslaugą įeina:
• automobilio paieška Europoje,
• pardavėjo ir automobilio patikra,
• transportavimas į Lietuvą,
• dokumentų tvarkymas,
• automobilio paruošimas registracijai bei techninei apžiūrai,
• pilnas sutvarkymas iki atidavimo.

Dirbame tik su patikimais partneriais Europoje, turime finansavimo sprendimus ir galime pasiūlyti garantiją iki 3 metų.

Jūsų turimą automobilį galime atpirkti ir užskaityti kaip pradinį įnašą."

7. UŽBAIGIMAS (visada identiškas):
Tiksliai įrašyk:

"Mūsų darbas – sutaupyti laiką, sumažinti riziką ir užtikrinti sklandų procesą nuo pirmo pokalbio iki automobilio atidavimo.

autokopers – skaidrus ir atsakingas procesas renkantis automobilį.

Kilus papildomiems klausimams rašykite ar skambinkite:
info@autokopers.lt
+37062851439
www.autokopers.lt"

=== STILIAUS TAISYKLĖS ===
- Tonalumas: profesionalus, dalykiškas, bet šiltas ir draugiškas
- Gali būti viena šmaikšti pastaba (pvz., apie komfortą ar patirtį)
- NENAUDOK per daug šauktukų
- Rašyk TIKTAI lietuviškai
- Skyriai 1-4 turi būti UNIKALŪS ir pritaikyti konkrečiam automobiliui
- Skyriai 5-7 turi būti IDENTIŠKAI nukopijuoti kaip pateikta aukščiau
- Jei yra defektų – paminėk sąžiningai bet diplomatiškai automobilio pristatymo dalyje
- Nerašyk kainos`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'Tu esi profesionalus automobilių skelbimų copywriter Lietuvoje. Rašai tik lietuviškai, laikaisi pateiktos struktūros.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Per daug užklausų, bandykite vėliau' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI kreditai išnaudoti, susisiekite su administratoriumi' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || '';

    if (!description) {
      throw new Error('AI nepateikė aprašymo');
    }

    return new Response(
      JSON.stringify({ success: true, description: description.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Description generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Nežinoma klaida' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
