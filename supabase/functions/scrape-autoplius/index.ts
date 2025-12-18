import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CarData {
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  engine_capacity?: number;
  power_kw?: number;
  doors?: number;
  color?: string;
  steering_wheel?: string;
  condition?: string;
  vin?: string;
  description?: string;
  images?: string[];
}

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // Max requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - userLimit.count };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client to verify user and check role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has partner or admin role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Role check error:', rolesError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify user permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userRoles = roles?.map(r => r.role) || [];
    const hasAccess = userRoles.includes('partner') || userRoles.includes('admin');

    if (!hasAccess) {
      console.log(`User ${user.id} denied access - no partner/admin role`);
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied. Partner or admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '3600'
        } }
      );
    }

    console.log(`Scrape request from user ${user.id} (roles: ${userRoles.join(', ')}), remaining requests: ${rateLimit.remaining}`);

    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format and domain using proper URL parsing (prevents SSRF)
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strict domain validation - only allow autoplius.lt domains
    const allowedDomains = ['autoplius.lt', 'www.autoplius.lt', 'en.autoplius.lt'];
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Only Autoplius URLs are supported' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure HTTPS protocol
    if (parsedUrl.protocol !== 'https:') {
      return new Response(
        JSON.stringify({ success: false, error: 'Only HTTPS URLs are supported' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping Autoplius URL with Firecrawl:', url);

    // Use Firecrawl to scrape the page
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['html', 'markdown'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.json();
      console.error('Firecrawl API error:', errorData);
      throw new Error(errorData.error || `Firecrawl request failed with status ${firecrawlResponse.status}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    const html = firecrawlData.data?.html || firecrawlData.html || '';
    const markdown = firecrawlData.data?.markdown || firecrawlData.markdown || '';
    
    console.log('Page fetched via Firecrawl, parsing...');

    const carData: CarData = {};

    // Extract title (make + model)
    const titleMatch = html.match(/<h1[^>]*class="[^"]*announcement-title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const parts = title.split(' ');
      if (parts.length >= 2) {
        carData.make = parts[0];
        carData.model = parts.slice(1).join(' ');
      }
    }

    // Extract price
    const priceMatch = html.match(/class="[^"]*price[^"]*"[^>]*>[\s\S]*?(\d[\d\s]*)\s*€/i) ||
                       html.match(/(\d[\d\s]+)\s*€/);
    if (priceMatch) {
      carData.price = parseInt(priceMatch[1].replace(/\s/g, ''));
    }

    // Helper function to extract parameter value
    const extractParam = (labelPattern: string): string | null => {
      const regex = new RegExp(`<dt[^>]*>[^<]*${labelPattern}[^<]*<\\/dt>\\s*<dd[^>]*>([^<]+)<\\/dd>`, 'i');
      const match = html.match(regex);
      return match ? match[1].trim() : null;
    };

    // Extract year
    const yearValue = extractParam('Pagaminimo data|Metai|Date of manufacture');
    if (yearValue) {
      const yearMatch = yearValue.match(/(\d{4})/);
      if (yearMatch) carData.year = parseInt(yearMatch[1]);
    }

    // Extract mileage
    const mileageValue = extractParam('Rida|Mileage');
    if (mileageValue) {
      const mileageMatch = mileageValue.match(/(\d[\d\s]*)/);
      if (mileageMatch) carData.mileage = parseInt(mileageMatch[1].replace(/\s/g, ''));
    }

    // Extract fuel type
    const fuelValue = extractParam('Kuro tipas|Fuel type');
    if (fuelValue) {
      const fuelMap: Record<string, string> = {
        'benzinas': 'Benzinas',
        'dyzelinas': 'Dyzelinas',
        'diesel': 'Dyzelinas',
        'petrol': 'Benzinas',
        'elektra': 'Elektra',
        'electric': 'Elektra',
        'hibridinis': 'Hibridinis',
        'hybrid': 'Hibridinis',
        'dujos': 'Dujos',
        'lpg': 'Dujos',
      };
      const fuelLower = fuelValue.toLowerCase();
      for (const [key, value] of Object.entries(fuelMap)) {
        if (fuelLower.includes(key)) {
          carData.fuel_type = value;
          break;
        }
      }
    }

    // Extract transmission
    const transmissionValue = extractParam('Pavarų dėžė|Transmission');
    if (transmissionValue) {
      if (transmissionValue.toLowerCase().includes('automat')) {
        carData.transmission = 'Automatinė';
      } else if (transmissionValue.toLowerCase().includes('mechan')) {
        carData.transmission = 'Mechaninė';
      }
    }

    // Extract body type
    const bodyValue = extractParam('Kėbulo tipas|Body type');
    if (bodyValue) {
      const bodyMap: Record<string, string> = {
        'sedanas': 'Sedanas',
        'sedan': 'Sedanas',
        'hečbekas': 'Hečbekas',
        'hatchback': 'Hečbekas',
        'universalas': 'Universalas',
        'wagon': 'Universalas',
        'estate': 'Universalas',
        'visureigis': 'Visureigis',
        'suv': 'Visureigis',
        'kupė': 'Kupė',
        'coupe': 'Kupė',
        'kabrioletas': 'Kabrioletas',
        'convertible': 'Kabrioletas',
        'vienatūris': 'Vienatūris',
        'minivan': 'Vienatūris',
        'pikapas': 'Pikapas',
        'pickup': 'Pikapas',
      };
      const bodyLower = bodyValue.toLowerCase();
      for (const [key, value] of Object.entries(bodyMap)) {
        if (bodyLower.includes(key)) {
          carData.body_type = value;
          break;
        }
      }
    }

    // Extract engine capacity
    const engineValue = extractParam('Variklio tūris|Engine capacity');
    if (engineValue) {
      const engineMatch = engineValue.match(/([\d.,]+)/);
      if (engineMatch) {
        let capacity = parseFloat(engineMatch[1].replace(',', '.'));
        // Convert liters to cm³ if needed
        if (capacity < 100) capacity = capacity * 1000;
        carData.engine_capacity = Math.round(capacity);
      }
    }

    // Extract power
    const powerValue = extractParam('Galia|Power');
    if (powerValue) {
      // Try to get kW first
      const kwMatch = powerValue.match(/(\d+)\s*kW/i);
      if (kwMatch) {
        carData.power_kw = parseInt(kwMatch[1]);
      } else {
        // Convert from HP if only HP is available
        const hpMatch = powerValue.match(/(\d+)\s*(AG|HP|PS|arklio)/i);
        if (hpMatch) {
          carData.power_kw = Math.round(parseInt(hpMatch[1]) * 0.7355);
        }
      }
    }

    // Extract color
    const colorValue = extractParam('Spalva|Color');
    if (colorValue) {
      const colorMap: Record<string, string> = {
        'balta': 'Balta', 'white': 'Balta',
        'juoda': 'Juoda', 'black': 'Juoda',
        'pilka': 'Pilka', 'grey': 'Pilka', 'gray': 'Pilka',
        'sidabrinė': 'Sidabrinė', 'silver': 'Sidabrinė',
        'mėlyna': 'Mėlyna', 'blue': 'Mėlyna',
        'raudona': 'Raudona', 'red': 'Raudona',
        'žalia': 'Žalia', 'green': 'Žalia',
        'geltona': 'Geltona', 'yellow': 'Geltona',
        'oranžinė': 'Oranžinė', 'orange': 'Oranžinė',
        'ruda': 'Ruda', 'brown': 'Ruda',
      };
      const colorLower = colorValue.toLowerCase();
      for (const [key, value] of Object.entries(colorMap)) {
        if (colorLower.includes(key)) {
          carData.color = value;
          break;
        }
      }
    }

    // Extract steering wheel position
    const steeringValue = extractParam('Vairo padėtis|Steering wheel');
    if (steeringValue) {
      if (steeringValue.toLowerCase().includes('kair') || steeringValue.toLowerCase().includes('left')) {
        carData.steering_wheel = 'Kairė';
      } else if (steeringValue.toLowerCase().includes('dešin') || steeringValue.toLowerCase().includes('right')) {
        carData.steering_wheel = 'Dešinė';
      }
    }

    // Extract doors
    const doorsValue = extractParam('Durų skaičius|Number of doors');
    if (doorsValue) {
      const doorsMatch = doorsValue.match(/(\d)/);
      if (doorsMatch) carData.doors = parseInt(doorsMatch[1]);
    }

    // Extract VIN
    const vinMatch = html.match(/VIN[^>]*>[\s\S]*?([A-HJ-NPR-Z0-9]{17})/i);
    if (vinMatch) carData.vin = vinMatch[1];

    // Extract description
    const descMatch = html.match(/<div[^>]*class="[^"]*announcement-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
      carData.description = descMatch[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
    }

    // Extract images
    const images: string[] = [];
    
    // Try data-src attributes first
    const imgRegex = /data-src="([^"]*autoplius[^"]*\.jpg[^"]*)"/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const imgUrl = imgMatch[1].replace(/\/s\d+x\d+\//, '/original/');
      if (!images.includes(imgUrl)) {
        images.push(imgUrl);
      }
    }
    
    // Also try regular src attributes
    const imgRegex2 = /src="([^"]*autoplius[^"]*\.jpg[^"]*)"/gi;
    while ((imgMatch = imgRegex2.exec(html)) !== null) {
      const imgUrl = imgMatch[1].replace(/\/s\d+x\d+\//, '/original/');
      if (!images.includes(imgUrl) && !imgUrl.includes('logo') && !imgUrl.includes('icon')) {
        images.push(imgUrl);
      }
    }

    // Try to extract from img.photo-item patterns
    const photoItemRegex = /img[^>]*class="[^"]*photo-item[^"]*"[^>]*src="([^"]+)"/gi;
    while ((imgMatch = photoItemRegex.exec(html)) !== null) {
      const imgUrl = imgMatch[1].replace(/\/s\d+x\d+\//, '/original/');
      if (!images.includes(imgUrl)) {
        images.push(imgUrl);
      }
    }

    // Extract from gallery/slider patterns
    const galleryRegex = /data-large-src="([^"]+)"/gi;
    while ((imgMatch = galleryRegex.exec(html)) !== null) {
      if (!images.includes(imgMatch[1])) {
        images.push(imgMatch[1]);
      }
    }

    if (images.length > 0) {
      carData.images = images.slice(0, 20); // Limit to 20 images
    }

    console.log('Parsed car data:', carData);

    return new Response(
      JSON.stringify({ success: true, data: carData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error scraping Autoplius:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape listing';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
