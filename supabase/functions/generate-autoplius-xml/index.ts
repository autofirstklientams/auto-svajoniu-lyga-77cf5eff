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
  mot_date?: string;
  is_reserved?: boolean;
  sdk_code?: string;
  wheel_size?: string;
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

// =============================================================
// All ID mappings below come from the official Autoplius
// datacollector API: https://autoplius.lt/importhandler?datacollector=1&category_id=2
// =============================================================

// Make IDs (from datacollector make_id list)
const makeIdMapping: Record<string, string> = {
  "Abarth": "102",
  "Acura": "103",
  "Alfa Romeo": "104",
  "Audi": "99",
  "BMW": "97",
  "Bentley": "98",
  "Buick": "96",
  "BYD": "32287",
  "Cadillac": "95",
  "Chevrolet": "94",
  "Chrysler": "93",
  "Citroen": "92",
  "Cupra": "28897",
  "Dacia": "110",
  "Daewoo": "91",
  "Daihatsu": "90",
  "Dodge": "89",
  "DS Automobiles": "29763",
  "Ferrari": "87",
  "Fiat": "86",
  "Ford": "85",
  "Genesis": "32616",
  "GMC": "41",
  "Honda": "84",
  "Hummer": "83",
  "Hyundai": "82",
  "Infiniti": "81",
  "Isuzu": "80",
  "Jaguar": "79",
  "Jeep": "78",
  "Kia": "77",
  "Lada": "76",
  "Lamborghini": "75",
  "Lancia": "74",
  "Land Rover": "73",
  "Lexus": "72",
  "Lincoln": "71",
  "Lotus": "70",
  "Maserati": "69",
  "Mazda": "68",
  "McLaren": "24629",
  "Mercedes-Benz": "67",
  "MG": "65",
  "Mini": "64",
  "Mitsubishi": "63",
  "Nissan": "62",
  "Oldsmobile": "61",
  "Opel": "60",
  "Peugeot": "59",
  "Plymouth": "58",
  "Polestar": "31465",
  "Pontiac": "57",
  "Porsche": "56",
  "Renault": "54",
  "Rolls-Royce": "53",
  "Rover": "52",
  "Saab": "51",
  "Seat": "49",
  "Skoda": "48",
  "Smart": "47",
  "SsangYong": "40",
  "Subaru": "46",
  "Suzuki": "45",
  "Tesla": "19524",
  "Toyota": "44",
  "Volkswagen": "43",
  "Volvo": "42",
};

// Fuel type IDs
const fuelTypeMapping: Record<string, string> = {
  "Benzinas": "30",
  "Dyzelis": "32",
  "Dyzelinas": "32",
  "Elektra": "35",
  "Benzinas / elektra": "36",
  "Benzinas/elektra": "36",
  "Hibridas": "36",
  "Hibridinis": "36",
  "Dyzelis / elektra": "17378",
  "Dyzelinas / elektra": "17378",
  "Benzinas / dujos": "31",
  "Benzinas/Dujos": "31",
  "Dujos": "31",
  "Vandenilis": "33985",
  "Bioetanolis (E85)": "18943",
};

// Transmission / gearbox IDs
const transmissionMapping: Record<string, string> = {
  "Automatinė": "38",
  "Mechaninė": "37",
  "Robotizuota": "38", // Autoplius only has Automatinė / Mechaninė
};

// Body type IDs
const bodyTypeMapping: Record<string, string> = {
  "Sedanas": "4",
  "Hečbekas": "2",
  "Universalas": "5",
  "Vienatūris": "6",
  "Visureigis": "7",
  "Kupė": "1",
  "Kabrioletas": "3",
  "Komercinis": "9",
  "Pikapas": "10",
  "Limuzinas": "16098",
  "Keleivinis mikroautobusas": "28055",
  "Krovininis mikroautobusas": "32214",
};

// Color IDs
const colorMapping: Record<string, string> = {
  "Balta": "18938",
  "Juoda": "18930",
  "Pilka": "18933",
  "Sidabrinė": "18933",
  "Mėlyna": "18931",
  "Raudona": "18937",
  "Žalia": "18934",
  "Geltona": "18939",
  "Auksinė": "18939",
  "Oranžinė": "18935",
  "Ruda": "18932",
  "Smėlio": "18932",
  "Violetinė": "18936",
};

