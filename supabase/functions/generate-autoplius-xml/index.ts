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
  euro_standard?: string;
  fuel_cons_urban?: number;
  fuel_cons_highway?: number;
  fuel_cons_combined?: number;
  origin_country?: string;
  wheel_drive?: string;
  co2_emission?: number;
  city?: string;
}

interface CarImage {
  image_url: string;
  display_order: number;
}

// Comprehensive Autoplius make ID mapping
const makeIdMapping: { [key: string]: string } = {
  "Abarth": "1",
  "Acura": "2",
  "Alfa Romeo": "3",
  "Audi": "4",
  "BMW": "9",
  "Bentley": "7",
  "Buick": "10",
  "Cadillac": "11",
  "Chevrolet": "13",
  "Chrysler": "14",
  "Citroen": "18",
  "Cupra": "19",
  "Dacia": "20",
  "Daewoo": "21",
  "Daihatsu": "22",
  "Dodge": "24",
  "Ferrari": "25",
  "Fiat": "26",
  "Ford": "28",
  "GMC": "29",
  "Honda": "35",
  "Hummer": "36",
  "Hyundai": "37",
  "Infiniti": "38",
  "Isuzu": "39",
  "Jaguar": "40",
  "Jeep": "41",
  "Kia": "43",
  "Lada": "44",
  "Lamborghini": "45",
  "Lancia": "46",
  "Land Rover": "48",
  "Lexus": "49",
  "Lincoln": "50",
  "Lotus": "51",
  "Maserati": "52",
  "Mazda": "53",
  "McLaren": "54",
  "Mercedes-Benz": "55",
  "Mini": "58",
  "Mitsubishi": "59",
  "Nissan": "63",
  "Opel": "65",
  "Peugeot": "68",
  "Pontiac": "69",
  "Porsche": "70",
  "Renault": "75",
  "Rolls-Royce": "76",
  "Rover": "77",
  "Saab": "79",
  "Seat": "81",
  "Skoda": "84",
  "Smart": "85",
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
  "Vandenilis": "78",
};

