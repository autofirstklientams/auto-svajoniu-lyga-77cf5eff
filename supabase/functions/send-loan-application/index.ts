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
      html: `
        <h1>Sveiki, ${name}!</h1>
        <p>Gavome jūsų automobilio paskolos paraišką su šiais duomenimis:</p>
        <ul>
          <li><strong>Paskolos suma:</strong> ${loanAmount} €</li>
          <li><strong>Terminas:</strong> ${loanTerm} mėn.</li>
          <li><strong>Planuojama mėnesinė įmoka:</strong> ${monthlyPayment} €</li>
        </ul>
        <p>Mūsų specialistai susisieks su jumis artimiausiu metu el. paštu <strong>${email}</strong> arba telefonu <strong>${phone}</strong>.</p>
        <p>Geros dienos,<br>AutoKopers komanda</p>
      `,
    });

    console.log("Customer email sent:", customerEmail);

    // Send notification email to admin
    const adminEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: ["autofirstklientams@gmail.com"],
      subject: `Nauja paskolos paraiška - ${name}`,
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
