import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const { name, email, phone, loanAmount, loanTerm, monthlyPayment }: LoanApplicationRequest = 
      await req.json();

    console.log("Received loan application:", { name, email, phone, loanAmount, loanTerm });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: [email],
      subject: "Jūsų paskolos paraiška gauta",
      replyTo: "labas@autokopers.lt",
      text: `Sveiki, ${name}!\n\nGavome jūsų automobilio paskolos paraišką.\n\nSuma: ${loanAmount} €\nTerminas: ${loanTerm} mėn.\nMėnesinė įmoka: ${monthlyPayment} €.\n\nNetrukus susisieksime.\nAutoKopers komanda`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Sveiki, ${name}!</h1>
          <p>Gavome jūsų automobilio paskolos paraišką su šiais duomenimis:</p>
          <ul>
            <li><strong>Paskolos suma:</strong> ${loanAmount} €</li>
            <li><strong>Terminas:</strong> ${loanTerm} mėn.</li>
            <li><strong>Planuojama mėnesinė įmoka:</strong> ${monthlyPayment} €</li>
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
      subject: `Nauja paskolos paraiška - ${name}`,
      replyTo: email,
      text: `Nauja paskolos paraiška. Vardas: ${name}. El. paštas: ${email}. Tel.: ${phone}. Suma: ${loanAmount} €. Terminas: ${loanTerm} mėn. Mėnesinė įmoka: ${monthlyPayment} €`,
      html: `
        <h1>Nauja paskolos paraiška</h1>
        <h2>Kliento informacija:</h2>
        <ul>
          <li><strong>Vardas:</strong> ${name}</li>
          <li><strong>El. paštas:</strong> ${email}</li>
          <li><strong>Telefonas:</strong> ${phone}</li>
        </ul>
        <h2>Paskolos duomenys:</h2>
        <ul>
          <li><strong>Suma:</strong> ${loanAmount} €</li>
          <li><strong>Terminas:</strong> ${loanTerm} mėn.</li>
          <li><strong>Mėnesinė įmoka:</strong> ${monthlyPayment} €</li>
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
