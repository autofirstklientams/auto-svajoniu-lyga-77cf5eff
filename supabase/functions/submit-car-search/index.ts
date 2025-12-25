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
  const phoneRegex = /^\+?[\d\s\-()]{8,20}$/;
  return phoneRegex.test(phone);
}

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

interface CarSearchRequest {
  name: string;
  email: string;
  phone: string;
  make?: string;
  model?: string;
  yearFrom?: string;
  yearTo?: string;
  priceFrom?: string;
  priceTo?: string;
  fuelType?: string;
  transmission?: string;
  additionalInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const { 
      name, email, phone, 
      make, model, yearFrom, yearTo, 
      priceFrom, priceTo, fuelType, transmission, additionalInfo 
    } = body as CarSearchRequest;
    
    // Validate required fields
    if (!name || !email || !phone) {
      console.error("Missing required fields:", { name: !!name, email: !!email, phone: !!phone });
      return new Response(
        JSON.stringify({ error: "Visi privalomi laukai turi būti užpildyti" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Neteisingas el. pašto formatas" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      console.error("Invalid phone format:", phone);
      return new Response(
        JSON.stringify({ error: "Neteisingas telefono numerio formatas" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize string inputs
    const sanitizedName = sanitizeString(name, 100);
    const sanitizedMake = make ? sanitizeString(make, 50) : '';
    const sanitizedModel = model ? sanitizeString(model, 50) : '';
    const sanitizedYearFrom = yearFrom ? sanitizeString(yearFrom, 4) : '';
    const sanitizedYearTo = yearTo ? sanitizeString(yearTo, 4) : '';
    const sanitizedPriceFrom = priceFrom ? sanitizeString(priceFrom, 10) : '';
    const sanitizedPriceTo = priceTo ? sanitizeString(priceTo, 10) : '';
    const sanitizedFuelType = fuelType ? sanitizeString(fuelType, 20) : '';
    const sanitizedTransmission = transmission ? sanitizeString(transmission, 20) : '';
    const sanitizedAdditionalInfo = additionalInfo ? sanitizeString(additionalInfo, 1000) : '';

    // Escape for HTML emails
    const safeName = escapeHtml(sanitizedName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMake = escapeHtml(sanitizedMake);
    const safeModel = escapeHtml(sanitizedModel);
    const safeYearFrom = escapeHtml(sanitizedYearFrom);
    const safeYearTo = escapeHtml(sanitizedYearTo);
    const safePriceFrom = escapeHtml(sanitizedPriceFrom);
    const safePriceTo = escapeHtml(sanitizedPriceTo);
    const safeFuelType = escapeHtml(sanitizedFuelType);
    const safeTransmission = escapeHtml(sanitizedTransmission);
    const safeAdditionalInfo = escapeHtml(sanitizedAdditionalInfo);

    console.log("Received car search inquiry:", { name: safeName, email: safeEmail, make: safeMake, model: safeModel });

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

    // Build car details for email
    const carTitle = safeMake && safeModel ? `${safeMake} ${safeModel}` : (safeMake || safeModel || 'Automobilis');

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "AutoKopers <labas@autokopers.lt>",
      to: [email],
      subject: "Jūsų auto paieškos užklausa gauta - AutoKopers",
      replyTo: "labas@autokopers.lt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="https://www.autokopers.lt/logo-email.png" alt="AutoKopers" style="max-width: 220px; height: auto;" />
          </div>
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #2B3B5C; margin-top: 0;">Labas, ${safeVocativeName}!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Dėkojame už jūsų automobilio paieškos užklausą! Mūsų specialistai pradės paiešką pagal jūsų pateiktus kriterijus.
            </p>
            <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2B3B5C; margin-top: 0;">Jūsų paieškos kriterijai:</h3>
              <table style="width: 100%; color: #333;">
                ${safeMake ? `<tr><td style="padding: 5px 0;"><strong>Gamintojas:</strong></td><td>${safeMake}</td></tr>` : ''}
                ${safeModel ? `<tr><td style="padding: 5px 0;"><strong>Modelis:</strong></td><td>${safeModel}</td></tr>` : ''}
                ${safeYearFrom || safeYearTo ? `<tr><td style="padding: 5px 0;"><strong>Metai:</strong></td><td>${safeYearFrom || '?'} - ${safeYearTo || '?'}</td></tr>` : ''}
                ${safePriceFrom || safePriceTo ? `<tr><td style="padding: 5px 0;"><strong>Kaina:</strong></td><td>${safePriceFrom || '?'} € - ${safePriceTo || '?'} €</td></tr>` : ''}
                ${safeFuelType ? `<tr><td style="padding: 5px 0;"><strong>Kuro tipas:</strong></td><td>${safeFuelType}</td></tr>` : ''}
                ${safeTransmission ? `<tr><td style="padding: 5px 0;"><strong>Pavarų dėžė:</strong></td><td>${safeTransmission}</td></tr>` : ''}
              </table>
              ${safeAdditionalInfo ? `<p style="margin-top: 15px; color: #555;"><strong>Papildoma informacija:</strong><br>${safeAdditionalInfo}</p>` : ''}
            </div>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Susisieksime su jumis artimiausiu metu su pasiūlymais.
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
      from: "AutoKopers <labas@autokopers.lt>",
      to: ["autofirstklientams@gmail.com"],
      subject: `Nauja auto paieškos užklausa - ${carTitle} - ${safeName}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2B3B5C; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚗 Nauja auto paieškos užklausa</h1>
          </div>
          <div style="padding: 25px; background-color: #f8f9fa;">
            <h2 style="color: #2B3B5C; margin-top: 0;">Kliento informacija:</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; width: 40%;"><strong>Vardas:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>El. paštas:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Telefonas:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${safePhone}">${safePhone}</a></td>
              </tr>
            </table>
            
            <h2 style="color: #2B3B5C;">Automobilio kriterijai:</h2>
            <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px;">
              ${safeMake ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; width: 40%;"><strong>Gamintojas:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeMake}</td>
              </tr>
              ` : ''}
              ${safeModel ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Modelis:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeModel}</td>
              </tr>
              ` : ''}
              ${safeYearFrom ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Metai nuo:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeYearFrom}</td>
              </tr>
              ` : ''}
              ${safeYearTo ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Metai iki:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeYearTo}</td>
              </tr>
              ` : ''}
              ${safePriceFrom ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Kaina nuo:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safePriceFrom} €</td>
              </tr>
              ` : ''}
              ${safePriceTo ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Kaina iki:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safePriceTo} €</td>
              </tr>
              ` : ''}
              ${safeFuelType ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Kuro tipas:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeFuelType}</td>
              </tr>
              ` : ''}
              ${safeTransmission ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Pavarų dėžė:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeTransmission}</td>
              </tr>
              ` : ''}
            </table>
            
            ${safeAdditionalInfo ? `
            <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 8px;">
              <h3 style="color: #2B3B5C; margin-top: 0;">Papildoma informacija:</h3>
              <p style="color: #333; white-space: pre-wrap;">${safeAdditionalInfo}</p>
            </div>
            ` : ''}
          </div>
        </div>
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
    console.error("Error in submit-car-search function:", error);
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
