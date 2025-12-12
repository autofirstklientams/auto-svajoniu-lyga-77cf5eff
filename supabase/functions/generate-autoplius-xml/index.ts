import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  description?: string;
  image_url?: string;
  body_type?: string;
  engine_capacity?: number;
  power_kw?: number;
  doors?: number;
  seats?: number;
  color?: string;
  steering_wheel?: string;
  condition?: string;
  vin?: string;
  defects?: string;
}

interface CarImage {
  image_url: string;
  display_order: number;
}

// Autoplius fuel type mapping
const fuelTypeMapping: { [key: string]: string } = {
  "Benzinas": "34",
  "Dyzelis": "35",
  "Dyzelinas": "35",
  "Elektra": "36",
  "Hibridas": "37",
  "Hibridinis": "37",
  "Dujos": "38",
  "Benzinas/Dujos": "39",
};

// Autoplius transmission mapping
const transmissionMapping: { [key: string]: string } = {
  "Mechaninė": "38",
  "Automatinė": "39",
};

// Autoplius body type mapping
const bodyTypeMapping: { [key: string]: string } = {
  "Sedanas": "1",
  "Hečbekas": "2",
  "Universalas": "3",
  "Visureigis": "4",
  "Kupė": "5",
  "Kabrioletas": "6",
  "Vienatūris": "7",
  "Pikapas": "8",
  "Komercinis": "9",
};

// Autoplius color mapping
const colorMapping: { [key: string]: string } = {
  "Balta": "25",
  "Juoda": "26",
  "Pilka": "27",
  "Sidabrinė": "28",
  "Mėlyna": "29",
  "Raudona": "30",
  "Žalia": "31",
  "Geltona": "32",
  "Oranžinė": "33",
  "Ruda": "34",
  "Violetinė": "35",
};

// Autoplius doors mapping
const doorsMapping: { [key: number]: string } = {
  2: "126",
  3: "127",
  4: "128",
  5: "129",
};

// Autoplius steering wheel mapping  
const steeringWheelMapping: { [key: string]: string } = {
  "Kairė": "10922",
  "Dešinė": "10923",
};

// Autoplius condition mapping
const conditionMapping: { [key: string]: string } = {
  "Naudotas": "10924",
  "Naujas": "10925",
  "Daužtas": "10926",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching cars from database...");
    
    const { data: cars, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Fetch all car images
    const { data: allImages, error: imagesError } = await supabase
      .from("car_images")
      .select("car_id, image_url, display_order")
      .order("display_order", { ascending: true });

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
    }

    // Group images by car_id
    const imagesByCarId: { [key: string]: CarImage[] } = {};
    if (allImages) {
      for (const img of allImages) {
        if (!imagesByCarId[img.car_id]) {
          imagesByCarId[img.car_id] = [];
        }
        imagesByCarId[img.car_id].push(img);
      }
    }

    console.log(`Found ${cars?.length || 0} cars`);

    // Generate XML in Autoplius format
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<autoplius xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">\n';
    xml += '  <announcements>\n';

    if (cars && cars.length > 0) {
      for (const car of cars as Car[]) {
        xml += '    <cars>\n';
        xml += `      <external_id>${car.id}</external_id>\n`;
        xml += `      <make_id>${escapeXml(car.make)}</make_id>\n`;
        xml += `      <model_id>${escapeXml(car.model)}</model_id>\n`;
        xml += `      <sell_price>${car.price}</sell_price>\n`;
        
        if (car.description) {
          xml += `      <comments><![CDATA[${car.description}]]></comments>\n`;
        }
        
        if (car.engine_capacity) {
          xml += `      <engine_capacity>${car.engine_capacity}</engine_capacity>\n`;
        }
        
        if (car.body_type && bodyTypeMapping[car.body_type]) {
          xml += `      <body_type_id>${bodyTypeMapping[car.body_type]}</body_type_id>\n`;
        }
        
        if (car.mileage) {
          xml += `      <kilometrage>${car.mileage}</kilometrage>\n`;
        }
        
        if (car.power_kw) {
          xml += `      <power>${car.power_kw}</power>\n`;
        }
        
        if (car.fuel_type && fuelTypeMapping[car.fuel_type]) {
          xml += `      <fuel_id>${fuelTypeMapping[car.fuel_type]}</fuel_id>\n`;
        }
        
        if (car.doors && doorsMapping[car.doors]) {
          xml += `      <number_of_doors_id>${doorsMapping[car.doors]}</number_of_doors_id>\n`;
        }
        
        if (car.color && colorMapping[car.color]) {
          xml += `      <color_id>${colorMapping[car.color]}</color_id>\n`;
        }
        
        if (car.transmission && transmissionMapping[car.transmission]) {
          xml += `      <gearbox_id>${transmissionMapping[car.transmission]}</gearbox_id>\n`;
        }
        
        // Format year as YYYY-MM
        xml += `      <make_date>${car.year}-01</make_date>\n`;
        
        if (car.condition && conditionMapping[car.condition]) {
          xml += `      <has_damaged_id>${conditionMapping[car.condition]}</has_damaged_id>\n`;
        }
        
        if (car.steering_wheel && steeringWheelMapping[car.steering_wheel]) {
          xml += `      <steering_wheel_id>${steeringWheelMapping[car.steering_wheel]}</steering_wheel_id>\n`;
        }

        if (car.seats) {
          xml += `      <number_of_seats_id>${car.seats}</number_of_seats_id>\n`;
        }

        if (car.vin) {
          xml += `      <vin>${escapeXml(car.vin)}</vin>\n`;
        }

        // Add photos
        const carImages = imagesByCarId[car.id] || [];
        if (carImages.length > 0 || car.image_url) {
          xml += '      <photos>\n';
          
          // Add main image first if not in car_images
          if (car.image_url && !carImages.some(img => img.image_url === car.image_url)) {
            xml += `        <photo>${escapeXml(car.image_url)}</photo>\n`;
          }
          
          for (const img of carImages) {
            xml += `        <photo>${escapeXml(img.image_url)}</photo>\n`;
          }
          
          xml += '      </photos>\n';
        }
        
        xml += '    </cars>\n';
      }
    }

    xml += '  </announcements>\n';
    xml += '</autoplius>';

    console.log("XML generated successfully");

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"autoplius-feed.xml\"",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error generating XML:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

serve(handler);
