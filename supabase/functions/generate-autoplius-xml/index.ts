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
}

// Autoplius fuel type mapping
const fuelTypeMapping: { [key: string]: string } = {
  "Benzinas": "1",
  "Dyzelinas": "2",
  "Elektra": "6",
  "Hibridas": "5",
  "Dujos": "3",
  "Benzinas/Dujos": "4",
};

// Autoplius transmission mapping
const transmissionMapping: { [key: string]: string } = {
  "Mechaninė": "1",
  "Automatinė": "2",
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

    console.log(`Found ${cars?.length || 0} cars`);

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<root>\n';

    if (cars && cars.length > 0) {
      for (const car of cars as Car[]) {
        xml += '  <ad>\n';
        xml += `    <category_id>2</category_id>\n`; // 2 = Automobiliai
        xml += `    <make_id>${car.make}</make_id>\n`;
        xml += `    <model_id>${car.model}</model_id>\n`;
        xml += `    <make_date>${car.year}</make_date>\n`;
        
        if (car.mileage) {
          xml += `    <km>${car.mileage}</km>\n`;
        }
        
        if (car.fuel_type && fuelTypeMapping[car.fuel_type]) {
          xml += `    <fuel_type_id>${fuelTypeMapping[car.fuel_type]}</fuel_type_id>\n`;
        }
        
        if (car.transmission && transmissionMapping[car.transmission]) {
          xml += `    <gearbox_id>${transmissionMapping[car.transmission]}</gearbox_id>\n`;
        }
        
        xml += `    <price>${car.price}</price>\n`;
        
        if (car.description) {
          // Escape special XML characters
          const description = car.description
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
          xml += `    <comment><![CDATA[${description}]]></comment>\n`;
        }
        
        if (car.image_url) {
          xml += `    <photo>${car.image_url}</photo>\n`;
        }
        
        xml += '  </ad>\n';
      }
    }

    xml += '</root>';

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

serve(handler);