// Door count IDs (Autoplius uses grouped values)
const doorsMapping: Record<number, string> = {
  2: "126",  // 2/3
  3: "126",  // 2/3
  4: "127",  // 4/5
  5: "127",  // 4/5
};

// Steering wheel IDs
const steeringWheelMapping: Record<string, string> = {
  "Kairė": "10922",
  "Kairėje": "10922",
  "Dešinė": "10921",
  "Dešinėje": "10921",
};

// Has damaged IDs
const hasDamagedMapping: Record<string, string> = {
  "Be defektų": "10924",
  "Naudotas": "10924",
  "Naujas": "10924",
  "Daužtas": "10925",
  "Su defektais": "10925",
  "Degęs": "18967",
  "Pavarų dėžės defektas": "18969",
  "Variklio defektas": "18968",
  "Skendęs": "18966",
  "Kiti stambūs defektai": "18970",
};

// Euro standard IDs
const euroStandardMapping: Record<string, string> = {
  "Euro 1": "19068",
  "Euro 2": "19069",
  "Euro 3": "19070",
  "Euro 4": "19071",
  "Euro 5": "19072",
  "Euro 6": "19073",
  "Euro 6d": "19073",
};

// Wheel drive IDs
const wheelDriveMapping: Record<string, string> = {
  "Priekiniai": "17363",
  "Galiniai": "17362",
  "Visi": "17364",
};

// Number of seats IDs (dropdown, not raw number)
const seatsMapping: Record<number, string> = {
  2: "17356",
  3: "17357",
  4: "17358",
  5: "17359",
  6: "17360",
  7: "17361",
  8: "27831",
  9: "28613",
};

// Wheel radius IDs
const wheelRadiusMapping: Record<string, string> = {
  "R12": "17365",
  "R13": "17366",
  "R14": "17367",
  "R15": "17368",
  "R16": "17369",
  "R17": "17370",
  "R18": "17371",
  "R19": "17372",
  "R20": "17373",
  "R21": "17374",
  "R22": "17375",
  "R23": "32251",
  "R24": "38617",
};

// City IDs (Lithuanian cities from datacollector)
const cityMapping: Record<string, string> = {
  "Vilnius": "1",
  "Kaunas": "2",
  "Klaipėda": "3",
  "Šiauliai": "4",
  "Panevėžys": "5",
  "Alytus": "6",
  "Marijampolė": "7",
  "Utena": "8",
  "Zarasai": "9",
  "Akmenė": "11",
  "Anykščiai": "14",
  "Birštonas": "16",
  "Biržai": "17",
  "Druskininkai": "19",
  "Elektrėnai": "20",
  "Ignalina": "22",
  "Jonava": "24",
  "Joniškis": "27",
  "Jurbarkas": "28",
  "Kaišiadorys": "31",
  "Kėdainiai": "37",
  "Kelmė": "34",
  "Kretinga": "40",
  "Kupiškis": "43",
  "Lazdijai": "44",
  "Mažeikiai": "47",
  "Molėtai": "49",
  "Palanga": "55",
  "Pasvalys": "58",
  "Plungė": "59",
  "Prienai": "61",
  "Radviliškis": "104",
  "Raseiniai": "64",
  "Rokiškis": "67",
  "Šakiai": "70",
  "Šalčininkai": "73",
  "Šilalė": "76",
  "Šilutė": "78",
  "Širvintos": "80",
  "Skuodas": "68",
  "Švenčionys": "83",
  "Tauragė": "84",
  "Telšiai": "87",
  "Trakai": "89",
  "Ukmergė": "91",
  "Varėna": "95",
  "Vilkaviškis": "98",
  "Visaginas": "100",
  "Gargždai": "108",
  "Kuršėnai": "109",
};

