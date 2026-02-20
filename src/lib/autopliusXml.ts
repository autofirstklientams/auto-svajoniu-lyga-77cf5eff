import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppSupabaseClient = SupabaseClient<Database>;

type CarRow = Database["public"]["Tables"]["cars"]["Row"];
type CarImageRow = Database["public"]["Tables"]["car_images"]["Row"];

interface BuildXmlOptions {
  includeCarId?: string;
  includeNotVisible?: boolean;
  expectCarInFeed?: boolean;
}

interface PreparedCarForXml {
  car: CarRow;
  externalId: string;
  makeId: string;
  modelId: string;
}

const AUTOPLIUS_IMPORTHANDLER_URL = "https://en.autoplius.lt/importhandler";
const AUTOPLIUS_CARS_CATEGORY_ID = "2";
const AUTOPLIUS_EXPORTS_BUCKET = "autoplius-exports";

interface UploadAutopliusXmlOptions {
  carId?: string | null;
  userId?: string | null;
  expiresInSeconds?: number;
}

const makeIdMapping: Record<string, string> = {
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

const modelIdMappingByMake: Record<string, Record<string, string>> = {
  // Optional static fallback. Prefer datacollector and VITE_AUTOPLIUS_MODEL_ID_MAP_JSON.
};

const fuelTypeMapping: Record<string, string> = {
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

const transmissionMapping: Record<string, string> = {
  "Mechanine": "38",
  "Mechaninė": "38",
  "Automatine": "39",
  "Automatinė": "39",
  "Robotizuota": "40",
};

const bodyTypeMapping: Record<string, string> = {
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

const colorMapping: Record<string, string> = {
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

const doorsMapping: Record<number, string> = {
  2: "126",
  3: "127",
  4: "128",
  5: "129",
};

const steeringWheelMapping: Record<string, string> = {
  "Kairė": "10922",
  "Dešinė": "10923",
};

const hasDamagedMapping: Record<string, string> = {
  "Be defektų": "254",
  "Su defektais": "255",
  "Naudotas": "254",
  "Naujas": "254",
  "Daužtas": "255",
};

const euroStandardMapping: Record<string, string> = {
  "Euro 1": "1",
  "Euro 2": "2",
  "Euro 3": "3",
  "Euro 4": "4",
  "Euro 5": "5",
  "Euro 6": "6",
  "Euro 6d": "7",
};

const wheelDriveMapping: Record<string, string> = {
  "Priekiniai": "66",
  "Galiniai": "67",
  "Visi": "68",
};

const cityMapping: Record<string, string> = {
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

const originCountryMapping: Record<string, string> = {
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

const modelMapCacheByMakeId = new Map<string, Record<string, string>>();
const datacollectorUnavailableByMakeId = new Set<string>();
let envModelIdMapCache: Record<string, Record<string, string>> | null = null;
let envMakeIdMapCache: Record<string, string> | null = null;

export async function buildAutopliusXmlFromDatabase(
  supabase: AppSupabaseClient,
  options: BuildXmlOptions = {}
): Promise<string> {
  const includeCarId = normalizeUuid(options.includeCarId);
  const includeNotVisible = options.includeNotVisible === true;
  const expectCarInFeed = options.expectCarInFeed === true;

  let carsQuery;
  if (includeCarId && includeNotVisible) {
    carsQuery = supabase
      .from("cars")
      .select("*")
      .or(`visible_autoplius.eq.true,id.eq.${includeCarId}`)
      .order("created_at", { ascending: false });
  } else {
    carsQuery = supabase
      .from("cars")
      .select("*")
      .eq("visible_autoplius", true)
      .order("created_at", { ascending: false });
  }

  const { data: carsData, error: carsError } = await carsQuery;
  if (carsError) {
    throw new Error(`Nepavyko gauti automobilių: ${carsError.message}`);
  }

  let carsToExport = (carsData || []) as CarRow[];

  if (includeCarId && (includeNotVisible || expectCarInFeed)) {
    const { data: requestedCar, error: requestedCarError } = await supabase
      .from("cars")
      .select("*")
      .eq("id", includeCarId)
      .maybeSingle();

    if (requestedCarError) {
      throw new Error(`Nepavyko gauti pasirinkto automobilio: ${requestedCarError.message}`);
    }

    if (requestedCar && !carsToExport.some((car) => car.id === requestedCar.id)) {
      carsToExport = [requestedCar, ...carsToExport];
    }
  }

  if (expectCarInFeed && includeCarId && !carsToExport.some((car) => car.id === includeCarId)) {
    throw new Error(`Pasirinktas automobilis ${includeCarId} nerastas eksportui`);
  }

  const preparedCars = await prepareCarsForXml(carsToExport, {
    includeCarId,
    expectCarInFeed,
  });

  if (preparedCars.length === 0) {
    throw new Error("Nėra nei vieno Autoplius reikalavimus atitinkančio automobilio eksportui");
  }

  if (expectCarInFeed && includeCarId && !preparedCars.some((item) => item.car.id === includeCarId)) {
    throw new Error(`Pasirinktas automobilis ${includeCarId} neatitiko Autoplius XML reikalavimų`);
  }

  const { data: imagesData, error: imagesError } = await supabase
    .from("car_images")
    .select("car_id,image_url,display_order")
    .order("display_order", { ascending: true });

  if (imagesError) {
    throw new Error(`Nepavyko gauti automobilių nuotraukų: ${imagesError.message}`);
  }

  const imagesByCarId: Record<string, CarImageRow[]> = {};
  for (const image of imagesData || []) {
    if (!imagesByCarId[image.car_id]) {
      imagesByCarId[image.car_id] = [];
    }
    imagesByCarId[image.car_id].push(image);
  }

  return buildAutopliusXml(preparedCars, imagesByCarId);
}

export function buildAutopliusXml(
  cars: PreparedCarForXml[],
  imagesByCarId: Record<string, CarImageRow[]>
): string {
  if (cars.length === 0) {
    throw new Error("Autoplius XML negali būti tuščias: nėra paruoštų automobilių");
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<autoplius xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">\n';
  xml += "  <announcements>\n";

  for (const prepared of cars) {
    const { car, externalId, makeId, modelId } = prepared;

    xml += "    <cars>\n";
    xml += `      <external_id>${externalId}</external_id>\n`;
    xml += `      <make_id>${makeId}</make_id>\n`;
    xml += `      <model_id>${modelId}</model_id>\n`;
    xml += `      <sell_price>${Math.max(0, Number(car.price) || 0)}</sell_price>\n`;

    const isNew = isNewCar(car.condition) ? "1" : "0";
    xml += `      <is_condition_new>${isNew}</is_condition_new>\n`;

    xml += "      <contacts_phone>+37062851439</contacts_phone>\n";
    xml += "      <contacts_name>AutoKOPERS</contacts_name>\n";
    xml += "      <contacts_email>labas@autokopers.lt</contacts_email>\n";
    xml += "      <fk_place_countries_id>117</fk_place_countries_id>\n";

    const cityId = cityMapping[car.city || "Vilnius"] || "1";
    xml += `      <fk_place_cities_id>${cityId}</fk_place_cities_id>\n`;

    const makeDate = formatYearMonth(car.first_reg_date, car.year);
    xml += `      <make_date>${makeDate}</make_date>\n`;
    if (isNew === "0") {
      xml += `      <first_reg_date>${formatYearMonth(car.first_reg_date, car.year)}</first_reg_date>\n`;
    }

    xml += `      <body_type_id>${bodyTypeMapping[car.body_type || ""] || "1"}</body_type_id>\n`;
    xml += `      <fuel_id>${fuelTypeMapping[car.fuel_type || ""] || "34"}</fuel_id>\n`;
    xml += `      <number_of_doors_id>${
      car.doors && doorsMapping[car.doors] ? doorsMapping[car.doors] : "128"
    }</number_of_doors_id>\n`;
    xml += `      <color_id>${colorMapping[car.color || ""] || "27"}</color_id>\n`;
    xml += `      <gearbox_id>${transmissionMapping[car.transmission || ""] || "38"}</gearbox_id>\n`;

    if (car.defects && car.defects.trim()) {
      xml += "      <has_damaged_id>255</has_damaged_id>\n";
    } else if (car.condition && hasDamagedMapping[car.condition]) {
      xml += `      <has_damaged_id>${hasDamagedMapping[car.condition]}</has_damaged_id>\n`;
    } else {
      xml += "      <has_damaged_id>254</has_damaged_id>\n";
    }

    xml += `      <steering_wheel_id>${
      car.steering_wheel && steeringWheelMapping[car.steering_wheel]
        ? steeringWheelMapping[car.steering_wheel]
        : "10922"
    }</steering_wheel_id>\n`;

    if (car.description) {
      xml += `      <comments><![CDATA[${escapeForCdata(car.description)}]]></comments>\n`;
    }

    if (car.engine_capacity) {
      const engineCc =
        car.engine_capacity < 100 ? Math.round(car.engine_capacity * 1000) : Math.round(car.engine_capacity);
      xml += `      <engine_capacity>${engineCc}</engine_capacity>\n`;
    }

    if (car.mileage !== null && car.mileage !== undefined) {
      xml += `      <kilometrage>${Math.max(0, Math.trunc(car.mileage))}</kilometrage>\n`;
    }
    if (car.power_kw) xml += `      <power>${Math.max(0, Math.round(car.power_kw))}</power>\n`;
    if (car.seats) xml += `      <number_of_seats_id>${Math.max(1, Math.round(car.seats))}</number_of_seats_id>\n`;
    if (car.vin) xml += `      <vin>${escapeXml(car.vin)}</vin>\n`;
    if (car.euro_standard && euroStandardMapping[car.euro_standard]) {
      xml += `      <euro_id>${euroStandardMapping[car.euro_standard]}</euro_id>\n`;
    }
    if (car.wheel_drive && wheelDriveMapping[car.wheel_drive]) {
      xml += `      <wheel_drive_id>${wheelDriveMapping[car.wheel_drive]}</wheel_drive_id>\n`;
    }
    if (car.co2_emission) xml += `      <co2>${Math.max(0, Math.round(car.co2_emission))}</co2>\n`;
    if (car.fuel_cons_urban) xml += `      <fuel_cons_urban>${car.fuel_cons_urban}</fuel_cons_urban>\n`;
    if (car.fuel_cons_highway) {
      xml += `      <fuel_cons_extra_urban>${car.fuel_cons_highway}</fuel_cons_extra_urban>\n`;
    }
    if (car.fuel_cons_combined) {
      xml += `      <fuel_cons_combined>${car.fuel_cons_combined}</fuel_cons_combined>\n`;
    }
    if (car.origin_country && originCountryMapping[car.origin_country]) {
      xml += `      <origin_country_id>${originCountryMapping[car.origin_country]}</origin_country_id>\n`;
    }

    const carImages = imagesByCarId[car.id] || [];
    if (carImages.length > 0 || car.image_url) {
      xml += "      <photos>\n";
      if (car.image_url && !carImages.some((img) => img.image_url === car.image_url)) {
        xml += `        <photo>${escapeXml(car.image_url)}</photo>\n`;
      }
      for (const img of carImages) {
        xml += `        <photo>${escapeXml(img.image_url)}</photo>\n`;
      }
      xml += "      </photos>\n";
    }

    xml += "    </cars>\n";
  }

  xml += "  </announcements>\n";
  xml += "</autoplius>";
  return xml;
}

export function downloadAutopliusXml(xml: string): void {
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = objectUrl;
  link.download = `autoplius-feed-${dateStamp}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export async function pushAutopliusXml(xml: string): Promise<{ message: string }> {
  const endpoint = import.meta.env.VITE_AUTOPLIUS_IMPORT_POST_URL as string | undefined;
  if (!endpoint) {
    throw new Error("Trūksta VITE_AUTOPLIUS_IMPORT_POST_URL aplinkos kintamojo");
  }

  const payloadMode = (
    (import.meta.env.VITE_AUTOPLIUS_IMPORT_PAYLOAD_MODE as string | undefined) || "raw_xml"
  ).toLowerCase();
  const authMode = (
    (import.meta.env.VITE_AUTOPLIUS_IMPORT_AUTH_MODE as string | undefined) || "basic"
  ).toLowerCase();

  const username = (import.meta.env.VITE_AUTOPLIUS_IMPORT_USERNAME as string | undefined) || "";
  const password = (import.meta.env.VITE_AUTOPLIUS_IMPORT_PASSWORD as string | undefined) || "";
  const extraHeadersRaw =
    (import.meta.env.VITE_AUTOPLIUS_IMPORT_EXTRA_HEADERS_JSON as string | undefined) || "";

  const modes: Array<"raw_xml" | "form_urlencoded"> =
    payloadMode === "auto"
      ? ["raw_xml", "form_urlencoded"]
      : payloadMode === "form_urlencoded"
      ? ["form_urlencoded"]
      : ["raw_xml"];

  let extraHeaders: Record<string, string> = {};
  if (extraHeadersRaw) {
    try {
      const parsed = JSON.parse(extraHeadersRaw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        extraHeaders = Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
          if (typeof value === "string") acc[key] = value;
          return acc;
        }, {});
      }
    } catch {
      throw new Error("VITE_AUTOPLIUS_IMPORT_EXTRA_HEADERS_JSON turi būti validus JSON objektas");
    }
  }

  let lastError: Error | null = null;

  for (const mode of modes) {
    const headers = new Headers(extraHeaders);
    headers.set("Accept", "application/json,text/plain,text/html,application/xml,*/*");

    let body: string;
    if (mode === "form_urlencoded") {
      const xmlFieldName =
        (import.meta.env.VITE_AUTOPLIUS_IMPORT_XML_FIELD as string | undefined) || "xml";
      const params = new URLSearchParams();
      params.set(xmlFieldName, xml);

      if (authMode === "form") {
        const usernameFieldName =
          (import.meta.env.VITE_AUTOPLIUS_IMPORT_USERNAME_FIELD as string | undefined) || "username";
        const passwordFieldName =
          (import.meta.env.VITE_AUTOPLIUS_IMPORT_PASSWORD_FIELD as string | undefined) || "password";
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
        throw new Error("Basic auth režimui trūksta VITE_AUTOPLIUS_IMPORT_USERNAME/PASSWORD");
      }
      headers.set("Authorization", `Basic ${btoa(`${username}:${password}`)}`);
    }

    try {
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
        message: `Autoplius sinchronizacija atlikta (HTTP ${response.status}, mode: ${mode})`,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Autoplius POST nepavyko dėl nežinomos klaidos");
    }
  }

  throw lastError || new Error("Autoplius POST nepavyko");
}

export async function uploadAutopliusXmlToStorage(
  supabase: AppSupabaseClient,
  xml: string,
  options: UploadAutopliusXmlOptions = {}
): Promise<{ fileName: string; path: string; url: string; expiresInSeconds: number }> {
  const userId = options.userId?.trim() || (await getCurrentUserId(supabase));
  if (!userId) {
    throw new Error("Nepavyko nustatyti vartotojo XML failo įkėlimui");
  }

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10);
  const timePart = now.toISOString().slice(11, 19).replace(/:/g, "-");
  const carSuffix = options.carId ? `-${sanitizeFilePart(options.carId)}` : "";
  const fileName = `autoplius-feed-${datePart}-${timePart}${carSuffix}.xml`;
  const path = `${userId}/debug/${fileName}`;

  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const { error: uploadError } = await supabase.storage
    .from(AUTOPLIUS_EXPORTS_BUCKET)
    .upload(path, blob, {
      contentType: "application/xml; charset=utf-8",
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Nepavyko įkelti XML į saugyklą: ${uploadError.message}`);
  }

  const expiresInSeconds = Math.max(60, options.expiresInSeconds || 24 * 60 * 60);
  const { data: signedData, error: signedError } = await supabase.storage
    .from(AUTOPLIUS_EXPORTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (signedError || !signedData?.signedUrl) {
    throw new Error(
      `Nepavyko sugeneruoti XML nuorodos: ${signedError?.message || "nežinoma klaida"}`
    );
  }

  return {
    fileName,
    path,
    url: signedData.signedUrl,
    expiresInSeconds,
  };
}

async function prepareCarsForXml(
  cars: CarRow[],
  options: { includeCarId?: string; expectCarInFeed: boolean }
): Promise<PreparedCarForXml[]> {
  const prepared: PreparedCarForXml[] = [];
  const skippedErrors: string[] = [];
  const externalIdsInFeed = new Set<string>();

  for (const car of cars) {
    try {
      const makeId = resolveMakeId(car.make);
      if (!makeId) {
        throw new Error(`Nerastas make_id markei \"${car.make}\"`);
      }

      const modelId = await resolveModelId(car, makeId);
      let externalId = toAutopliusExternalId(car.id);
      let salt = 1;
      while (externalIdsInFeed.has(externalId)) {
        externalId = toAutopliusExternalId(`${car.id}:${salt}`);
        salt += 1;
      }
      externalIdsInFeed.add(externalId);

      prepared.push({
        car,
        makeId,
        modelId,
        externalId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nežinoma klaida";
      const label = `${car.make} ${car.model} (${car.id})`;
      skippedErrors.push(`${label}: ${message}`);

      if (options.expectCarInFeed && options.includeCarId === car.id) {
        throw new Error(`Pasirinkto automobilio nepavyko paruošti eksportui: ${message}`);
      }
    }
  }

  if (skippedErrors.length > 0) {
    console.warn("Autoplius XML: dalis automobilių praleista dėl neatitikimų", skippedErrors);
  }

  return prepared;
}

function resolveMakeId(makeValue?: string | null): string | undefined {
  const numeric = extractStandaloneInteger(makeValue);
  if (numeric) return numeric;
  if (!makeValue) return undefined;

  if (makeIdMapping[makeValue]) {
    return makeIdMapping[makeValue];
  }

  const normalized = normalizeLookupKey(makeValue);

  for (const [name, id] of Object.entries(makeIdMapping)) {
    if (normalizeLookupKey(name) === normalized) {
      return id;
    }
  }

  const envMakeMap = getEnvMakeIdMap();
  return envMakeMap[normalized];
}

async function resolveModelId(car: CarRow, makeId: string): Promise<string> {
  const numeric = extractStandaloneInteger(car.model);
  if (numeric) {
    return numeric;
  }

  const modelName = (car.model || "").trim();
  if (!modelName) {
    throw new Error("Trūksta modelio pavadinimo");
  }

  const normalizedModel = normalizeLookupKey(modelName);
  const normalizedMake = normalizeLookupKey(car.make || "");

  const envModelMap = getEnvModelIdMap();
  const envByMakeId = envModelMap[makeId];
  if (envByMakeId && envByMakeId[normalizedModel]) {
    return envByMakeId[normalizedModel];
  }
  const envByMakeName = envModelMap[normalizedMake];
  if (envByMakeName && envByMakeName[normalizedModel]) {
    return envByMakeName[normalizedModel];
  }

  const staticMap = findStaticModelMap(car.make || "", makeId);
  if (staticMap && staticMap[normalizedModel]) {
    return staticMap[normalizedModel];
  }

  const remoteMap = await getDatacollectorModelsByMakeId(makeId);
  if (remoteMap[normalizedModel]) {
    return remoteMap[normalizedModel];
  }

  throw new Error(
    `Nerastas model_id modeliui \"${car.model}\" (make_id: ${makeId}). ` +
      "Pridėkite mapping į VITE_AUTOPLIUS_MODEL_ID_MAP_JSON arba įveskite modelio ID tiesiogiai."
  );
}

function findStaticModelMap(makeName: string, makeId: string): Record<string, string> | undefined {
  const direct = modelIdMappingByMake[makeName];
  if (direct) {
    return normalizeModelMap(direct);
  }

  const normalizedMake = normalizeLookupKey(makeName);
  for (const [key, map] of Object.entries(modelIdMappingByMake)) {
    if (normalizeLookupKey(key) === normalizedMake || normalizeLookupKey(key) === makeId) {
      return normalizeModelMap(map);
    }
  }

  return undefined;
}

function normalizeModelMap(map: Record<string, string>): Record<string, string> {
  return Object.entries(map).reduce<Record<string, string>>((acc, [modelName, modelId]) => {
    if (/^\d+$/.test(modelId)) {
      acc[normalizeLookupKey(modelName)] = normalizeIntegerString(modelId);
    }
    return acc;
  }, {});
}

async function getDatacollectorModelsByMakeId(makeId: string): Promise<Record<string, string>> {
  const cached = modelMapCacheByMakeId.get(makeId);
  if (cached) {
    return cached;
  }

  if (datacollectorUnavailableByMakeId.has(makeId)) {
    return {};
  }

  const url = `${AUTOPLIUS_IMPORTHANDLER_URL}?datacollector=1&category_id=${AUTOPLIUS_CARS_CATEGORY_ID}&make_id=${encodeURIComponent(
    makeId
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/xml,text/xml,application/json,text/plain,*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.text();
    const parsed = parseDatacollectorModels(payload);
    modelMapCacheByMakeId.set(makeId, parsed);
    return parsed;
  } catch (error) {
    datacollectorUnavailableByMakeId.add(makeId);
    console.warn(`Autoplius datacollector neprieinamas make_id=${makeId}`, error);
    return {};
  }
}

function parseDatacollectorModels(payload: string): Record<string, string> {
  const result: Record<string, string> = {};
  const trimmed = payload.trim();

  if (!trimmed) {
    return result;
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json = JSON.parse(trimmed);
      collectPairsFromUnknownStructure(json, result);
    } catch {
      // Ignore JSON parse failure and continue with XML/regex parsing.
    }
  }

  if (typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(trimmed, "application/xml");
      const parserError = doc.querySelector("parsererror");
      if (!parserError) {
        const options = Array.from(doc.getElementsByTagName("option"));
        for (const option of options) {
          const id = option.getAttribute("value")?.trim() || "";
          const label = option.textContent?.trim() || "";
          addModelPair(result, label, id);
        }

        const nodes = Array.from(doc.getElementsByTagName("*"));
        for (const node of nodes) {
          const attrId = node.getAttribute("id")?.trim() || "";
          const attrLabel =
            node.getAttribute("name")?.trim() ||
            node.getAttribute("title")?.trim() ||
            node.getAttribute("value")?.trim() ||
            node.getAttribute("label")?.trim() ||
            "";
          addModelPair(result, attrLabel, attrId);

          const childId = findChildNodeText(node, ["id", "key", "value_id", "model_id"]);
          const childLabel = findChildNodeText(node, ["name", "title", "label", "value", "text"]);
          addModelPair(result, childLabel, childId);
        }
      }
    } catch {
      // Ignore XML parser errors and rely on regex fallback.
    }
  }

  const optionRegex = /<option[^>]*value=["']?(\d+)["']?[^>]*>([^<]+)<\/option>/gi;
  let match: RegExpExecArray | null;
  while ((match = optionRegex.exec(trimmed)) !== null) {
    addModelPair(result, match[2], match[1]);
  }

  const idNameRegex =
    /<(?:id|key|model_id)>\s*(\d+)\s*<\/(?:id|key|model_id)>[\s\S]{0,220}?<(?:name|title|label|value|text)>\s*([^<]+?)\s*<\/(?:name|title|label|value|text)>/gi;
  while ((match = idNameRegex.exec(trimmed)) !== null) {
    addModelPair(result, match[2], match[1]);
  }

  return result;
}

function collectPairsFromUnknownStructure(value: unknown, target: Record<string, string>): void {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const item of value) {
      collectPairsFromUnknownStructure(item, target);
    }
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  const candidateId = [record.id, record.key, record.model_id, record.value_id]
    .find((entry) => typeof entry === "string" || typeof entry === "number");
  const candidateLabel = [record.name, record.title, record.label, record.value, record.text]
    .find((entry) => typeof entry === "string");

  if (candidateId !== undefined && candidateLabel !== undefined) {
    addModelPair(target, String(candidateLabel), String(candidateId));
  }

  for (const nested of Object.values(record)) {
    if (typeof nested === "object" && nested !== null) {
      collectPairsFromUnknownStructure(nested, target);
    }
  }
}

function findChildNodeText(node: Element, tags: string[]): string {
  for (const tag of tags) {
    const child = node.getElementsByTagName(tag)[0];
    const text = child?.textContent?.trim();
    if (text) {
      return text;
    }
  }
  return "";
}

function addModelPair(target: Record<string, string>, label: string, id: string): void {
  const normalizedId = normalizeIntegerString(id);
  if (!normalizedId) {
    return;
  }

  const normalizedLabel = normalizeLookupKey(label);
  if (!normalizedLabel) {
    return;
  }

  if (!target[normalizedLabel]) {
    target[normalizedLabel] = normalizedId;
  }
}

function getEnvModelIdMap(): Record<string, Record<string, string>> {
  if (envModelIdMapCache) {
    return envModelIdMapCache;
  }

  const raw = (import.meta.env.VITE_AUTOPLIUS_MODEL_ID_MAP_JSON as string | undefined) || "";
  if (!raw.trim()) {
    envModelIdMapCache = {};
    return envModelIdMapCache;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      envModelIdMapCache = {};
      return envModelIdMapCache;
    }

    const normalized: Record<string, Record<string, string>> = {};

    for (const [makeKey, models] of Object.entries(parsed as Record<string, unknown>)) {
      if (!models || typeof models !== "object" || Array.isArray(models)) {
        continue;
      }

      const normalizedMakeKey = normalizeLookupKey(makeKey);
      const makeMap: Record<string, string> = {};

      for (const [modelKey, modelId] of Object.entries(models as Record<string, unknown>)) {
        if (typeof modelId !== "string" && typeof modelId !== "number") {
          continue;
        }
        const normalizedModelKey = normalizeLookupKey(modelKey);
        const normalizedModelId = normalizeIntegerString(String(modelId));
        if (normalizedModelKey && normalizedModelId) {
          makeMap[normalizedModelKey] = normalizedModelId;
        }
      }

      if (Object.keys(makeMap).length > 0) {
        normalized[normalizedMakeKey] = makeMap;
      }
    }

    envModelIdMapCache = normalized;
    return envModelIdMapCache;
  } catch {
    throw new Error("VITE_AUTOPLIUS_MODEL_ID_MAP_JSON turi būti validus JSON objektas");
  }
}

function getEnvMakeIdMap(): Record<string, string> {
  if (envMakeIdMapCache) {
    return envMakeIdMapCache;
  }

  const raw = (import.meta.env.VITE_AUTOPLIUS_MAKE_ID_MAP_JSON as string | undefined) || "";
  if (!raw.trim()) {
    envMakeIdMapCache = {};
    return envMakeIdMapCache;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      envMakeIdMapCache = {};
      return envMakeIdMapCache;
    }

    envMakeIdMapCache = Object.entries(parsed as Record<string, unknown>).reduce<Record<string, string>>(
      (acc, [makeName, makeId]) => {
        if (typeof makeId !== "string" && typeof makeId !== "number") {
          return acc;
        }
        const normalizedMakeName = normalizeLookupKey(makeName);
        const normalizedMakeId = normalizeIntegerString(String(makeId));
        if (normalizedMakeName && normalizedMakeId) {
          acc[normalizedMakeName] = normalizedMakeId;
        }
        return acc;
      },
      {}
    );

    return envMakeIdMapCache;
  } catch {
    throw new Error("VITE_AUTOPLIUS_MAKE_ID_MAP_JSON turi būti validus JSON objektas");
  }
}

function toAutopliusExternalId(source: string): string {
  const numeric = extractStandaloneInteger(source);
  if (numeric && numeric.length <= 10) {
    return numeric;
  }

  const normalized = source.trim().toLowerCase();
  let hash = 2166136261;

  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const int32 = (hash >>> 0) % 2000000000;
  return String(int32 === 0 ? 1 : int32);
}

function normalizeLookupKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeIntegerString(value: string): string {
  const direct = value.trim();
  if (!/^\d+$/.test(direct)) {
    return "";
  }

  const stripped = direct.replace(/^0+(?=\d)/, "");
  if (!stripped || stripped === "0") {
    return "";
  }

  return stripped;
}

function extractStandaloneInteger(value?: string | null): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const direct = normalizeIntegerString(trimmed);
  if (direct) return direct;

  const supportedPatterns = [/\((\d+)\)\s*$/, /\|\s*(\d+)\s*$/, /#\s*(\d+)\s*$/];
  for (const pattern of supportedPatterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      const parsed = normalizeIntegerString(match[1]);
      if (parsed) return parsed;
    }
  }

  return undefined;
}

function isNewCar(condition?: string | null): boolean {
  return condition?.trim().toLowerCase() === "naujas";
}

function formatYearMonth(dateValue?: string | null, fallbackYear?: number | null): string {
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

  const year =
    typeof fallbackYear === "number" && Number.isFinite(fallbackYear)
      ? Math.max(1900, Math.trunc(fallbackYear))
      : new Date().getUTCFullYear();

  return `${year}-01`;
}

function escapeForCdata(str: string): string {
  return sanitizeXmlString(str).replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function escapeXml(str: string): string {
  return sanitizeXmlString(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeXmlString(str: string): string {
  return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function normalizeUuid(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed) ? trimmed : undefined;
}

async function getCurrentUserId(supabase: AppSupabaseClient): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(`Nepavyko gauti vartotojo duomenų: ${error.message}`);
  }
  return data.user?.id || null;
}

function sanitizeFilePart(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}