// Autoplius transmission mapping
const transmissionMapping: { [key: string]: string } = {
  "Mechaninė": "38",
  "Automatinė": "39",
  "Robotizuota": "40",
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
  "Mikroautobusas": "10",
  "Limuzinas": "11",
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
  "Smėlio": "36",
  "Auksinė": "37",
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

// Autoplius has_damaged_id mapping
const hasDamagedMapping: { [key: string]: string } = {
  "Be defektų": "254",
  "Su defektais": "255",
  "Naudotas": "254",
  "Naujas": "254",
  "Daužtas": "255",
};

// Autoplius euro standard mapping
const euroStandardMapping: { [key: string]: string } = {
  "Euro 1": "1",
  "Euro 2": "2",
  "Euro 3": "3",
  "Euro 4": "4",
  "Euro 5": "5",
  "Euro 6": "6",
  "Euro 6d": "7",
};

// Autoplius wheel drive mapping
const wheelDriveMapping: { [key: string]: string } = {
  "Priekiniai": "66",
  "Galiniai": "67",
  "Visi": "68",
};

// Autoplius city mapping (Lithuanian cities)
const cityMapping: { [key: string]: string } = {
  "Vilnius": "1",
  "Kaunas": "2",
  "Klaipėda": "3",
  "Šiauliai": "4",
  "Panevėžys": "5",
  "Alytus": "6",
  "Marijampolė": "7",
  "Utena": "8",
  "Mažeikiai": "9",
  "Jonava": "10",
  "Tauragė": "11",
  "Telšiai": "12",
  "Visaginas": "13",
  "Ukmergė": "14",
  "Kėdainiai": "15",
  "Plungė": "16",
  "Šilutė": "17",
  "Druskininkai": "18",
  "Palanga": "19",
  "Rokiškis": "20",
};

// Autoplius origin country mapping
const originCountryMapping: { [key: string]: string } = {
  "Lietuva": "117",
  "Vokietija": "276",
  "Lenkija": "616",
  "Prancūzija": "250",
  "Italija": "380",
  "Nyderlandai": "528",
  "Belgija": "56",
  "JAV": "840",
  "Japonija": "392",
  "Korėja": "410",
  "Kinija": "156",
  "Švedija": "752",
  "Ispanija": "724",
  "Austrija": "40",
  "Šveicarija": "756",
  "Čekija": "203",
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
    
    // Only fetch cars that are visible on Autoplius
    const { data: cars, error } = await supabase
      .from("cars")
      .select("*")
      .eq("visible_autoplius", true)
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

    console.log(`Found ${cars?.length || 0} cars for Autoplius export`);

    // Generate XML in Autoplius format for used cars (category_id=2)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<autoplius xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">\n';
    xml += '  <announcements>\n';

    if (cars && cars.length > 0) {
      for (const car of cars as Car[]) {
        xml += '    <cars>\n';
        
        // Required: external_id
        xml += `      <external_id>${car.id}</external_id>\n`;
        
        // Required: make_id
        const makeId = makeIdMapping[car.make] || car.make;
        xml += `      <make_id>${escapeXml(makeId)}</make_id>\n`;
        
        // Required: model_id - using model name (Autoplius may auto-match)
        xml += `      <model_id>${escapeXml(car.model)}</model_id>\n`;
        
        // Required: sell_price
        xml += `      <sell_price>${car.price}</sell_price>\n`;
        
        // Required: is_condition_new (0 = used, 1 = new)
        const isNew = car.condition === "Naujas" ? "1" : "0";
        xml += `      <is_condition_new>${isNew}</is_condition_new>\n`;
        
        // Required: contacts
        xml += `      <contacts_phone>+37062851439</contacts_phone>\n`;
        xml += `      <contacts_name>AutoKOPERS</contacts_name>\n`;
        xml += `      <contacts_email>labas@autokopers.lt</contacts_email>\n`;
        
        // Required: location (117 = Lithuania)
        xml += `      <fk_place_countries_id>117</fk_place_countries_id>\n`;
        
        // City mapping
        const cityId = cityMapping[car.city || "Vilnius"] || "1";
        xml += `      <fk_place_cities_id>${cityId}</fk_place_cities_id>\n`;
        
        // Required: make_date (format YYYY-MM)
        xml += `      <make_date>${car.year}-01</make_date>\n`;
        
        // Required: body_type_id
        if (car.body_type && bodyTypeMapping[car.body_type]) {
          xml += `      <body_type_id>${bodyTypeMapping[car.body_type]}</body_type_id>\n`;
        } else {
          xml += `      <body_type_id>1</body_type_id>\n`;
        }
        
        // Required: fuel_id
        if (car.fuel_type && fuelTypeMapping[car.fuel_type]) {
          xml += `      <fuel_id>${fuelTypeMapping[car.fuel_type]}</fuel_id>\n`;
        } else {
          xml += `      <fuel_id>34</fuel_id>\n`;
        }
        
        // Required: number_of_doors_id
        if (car.doors && doorsMapping[car.doors]) {
          xml += `      <number_of_doors_id>${doorsMapping[car.doors]}</number_of_doors_id>\n`;
        } else {
          xml += `      <number_of_doors_id>128</number_of_doors_id>\n`;
        }
        
        // Required: color_id
        if (car.color && colorMapping[car.color]) {
          xml += `      <color_id>${colorMapping[car.color]}</color_id>\n`;
        } else {
          xml += `      <color_id>27</color_id>\n`;
        }
        
        // Required: gearbox_id
        if (car.transmission && transmissionMapping[car.transmission]) {
          xml += `      <gearbox_id>${transmissionMapping[car.transmission]}</gearbox_id>\n`;
        } else {
          xml += `      <gearbox_id>38</gearbox_id>\n`;
        }
        
        // Required: has_damaged_id
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
          xml += `      <steering_wheel_id>10922</steering_wheel_id>\n`;
        }
        
        // Optional: comments (description)
        if (car.description) {
          xml += `      <comments><![CDATA[${car.description}]]></comments>\n`;
        }
        
        // Optional: engine_capacity (in cm³)
        if (car.engine_capacity) {
          // Convert liters to cm³ if needed
          const engineCc = car.engine_capacity < 100 ? Math.round(car.engine_capacity * 1000) : car.engine_capacity;
          xml += `      <engine_capacity>${engineCc}</engine_capacity>\n`;
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
        
        // Optional: euro_id (Euro standard)
        if (car.euro_standard && euroStandardMapping[car.euro_standard]) {
          xml += `      <euro_id>${euroStandardMapping[car.euro_standard]}</euro_id>\n`;
        }
        
        // Optional: wheel_drive_id
        if (car.wheel_drive && wheelDriveMapping[car.wheel_drive]) {
          xml += `      <wheel_drive_id>${wheelDriveMapping[car.wheel_drive]}</wheel_drive_id>\n`;
        }
        
        // Optional: co2
        if (car.co2_emission) {
          xml += `      <co2>${car.co2_emission}</co2>\n`;
        }
        
        // Optional: fuel consumption
        if (car.fuel_cons_urban) {
          xml += `      <fuel_cons_urban>${car.fuel_cons_urban}</fuel_cons_urban>\n`;
        }
        if (car.fuel_cons_highway) {
          xml += `      <fuel_cons_extra_urban>${car.fuel_cons_highway}</fuel_cons_extra_urban>\n`;
        }
        if (car.fuel_cons_combined) {
          xml += `      <fuel_cons_combined>${car.fuel_cons_combined}</fuel_cons_combined>\n`;
        }
        
        // Optional: origin_country_id
        if (car.origin_country && originCountryMapping[car.origin_country]) {
          xml += `      <origin_country_id>${originCountryMapping[car.origin_country]}</origin_country_id>\n`;
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
