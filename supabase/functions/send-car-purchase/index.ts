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

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: [email],
      subject: "Jūsų automobilio pardavimo užklausa gauta",
      replyTo: "labas@autokopers.lt",
      text: `Sveiki, ${sanitizedName}!\n\nGavome jūsų automobilio pardavimo užklausą.\nMarkė: ${sanitizedCarMake}\nModelis: ${sanitizedCarModel}\nMetai: ${carYear}\nRida: ${mileage} km\n${sanitizedAdditionalInfo ? `Papildoma informacija: ${sanitizedAdditionalInfo}` : ''}\n\nNetrukus susisieksime.\nAutoKopers komanda`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Sveiki, ${safeName}!</h1>
          <p>Gavome jūsų automobilio pardavimo užklausą su šiais duomenimis:</p>
          <h3>Automobilio informacija:</h3>
          <ul>
            <li><strong>Markė:</strong> ${safeCarMake}</li>
            <li><strong>Modelis:</strong> ${safeCarModel}</li>
            <li><strong>Metai:</strong> ${safeCarYear}</li>
            <li><strong>Rida:</strong> ${safeMileage} km</li>
            ${safeAdditionalInfo ? `<li><strong>Papildoma informacija:</strong> ${safeAdditionalInfo}</li>` : ''}
          </ul>
          <p>Mūsų specialistas susisieks su jumis artimiausiu metu el. paštu <strong>labas@autokopers.lt</strong> arba telefonu <strong>+370 628 51439</strong> dėl automobilio įvertinimo.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">Geros dienos,<br>AutoKopers komanda</p>
            <img src="https://www.autokopers.lt/autokopers-social.jpg" alt="AutoKopers" style="max-width: 200px; margin-top: 20px;" />
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
