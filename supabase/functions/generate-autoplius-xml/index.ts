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

// Autoplius make ID mapping (most common makes)
const makeIdMapping: { [key: string]: string } = {
  "Audi": "4",
  "BMW": "9",
  "Citroen": "18",
  "Dacia": "20",
  "Fiat": "26",
  "Ford": "28",
  "Honda": "35",
  "Hyundai": "37",
  "Jaguar": "39",
  "Jeep": "40",
  "Kia": "43",
  "Land Rover": "48",
  "Lexus": "49",
  "Mazda": "53",
  "Mercedes-Benz": "55",
  "Mini": "58",
  "Mitsubishi": "59",
  "Nissan": "63",
  "Opel": "65",
  "Peugeot": "68",
  "Porsche": "70",
  "Renault": "75",
  "Seat": "81",
  "Skoda": "84",
  "Subaru": "86",
  "Suzuki": "87",
  "Tesla": "89",
  "Toyota": "91",
  "Volkswagen": "99",
  "Volvo": "100",
};

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
  "Benzinas / elektra": "76",
  "Dyzelis / elektra": "77",
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

// Autoplius has_damaged_id mapping (defects)
// 254 = Be defektų, 255 = Su defektais
const hasDamagedMapping: { [key: string]: string } = {
  "Be defektų": "254",
  "Su defektais": "255",
  "Naudotas": "254",
  "Naujas": "254",
  "Daužtas": "255",
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

    // Generate XML in Autoplius format for used cars (category_id=2)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<autoplius xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">\n';
    xml += '  <announcements>\n';

    if (cars && cars.length > 0) {
      for (const car of cars as Car[]) {
        xml += '    <cars>\n';
        
        // Required: external_id
        xml += `      <external_id>${car.id}</external_id>\n`;
        
        // Required: make_id (Autoplius numeric ID)
        const makeId = makeIdMapping[car.make] || car.make;
        xml += `      <make_id>${escapeXml(makeId)}</make_id>\n`;
        
        // Required: model_id - using model name as we don't have full model mapping
        // Autoplius will try to match it
        xml += `      <model_id>${escapeXml(car.model)}</model_id>\n`;
        
        // Required: sell_price
        xml += `      <sell_price>${car.price}</sell_price>\n`;
        
        // Required: is_condition_new (0 = used, 1 = new)
        xml += `      <is_condition_new>0</is_condition_new>\n`;
        
        // Required: contacts_phone
        xml += `      <contacts_phone>+37062851439</contacts_phone>\n`;
        
        // Required: contacts_name
        xml += `      <contacts_name>AutoKOPERS</contacts_name>\n`;
        
        // Required: contacts_email
        xml += `      <contacts_email>labas@autokopers.lt</contacts_email>\n`;
        
        // Required: fk_place_countries_id (117 = Lithuania)
        xml += `      <fk_place_countries_id>117</fk_place_countries_id>\n`;
        
        // Required: fk_place_cities_id (1 = Vilnius)
        xml += `      <fk_place_cities_id>1</fk_place_cities_id>\n`;
        
        // Required: make_date (format YYYY-MM)
        xml += `      <make_date>${car.year}-01</make_date>\n`;
        
        // Required: body_type_id
        if (car.body_type && bodyTypeMapping[car.body_type]) {
          xml += `      <body_type_id>${bodyTypeMapping[car.body_type]}</body_type_id>\n`;
        } else {
          // Default to Sedanas if not specified
          xml += `      <body_type_id>1</body_type_id>\n`;
        }
        
        // Required: fuel_id
        if (car.fuel_type && fuelTypeMapping[car.fuel_type]) {
          xml += `      <fuel_id>${fuelTypeMapping[car.fuel_type]}</fuel_id>\n`;
        } else {
          // Default to Benzinas
          xml += `      <fuel_id>34</fuel_id>\n`;
        }
        
        // Required: number_of_doors_id
        if (car.doors && doorsMapping[car.doors]) {
          xml += `      <number_of_doors_id>${doorsMapping[car.doors]}</number_of_doors_id>\n`;
        } else {
          // Default to 4 doors
          xml += `      <number_of_doors_id>128</number_of_doors_id>\n`;
        }
        
        // Required: color_id
        if (car.color && colorMapping[car.color]) {
          xml += `      <color_id>${colorMapping[car.color]}</color_id>\n`;
        } else {
          // Default to Pilka (gray)
          xml += `      <color_id>27</color_id>\n`;
        }
        
        // Required: gearbox_id
        if (car.transmission && transmissionMapping[car.transmission]) {
          xml += `      <gearbox_id>${transmissionMapping[car.transmission]}</gearbox_id>\n`;
        } else {
          // Default to Mechaninė
          xml += `      <gearbox_id>38</gearbox_id>\n`;
        }
        
        // Required: has_damaged_id (254 = no defects, 255 = with defects)
        if (car.defects && car.defects.trim().length > 0) {
          xml += `      <has_damaged_id>255</has_damaged_id>\n`;
        } else if (car.condition && hasDamagedMapping[car.condition]) {
          xml += `      <has_damaged_id>${hasDamagedMapping[car.condition]}</has_damaged_id>\n`;
        } else {
          xml += `      <has_damaged_id>254</has_damaged_id>\n`;
        }
        
        // Required: steering_wheel_id
        if (car.steering_wheel && steeringWheelMapping[car.steering_wheel]) {
          xml += `      <steering_wheel_id>${steeringWheelMapping[car.steering_wheel]}</steering_wheel_id>\n`;
        } else {
          // Default to Kairė (left)
          xml += `      <steering_wheel_id>10922</steering_wheel_id>\n`;
        }
        
        // Optional: comments (description)
        if (car.description) {
          xml += `      <comments><![CDATA[${car.description}]]></comments>\n`;
        }
        
        // Optional: engine_capacity
        if (car.engine_capacity) {
          xml += `      <engine_capacity>${car.engine_capacity}</engine_capacity>\n`;
        }
        
        // Optional: kilometrage (mileage)
        if (car.mileage) {
          xml += `      <kilometrage>${car.mileage}</kilometrage>\n`;
        }
        
        // Optional: power (kW)
        if (car.power_kw) {
          xml += `      <power>${car.power_kw}</power>\n`;
        }
        
        // Optional: number_of_seats_id
        if (car.seats) {
          xml += `      <number_of_seats_id>${car.seats}</number_of_seats_id>\n`;
        }
        
        // Optional: vin
        if (car.vin) {
          xml += `      <vin>${escapeXml(car.vin)}</vin>\n`;
        }

        // Photos
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
