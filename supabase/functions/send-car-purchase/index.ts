import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent XSS/HTML injection
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, (match) => htmlEscapes[match] || match);
}

// Input validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function isValidPhone(phone: string): boolean {
  // Allow international format with optional +, spaces, and dashes
  const phoneRegex = /^\+?[\d\s\-()]{8,20}$/;
  return phoneRegex.test(phone);
}

function isValidYear(year: string): boolean {
  const yearNum = parseInt(year, 10);
  return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= new Date().getFullYear() + 2;
}

function isValidMileage(mileage: string): boolean {
  const mileageNum = parseInt(mileage, 10);
  return !isNaN(mileageNum) && mileageNum >= 0 && mileageNum <= 10000000;
}

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

interface CarPurchaseRequest {
  name: string;
  email: string;
  phone: string;
  carMake: string;
  carModel: string;
  carYear: string;
  mileage: string;
  additionalInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate required fields exist
    const { name, email, phone, carMake, carModel, carYear, mileage, additionalInfo } = body as CarPurchaseRequest;
    
    if (!name || !email || !phone || !carMake || !carModel || !carYear || !mileage) {
      return new Response(
        JSON.stringify({ error: "Visi privalomi laukai turi būti užpildyti" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Neteisingas el. pašto formatas" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return new Response(
        JSON.stringify({ error: "Neteisingas telefono numerio formatas" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate year
    if (!isValidYear(carYear)) {
      return new Response(
        JSON.stringify({ error: "Neteisingi automobilio metai" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate mileage
    if (!isValidMileage(mileage)) {
      return new Response(
        JSON.stringify({ error: "Neteisinga rida" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize inputs with length limits
    const sanitizedName = sanitizeString(name, 100);
    const sanitizedCarMake = sanitizeString(carMake, 50);
    const sanitizedCarModel = sanitizeString(carModel, 50);
    const sanitizedAdditionalInfo = additionalInfo ? sanitizeString(additionalInfo, 1000) : '';

    // Escape user input to prevent HTML injection
    const safeName = escapeHtml(sanitizedName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeCarMake = escapeHtml(sanitizedCarMake);
    const safeCarModel = escapeHtml(sanitizedCarModel);
    const safeCarYear = escapeHtml(carYear);
    const safeMileage = escapeHtml(mileage);
    const safeAdditionalInfo = sanitizedAdditionalInfo ? escapeHtml(sanitizedAdditionalInfo) : '';

    console.log("Received validated car purchase request:", { name: safeName, email: safeEmail, carMake: safeCarMake, carModel: safeCarModel });

    // Convert name to vocative case (Lithuanian grammar)
    const getVocativeName = (fullName: string): string => {
      const parts = fullName.trim().split(/\s+/);
      return parts.map(part => {
        const lower = part.toLowerCase();
        if (lower.endsWith('as')) return part.slice(0, -2) + 'ai';
        if (lower.endsWith('is')) return part.slice(0, -2) + 'i';
        if (lower.endsWith('us')) return part.slice(0, -2) + 'au';
        if (lower.endsWith('ys')) return part.slice(0, -2) + 'y';
        if (lower.endsWith('ė')) return part.slice(0, -1) + 'e';
        if (lower.endsWith('a')) return part.slice(0, -1) + 'a';
        return part;
      }).join(' ');
    };

    const vocativeName = getVocativeName(sanitizedName);
    const safeVocativeName = escapeHtml(vocativeName);

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "AutoKopers <labas@autokopers.lt>",
      to: [email],
      subject: "Jūsų automobilio pardavimo užklausa gauta - AutoKopers",
      replyTo: "labas@autokopers.lt",
      text: `Labas, ${vocativeName}!\n\nDėkojame už jūsų užklausą ir nekantraujame jums padėti!\n\nGavome jūsų automobilio pardavimo užklausą.\nMarkė: ${sanitizedCarMake}\nModelis: ${sanitizedCarModel}\nMetai: ${carYear}\nRida: ${mileage} km\n${sanitizedAdditionalInfo ? `Papildoma informacija: ${sanitizedAdditionalInfo}` : ''}\n\nNetrukus susisieksime.\nAutoKopers komanda`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="https://www.autokopers.lt/logo-email.png" alt="AutoKopers" style="max-width: 220px; height: auto;" />
          </div>
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #2B3B5C; margin-top: 0;">Labas, ${safeVocativeName}!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Dėkojame už jūsų užklausą ir nekantraujame jums padėti!
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Gavome jūsų automobilio pardavimo užklausą su šiais duomenimis:
            </p>
            <h3 style="color: #2B3B5C;">Automobilio informacija:</h3>
            <ul style="color: #333; font-size: 16px; line-height: 1.8;">
              <li><strong>Markė:</strong> ${safeCarMake}</li>
              <li><strong>Modelis:</strong> ${safeCarModel}</li>
              <li><strong>Metai:</strong> ${safeCarYear}</li>
              <li><strong>Rida:</strong> ${safeMileage} km</li>
              ${safeAdditionalInfo ? `<li><strong>Papildoma informacija:</strong> ${safeAdditionalInfo}</li>` : ''}
            </ul>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Mūsų specialistas susisieks su jumis artimiausiu metu dėl automobilio įvertinimo.
            </p>
            <div style="background-color: #f0f4f8; border-left: 4px solid #2B3B5C; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2B3B5C;">
                <strong>Kontaktai:</strong><br>
                El. paštas: <a href="mailto:labas@autokopers.lt" style="color: #2B3B5C;">labas@autokopers.lt</a><br>
                Telefonas: <a href="tel:+37062851439" style="color: #2B3B5C;">+370 628 51439</a>
              </p>
            </div>
          </div>
          <div style="background-color: #2B3B5C; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              Geros dienos,<br>AutoKopers komanda
            </p>
          </div>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmail);

    // Send notification email to admin
    const adminEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: ["autofirstklientams@gmail.com"],
      subject: `Nauja automobilio supirkimo užklausa - ${safeCarMake} ${safeCarModel}`,
      replyTo: email,
      text: `Nauja užklausa. Vardas: ${sanitizedName}. El. paštas: ${email}. Tel.: ${phone}. Markė: ${sanitizedCarMake}. Modelis: ${sanitizedCarModel}. Metai: ${carYear}. Rida: ${mileage} km. ${sanitizedAdditionalInfo ? `Papildoma informacija: ${sanitizedAdditionalInfo}` : ''}`,
      html: `
        <h1>Nauja automobilio supirkimo užklausa</h1>
        <h2>Kliento informacija:</h2>
        <ul>
          <li><strong>Vardas:</strong> ${safeName}</li>
          <li><strong>El. paštas:</strong> ${safeEmail}</li>
          <li><strong>Telefonas:</strong> ${safePhone}</li>
        </ul>
        <h2>Automobilio duomenys:</h2>
        <ul>
          <li><strong>Markė:</strong> ${safeCarMake}</li>
          <li><strong>Modelis:</strong> ${safeCarModel}</li>
          <li><strong>Metai:</strong> ${safeCarYear}</li>
          <li><strong>Rida:</strong> ${safeMileage} km</li>
          ${safeAdditionalInfo ? `<li><strong>Papildoma informacija:</strong> ${safeAdditionalInfo}</li>` : ''}
        </ul>
      `,
    });

    console.log("Admin email sent:", adminEmail);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-car-purchase function:", error);
    return new Response(
      JSON.stringify({ error: "Įvyko klaida siunčiant užklausą" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
