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

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: [email],
      subject: "Jūsų paskolos paraiška gauta",
      replyTo: "labas@autokopers.lt",
      text: `Sveiki, ${sanitizedName}!\n\nGavome jūsų automobilio paskolos paraišką.\n\nSuma: ${loanAmount} €\nTerminas: ${loanTerm} mėn.\nMėnesinė įmoka: ${sanitizedMonthlyPayment} €.\n\nNetrukus susisieksime.\nAutoKopers komanda`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Sveiki, ${safeName}!</h1>
          <p>Gavome jūsų automobilio paskolos paraišką su šiais duomenimis:</p>
          <ul>
            <li><strong>Paskolos suma:</strong> ${loanAmount} €</li>
            <li><strong>Terminas:</strong> ${loanTerm} mėn.</li>
            <li><strong>Planuojama mėnesinė įmoka:</strong> ${safeMonthlyPayment} €</li>
          </ul>
          <p>Mūsų specialistai susisieks su jumis artimiausiu metu el. paštu <strong>labas@autokopers.lt</strong> arba telefonu <strong>+370 628 51439</strong>.</p>
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
