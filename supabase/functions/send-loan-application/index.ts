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

function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && amount <= 10000000;
}

function isValidTerm(term: number): boolean {
  return !isNaN(term) && term >= 1 && term <= 360; // 1-360 months
}

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

interface LoanApplicationRequest {
  name: string;
  email: string;
  phone: string;
  loanAmount: number;
  loanTerm: number;
  monthlyPayment: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate required fields exist
    const { name, email, phone, loanAmount, loanTerm, monthlyPayment } = body as LoanApplicationRequest;
    
    if (!name || !email || !phone || loanAmount === undefined || loanTerm === undefined || monthlyPayment === undefined) {
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

    // Validate loan amount
    if (!isValidAmount(loanAmount)) {
      return new Response(
        JSON.stringify({ error: "Neteisinga paskolos suma" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate loan term
    if (!isValidTerm(loanTerm)) {
      return new Response(
        JSON.stringify({ error: "Neteisingas paskolos terminas" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize string inputs with length limits
    const sanitizedName = sanitizeString(name, 100);
    const sanitizedMonthlyPayment = typeof monthlyPayment === 'string' ? sanitizeString(monthlyPayment, 50) : String(monthlyPayment);

    // Escape user input to prevent HTML injection
    const safeName = escapeHtml(sanitizedName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMonthlyPayment = escapeHtml(sanitizedMonthlyPayment);

    console.log("Received validated loan application:", { name: safeName, email: safeEmail, loanAmount, loanTerm });

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
      subject: "Jūsų paskolos paraiška gauta - AutoKopers",
      replyTo: "labas@autokopers.lt",
      text: `Labas, ${vocativeName}!\n\nDėkojame už jūsų užklausą ir nekantraujame jums padėti!\n\nGavome jūsų automobilio paskolos paraišką.\n\nSuma: ${loanAmount} €\nTerminas: ${loanTerm} mėn.\nMėnesinė įmoka: ${sanitizedMonthlyPayment} €.\n\nNetrukus susisieksime.\nAutoKopers komanda`,
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
              Gavome jūsų automobilio paskolos paraišką su šiais duomenimis:
            </p>
            <ul style="color: #333; font-size: 16px; line-height: 1.8;">
              <li><strong>Paskolos suma:</strong> ${loanAmount} €</li>
              <li><strong>Terminas:</strong> ${loanTerm} mėn.</li>
              <li><strong>Planuojama mėnesinė įmoka:</strong> ${safeMonthlyPayment} €</li>
            </ul>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Mūsų specialistai susisieks su jumis artimiausiu metu.
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
      subject: `Nauja paskolos paraiška - ${safeName}`,
      replyTo: email,
      text: `Nauja paskolos paraiška. Vardas: ${sanitizedName}. El. paštas: ${email}. Tel.: ${phone}. Suma: ${loanAmount} €. Terminas: ${loanTerm} mėn. Mėnesinė įmoka: ${sanitizedMonthlyPayment} €`,
      html: `
        <h1>Nauja paskolos paraiška</h1>
        <h2>Kliento informacija:</h2>
        <ul>
          <li><strong>Vardas:</strong> ${safeName}</li>
          <li><strong>El. paštas:</strong> ${safeEmail}</li>
          <li><strong>Telefonas:</strong> ${safePhone}</li>
        </ul>
        <h2>Paskolos duomenys:</h2>
        <ul>
          <li><strong>Suma:</strong> ${loanAmount} €</li>
          <li><strong>Terminas:</strong> ${loanTerm} mėn.</li>
          <li><strong>Mėnesinė įmoka:</strong> ${safeMonthlyPayment} €</li>
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
    console.error("Error in send-loan-application function:", error);
    // Surface Resend API error details if available
    const message = error?.message || (typeof error === 'string' ? error : 'Unknown error');
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
