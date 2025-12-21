import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface InquiryRequest {
  name: string;
  email: string;
  phone: string;
  amount?: number;
  loanType?: string;
  loanPeriod?: string;
  source: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const { name, email, phone, amount, loanType, loanPeriod, source } = body as InquiryRequest;
    
    // Validate required fields
    if (!name || !email || !phone || !source) {
      console.error("Missing required fields:", { name: !!name, email: !!email, phone: !!phone, source: !!source });
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
    const sanitizedLoanType = loanType ? sanitizeString(loanType, 50) : null;
    const sanitizedLoanPeriod = loanPeriod ? sanitizeString(loanPeriod, 20) : null;
    const sanitizedSource = sanitizeString(source, 50);

    // Escape for HTML emails
    const safeName = escapeHtml(sanitizedName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeLoanType = sanitizedLoanType ? escapeHtml(sanitizedLoanType) : null;
    const safeLoanPeriod = sanitizedLoanPeriod ? escapeHtml(sanitizedLoanPeriod) : null;
    const safeSource = escapeHtml(sanitizedSource);

    console.log("Received inquiry:", { name: safeName, email: safeEmail, source: safeSource, amount, loanType: safeLoanType });

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: insertedData, error: insertError } = await supabase
      .from("inquiries")
      .insert({
        name: sanitizedName,
        email: email,
        phone: phone,
        amount: amount || null,
        loan_type: sanitizedLoanType,
        loan_period: sanitizedLoanPeriod,
        source: sanitizedSource,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Nepavyko išsaugoti užklausos" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Inquiry saved to database:", insertedData?.id);

    // Build loan details HTML for emails
    const loanDetailsHtml = `
      ${amount ? `<li><strong>Suma:</strong> ${amount} €</li>` : ''}
      ${safeLoanType ? `<li><strong>Paskolos tipas:</strong> ${safeLoanType}</li>` : ''}
      ${safeLoanPeriod ? `<li><strong>Terminas:</strong> ${safeLoanPeriod}</li>` : ''}
    `;

    // Send confirmation email to customer with AutoKopers branding (green)
    const customerEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: [email],
      subject: "Jūsų užklausa gauta - AutoKopers",
      replyTo: "labas@autokopers.lt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <div style="background-color: #16a34a; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AutoKopers</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #16a34a; margin-top: 0;">Sveiki, ${safeName}!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Dėkojame už Jūsų užklausą! Gavome šią informaciją:
            </p>
            <ul style="color: #333; font-size: 16px; line-height: 1.8;">
              ${loanDetailsHtml}
            </ul>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Mūsų specialistai susisieks su jumis artimiausiu metu.
            </p>
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #166534;">
                <strong>Kontaktai:</strong><br>
                El. paštas: <a href="mailto:labas@autokopers.lt" style="color: #16a34a;">labas@autokopers.lt</a><br>
                Telefonas: <a href="tel:+37062851439" style="color: #16a34a;">+370 628 51439</a>
              </p>
            </div>
          </div>
          <div style="background-color: #16a34a; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              Geros dienos,<br>AutoKopers komanda
            </p>
            <img src="https://www.autokopers.lt/autokopers-social.jpg" alt="AutoKopers" style="max-width: 150px; margin-top: 15px; border-radius: 8px;" />
          </div>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmail);

    // Send notification email to admin with AutoKopers branding (green)
    const adminEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: ["autofirstklientams@gmail.com"],
      subject: `Nauja užklausa (${safeSource}) - ${safeName}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nauja užklausa</h1>
            <p style="color: #dcfce7; margin: 5px 0 0 0;">Šaltinis: ${safeSource}</p>
          </div>
          <div style="padding: 25px; background-color: #f8f9fa;">
            <h2 style="color: #16a34a; margin-top: 0;">Kliento informacija:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Vardas:</strong></td>
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
              ${amount ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Suma:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${amount} €</td>
              </tr>
              ` : ''}
              ${safeLoanType ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Paskolos tipas:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeLoanType}</td>
              </tr>
              ` : ''}
              ${safeLoanPeriod ? `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Terminas:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${safeLoanPeriod}</td>
              </tr>
              ` : ''}
            </table>
          </div>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmail);

    return new Response(
      JSON.stringify({ success: true, id: insertedData?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-inquiry function:", error);
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
