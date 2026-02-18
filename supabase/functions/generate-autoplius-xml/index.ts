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
  first_reg_date?: string;
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

interface RequestPayload {
  action?: "download" | "push" | string;
  include_car_id?: string;
  include_not_visible?: boolean;
  expect_car_in_feed?: boolean;
}

interface AutopliusPushResult {
  status: number;
  mode: "raw_xml" | "form_urlencoded";
  responseText: string;
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
    const payload = await getRequestPayload(req);
    const action = payload.action === "push" ? "push" : "download";

    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing or invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create authenticated client to verify user
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      console.log("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has partner or admin role
    const { data: roles, error: roleError } = await authClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (roleError) {
      console.log("Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Forbidden: Could not verify permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hasAccess = roles?.some((r) => r.role === "partner" || r.role === "admin");
    if (!hasAccess) {
      console.log("User lacks required role");
      return new Response(
        JSON.stringify({ error: "Forbidden: Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated user ${user.id} generating XML feed`);

    // Use service role for data fetch (to get all visible_autoplius cars)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching cars from database...");

    const includeCarId = normalizeUuid(payload.include_car_id);
    const includeNotVisible = payload.include_not_visible === true;
    const expectCarInFeed = payload.expect_car_in_feed === true;

    let carsResponse;
    if (includeCarId && includeNotVisible) {
      carsResponse = await supabase
        .from("cars")
        .select("*")
        .or(`visible_autoplius.eq.true,id.eq.${includeCarId}`)
        .order("created_at", { ascending: false });
    } else {
      carsResponse = await supabase
        .from("cars")
        .select("*")
        .eq("visible_autoplius", true)
        .order("created_at", { ascending: false });
    }

    const { data: cars, error } = carsResponse;

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    let carsToExport: Car[] = (cars || []) as Car[];

    // Deterministic include for requested car in debug/expected-feed paths.
    let requestedCar: Car | null = null;
    const shouldLoadRequestedCar =
      includeCarId !== null && (includeNotVisible || expectCarInFeed);

    if (shouldLoadRequestedCar && includeCarId) {
      const { data: fallbackCar, error: fallbackError } = await supabase
        .from("cars")
        .select("*")
        .eq("id", includeCarId)
        .maybeSingle();

      if (fallbackError) {
        console.error("Requested car fetch error:", fallbackError);
      } else if (fallbackCar) {
        requestedCar = fallbackCar as Car;
      }
    }

    if (requestedCar && !carsToExport.some((car) => car.id === requestedCar?.id)) {
      carsToExport = [requestedCar, ...carsToExport];
    }

    if (expectCarInFeed && includeCarId && !carsToExport.some((car) => car.id === includeCarId)) {
      throw new Error(`Requested car ${includeCarId} was not found for export`);
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

    console.log(`Found ${carsToExport.length} cars for Autoplius export`);

    // Generate XML in Autoplius Automobiliai format (used + new vehicles)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<autoplius xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">\n';
    xml += '  <announcements>\n';

    if (carsToExport.length > 0) {
      for (const car of carsToExport) {
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
        const isNew = isNewCar(car.condition) ? "1" : "0";
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
        const makeDate = formatYearMonth(car.first_reg_date, car.year);
        xml += `      <make_date>${makeDate}</make_date>\n`;

        // Required by Autoplius when is_condition_new=0
        if (isNew === "0") {
          const firstRegDate = formatYearMonth(car.first_reg_date, car.year);
          xml += `      <first_reg_date>${firstRegDate}</first_reg_date>\n`;
        }
        
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

    if (action === "push") {
      const pushResult = await pushXmlToAutoplius(xml);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Autoplius feed buvo išsiųstas HTTP POST būdu",
          upstream_status: pushResult.status,
          transport_mode: pushResult.mode,
          upstream_response_preview: pushResult.responseText.slice(0, 300),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"autoplius-feed.xml\"",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating XML:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function getRequestPayload(req: Request): Promise<RequestPayload> {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return {};
  }

  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return {};
  }

  try {
    const raw = await req.text();
    if (!raw.trim()) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as RequestPayload;
  } catch {
    return {};
  }
}

async function pushXmlToAutoplius(xml: string): Promise<AutopliusPushResult> {
  const endpoint = Deno.env.get("AUTOPLIUS_IMPORT_POST_URL");
  if (!endpoint) {
    throw new Error("Missing AUTOPLIUS_IMPORT_POST_URL secret");
  }

  const payloadMode = (Deno.env.get("AUTOPLIUS_IMPORT_PAYLOAD_MODE") || "raw_xml").toLowerCase();
  const authMode = (Deno.env.get("AUTOPLIUS_IMPORT_AUTH_MODE") || "basic").toLowerCase();
  const username = Deno.env.get("AUTOPLIUS_IMPORT_USERNAME") || "";
  const password = Deno.env.get("AUTOPLIUS_IMPORT_PASSWORD") || "";
  const xmlFieldName = Deno.env.get("AUTOPLIUS_IMPORT_XML_FIELD") || "xml";
  const usernameFieldName = Deno.env.get("AUTOPLIUS_IMPORT_USERNAME_FIELD") || "username";
  const passwordFieldName = Deno.env.get("AUTOPLIUS_IMPORT_PASSWORD_FIELD") || "password";
  const extraHeaders = getExtraHeaders();

  const modes: Array<"raw_xml" | "form_urlencoded"> =
    payloadMode === "auto"
      ? ["raw_xml", "form_urlencoded"]
      : payloadMode === "form_urlencoded"
      ? ["form_urlencoded"]
      : ["raw_xml"];

  let lastError: Error | null = null;

  for (const mode of modes) {
    try {
      const headers = new Headers(extraHeaders);
      headers.set("Accept", "application/json,text/plain,text/html,application/xml,*/*");

      let body = "";

      if (mode === "form_urlencoded") {
        const params = new URLSearchParams();
        params.set(xmlFieldName, xml);

        if (authMode === "form") {
          if (username) params.set(usernameFieldName, username);
          if (password) params.set(passwordFieldName, password);
        }

        body = params.toString();
        headers.set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
      } else {
        body = xml;
        headers.set("Content-Type", "application/xml; charset=utf-8");
      }

      if (authMode === "basic") {
        if (!username || !password) {
          throw new Error(
            "AUTOPLIUS_IMPORT_AUTH_MODE=basic requires AUTOPLIUS_IMPORT_USERNAME and AUTOPLIUS_IMPORT_PASSWORD"
          );
        }
        headers.set("Authorization", `Basic ${btoa(`${username}:${password}`)}`);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Autoplius POST ${response.status}: ${responseText.slice(0, 500)}`);
      }

      return {
        status: response.status,
        mode,
        responseText,
      };
    } catch (error: unknown) {
      lastError =
        error instanceof Error ? error : new Error("Autoplius feed POST failed with unknown error");
      console.error(`Autoplius push attempt (${mode}) failed:`, lastError.message);
    }
  }

  throw lastError || new Error("Autoplius feed POST failed");
}

function getExtraHeaders(): Record<string, string> {
  const raw = Deno.env.get("AUTOPLIUS_IMPORT_HEADERS_JSON");
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("AUTOPLIUS_IMPORT_HEADERS_JSON must be a JSON object");
    }

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        headers[key] = value;
      }
    }
    return headers;
  } catch (error) {
    console.error("Failed to parse AUTOPLIUS_IMPORT_HEADERS_JSON", error);
    return {};
  }
}

function normalizeUuid(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(trimmed) ? trimmed : null;
}

function isNewCar(condition?: string | null): boolean {
  return condition?.trim().toLowerCase() === "naujas";
}

function formatYearMonth(dateValue?: string | null, fallbackYear?: number): string {
  if (dateValue) {
    const isoPrefixMatch = dateValue.match(/^(\d{4})-(\d{2})/);
    if (isoPrefixMatch) {
      return `${isoPrefixMatch[1]}-${isoPrefixMatch[2]}`;
    }

    const parsed = new Date(dateValue);
    if (!Number.isNaN(parsed.getTime())) {
      const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
      return `${parsed.getUTCFullYear()}-${month}`;
    }
  }

  const safeYear =
    typeof fallbackYear === "number" && Number.isFinite(fallbackYear)
      ? Math.max(1900, Math.trunc(fallbackYear))
      : new Date().getUTCFullYear();

  return `${safeYear}-01`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

serve(handler);