// Origin country IDs (from datacollector origin_country_id)
const originCountryMapping: Record<string, string> = {
  "Lietuva": "1",
  "Latvija": "2",
  "Anglija": "3",
  "Belgija": "4",
  "Estija": "5",
  "Graikija": "6",
  "Ispanija": "7",
  "Italija": "8",
  "JAV": "9",
  "Lenkija": "10",
  "Olandija": "11",
  "Nyderlandai": "11",
  "Prancūzija": "12",
  "Rusija": "13",
  "Vokietija": "14",
  "Baltarusija": "15",
  "Danija": "16",
  "Slovakija": "17",
  "Švedija": "18",
  "Suomija": "19",
  "Liuksemburgas": "20",
  "Airija": "21",
  "Norvegija": "22",
  "Šveicarija": "23",
  "Čekija": "24",
  "Vengrija": "25",
  "Austrija": "26",
  "Kanada": "27",
  "Ukraina": "29",
  "Rumunija": "31",
  "Japonija": "33",
  "Korėja": "33", // fallback to Japonija if no exact match
  "Kinija": "33",  // fallback
  "Islandija": "35",
  "Slovėnija": "36",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await getRequestPayload(req);
    const action = payload.action === "push" ? "push" : "download";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // For POST/push actions, require authentication
    if (action === "push") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Missing or invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: authError } = await authClient.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: roles } = await authClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAccess = roles?.some((r) => r.role === "partner" || r.role === "admin");
      if (!hasAccess) {
        return new Response(
          JSON.stringify({ error: "Forbidden: Insufficient permissions" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Authenticated user ${user.id} pushing XML feed`);
    }

    // GET requests are public (for Autoplius to fetch)
    console.log(`Generating XML feed (action: ${action})`);
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

    const imagesByCarId: Record<string, CarImage[]> = {};
    if (allImages) {
      for (const img of allImages) {
        if (!imagesByCarId[img.car_id]) {
          imagesByCarId[img.car_id] = [];
        }
        imagesByCarId[img.car_id].push(img);
      }
    }

    console.log(`Found ${carsToExport.length} cars for Autoplius export`);

    // Fetch model IDs from Autoplius datacollector API
    const uniqueMakeIds = new Set<string>();
    for (const car of carsToExport) {
      const mid = makeIdMapping[car.make] || makeIdMapping[car.make?.trim()];
      if (mid) uniqueMakeIds.add(mid);
    }

    const modelIdCache: Record<string, Record<string, string>> = {};
    for (const mId of uniqueMakeIds) {
      try {
        const resp = await fetch(`https://autoplius.lt/importhandler?datacollector=1&category_id=2&make_id=${mId}`);
        if (resp.ok) {
          const xmlText = await resp.text();
          // Parse model IDs from datacollector XML response
          // Format: <option value="ID">ModelName</option>
          const modelMap: Record<string, string> = {};
          const optionRegex = /<option\s+value="(\d+)"[^>]*>([^<]+)<\/option>/gi;
          let match;
          while ((match = optionRegex.exec(xmlText)) !== null) {
            const modelId = match[1];
            const modelName = match[2].trim();
            modelMap[modelName.toLowerCase()] = modelId;
          }
          modelIdCache[mId] = modelMap;
          console.log(`Loaded ${Object.keys(modelMap).length} models for make_id ${mId}`);
        }
      } catch (e) {
        console.warn(`Failed to fetch models for make_id ${mId}:`, e);
      }
    }

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<autoplius>\n';
    xml += '<announcements>\n';

    for (const car of carsToExport) {
      xml += '<cars>\n';
      
      // external_id (required)
      xml += `<external_id>${escapeXml(car.id)}</external_id>\n`;
      
      // sell_price (required)
      xml += `<sell_price>${car.price}</sell_price>\n`;
      
      // make_id (required)
      const makeId = makeIdMapping[car.make] || makeIdMapping[car.make?.trim()] || "";
      if (makeId) {
        xml += `<make_id>${makeId}</make_id>\n`;
      } else {
        console.warn(`Unknown make: ${car.make} - skipping make_id`);
        xml += `<make_id>${escapeXml(car.make)}</make_id>\n`;
      }
      
      // model_id (required - numeric ID from Autoplius datacollector)
      let resolvedModelId = "";
      if (makeId && modelIdCache[makeId]) {
        const modelLower = car.model?.trim().toLowerCase() || "";
        resolvedModelId = modelIdCache[makeId][modelLower] || "";
        // Try partial match if exact match fails
        if (!resolvedModelId) {
          for (const [name, id] of Object.entries(modelIdCache[makeId])) {
            if (name === modelLower || modelLower.startsWith(name) || name.startsWith(modelLower)) {
              resolvedModelId = id;
              break;
            }
          }
        }
      }
      if (resolvedModelId) {
        xml += `<model_id>${resolvedModelId}</model_id>\n`;
      } else {
        console.warn(`Could not resolve model_id for ${car.make} ${car.model}, sending text`);
        xml += `<model_id>${escapeXml(car.model)}</model_id>\n`;
      }
      
      // fk_place_countries_id (required) - 1 = Lietuva
      xml += `<fk_place_countries_id>1</fk_place_countries_id>\n`;
      
      // fk_place_cities_id (required)
      const cityId = cityMapping[car.city || "Kaunas"] || "2";
      xml += `<fk_place_cities_id>${cityId}</fk_place_cities_id>\n`;
      
      // contacts (required)
      xml += `<contacts_phone>+37062851439</contacts_phone>\n`;
      xml += `<contacts_name>AutoKOPERS</contacts_name>\n`;
      xml += `<contacts_email>labas@autokopers.lt</contacts_email>\n`;
      
      // price_vat_applicable
      xml += `<price_vat_applicable>0</price_vat_applicable>\n`;
      xml += `<price_vat_rate>21</price_vat_rate>\n`;
      xml += `<price_duty_unpaid>0</price_duty_unpaid>\n`;

      // is_condition_new (0 = used, 1 = new)
      const isNew = isNewCar(car.condition) ? "1" : "0";
      xml += `<is_condition_new>${isNew}</is_condition_new>\n`;
      
      // comments (description)
      if (car.description) {
        xml += `<comments><![CDATA[${car.description}]]></comments>\n`;
      }
      
      // number_of_doors_id (required)
      if (car.doors && doorsMapping[car.doors]) {
        xml += `<number_of_doors_id>${doorsMapping[car.doors]}</number_of_doors_id>\n`;
      } else {
        xml += `<number_of_doors_id>127</number_of_doors_id>\n`; // default 4/5
      }
      
      // make_date (required, format YYYY-MM)
      const makeDate = formatYearMonth(car.first_reg_date, car.year);
      xml += `<make_date>${makeDate}</make_date>\n`;

      // first_reg_date (when used car)
      if (isNew === "0") {
        const firstRegDate = formatYearMonth(car.first_reg_date, car.year);
        xml += `<first_reg_date>${firstRegDate}</first_reg_date>\n`;
      }
      
      // vin
      if (car.vin) {
        xml += `<vin>${escapeXml(car.vin)}</vin>\n`;
      }
      
      // body_type_id (required)
      if (car.body_type && bodyTypeMapping[car.body_type]) {
        xml += `<body_type_id>${bodyTypeMapping[car.body_type]}</body_type_id>\n`;
      } else {
        xml += `<body_type_id>4</body_type_id>\n`; // default Sedanas
      }
      
      // fuel_id (required)
      if (car.fuel_type && fuelTypeMapping[car.fuel_type]) {
        xml += `<fuel_id>${fuelTypeMapping[car.fuel_type]}</fuel_id>\n`;
      } else {
        xml += `<fuel_id>30</fuel_id>\n`; // default Benzinas
      }
      
      // gearbox_id (required)
      if (car.transmission && transmissionMapping[car.transmission]) {
        xml += `<gearbox_id>${transmissionMapping[car.transmission]}</gearbox_id>\n`;
      } else {
        xml += `<gearbox_id>38</gearbox_id>\n`; // default Automatinė
      }
      
      // kilometrage
      if (car.mileage) {
        xml += `<kilometrage>${car.mileage}</kilometrage>\n`;
      }
      
      // sdk_code
      if (car.sdk_code) {
        xml += `<sdk_code>${escapeXml(car.sdk_code)}</sdk_code>\n`;
      }
      
      // number_of_seats_id (dropdown ID, not raw number)
      if (car.seats && seatsMapping[car.seats]) {
        xml += `<number_of_seats_id>${seatsMapping[car.seats]}</number_of_seats_id>\n`;
      } else {
        xml += `<number_of_seats_id>17359</number_of_seats_id>\n`; // default 5
      }
      
      // color_id (required)
      if (car.color && colorMapping[car.color]) {
        xml += `<color_id>${colorMapping[car.color]}</color_id>\n`;
      } else {
        xml += `<color_id>18933</color_id>\n`; // default Pilka
      }
      
      // has_damaged_id (required)
      if (car.defects && car.defects.trim().length > 0) {
        xml += `<has_damaged_id>10925</has_damaged_id>\n`; // Daužtas
      } else if (car.condition && hasDamagedMapping[car.condition]) {
        xml += `<has_damaged_id>${hasDamagedMapping[car.condition]}</has_damaged_id>\n`;
      } else {
        xml += `<has_damaged_id>10924</has_damaged_id>\n`; // Be defektų
      }
      
      // steering_wheel_id (required)
      if (car.steering_wheel && steeringWheelMapping[car.steering_wheel]) {
        xml += `<steering_wheel_id>${steeringWheelMapping[car.steering_wheel]}</steering_wheel_id>\n`;
      } else {
        xml += `<steering_wheel_id>10922</steering_wheel_id>\n`; // default Kairėje
      }
      
      // power (kW)
      if (car.power_kw) {
        xml += `<power>${car.power_kw}</power>\n`;
      }
      
      // engine_capacity (cm³)
      if (car.engine_capacity) {
        const engineCc = car.engine_capacity < 100 ? Math.round(car.engine_capacity * 1000) : car.engine_capacity;
        xml += `<engine_capacity>${engineCc}</engine_capacity>\n`;
      }
      
      // co2
      if (car.co2_emission) {
        xml += `<co2>${car.co2_emission}</co2>\n`;
      }
      
      // euro_id
      if (car.euro_standard && euroStandardMapping[car.euro_standard]) {
        xml += `<euro_id>${euroStandardMapping[car.euro_standard]}</euro_id>\n`;
      }
      
      // origin_country_id
      if (car.origin_country && originCountryMapping[car.origin_country]) {
        xml += `<origin_country_id>${originCountryMapping[car.origin_country]}</origin_country_id>\n`;
      }
      
      // mot_date (format YYYY-MM)
      if (car.mot_date) {
        const motDate = formatYearMonth(car.mot_date);
        xml += `<mot_date>${motDate}</mot_date>\n`;
      }
      
      // wheel_drive_id
      if (car.wheel_drive && wheelDriveMapping[car.wheel_drive]) {
        xml += `<wheel_drive_id>${wheelDriveMapping[car.wheel_drive]}</wheel_drive_id>\n`;
      }
      
      // wheel_radius_id
      if (car.wheel_size && wheelRadiusMapping[car.wheel_size]) {
        xml += `<wheel_radius_id>${wheelRadiusMapping[car.wheel_size]}</wheel_radius_id>\n`;
      }
      
      // fuel consumption
      if (car.fuel_cons_urban) {
        xml += `<fuel_cons_urban>${car.fuel_cons_urban}</fuel_cons_urban>\n`;
      }
      if (car.fuel_cons_highway) {
        xml += `<fuel_cons_extra_urban>${car.fuel_cons_highway}</fuel_cons_extra_urban>\n`;
      }
      if (car.fuel_cons_combined) {
        xml += `<fuel_cons_combined>${car.fuel_cons_combined}</fuel_cons_combined>\n`;
      }

      // reservation
      if (car.is_reserved) {
        xml += `<reservation>1</reservation>\n`;
      }

      // Photos
      const carImages = imagesByCarId[car.id] || [];
      if (carImages.length > 0 || car.image_url) {
        xml += '<photos>\n';
        
        if (car.image_url && !carImages.some(img => img.image_url === car.image_url)) {
          xml += `<photo>${escapeXml(car.image_url)}</photo>\n`;
        }
        
        for (const img of carImages) {
          xml += `<photo>${escapeXml(img.image_url)}</photo>\n`;
        }
        
        xml += '</photos>\n';
      }
      
      xml += '</cars>\n';
    }

    xml += '</announcements>\n';
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
        "Content-Type": "text/xml; charset=utf-8",
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
