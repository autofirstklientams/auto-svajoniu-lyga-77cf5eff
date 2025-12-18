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
    const { name, email, phone, carMake, carModel, carYear, mileage, additionalInfo }: CarPurchaseRequest = 
      await req.json();

    // Escape user input to prevent HTML injection
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeCarMake = escapeHtml(carMake);
    const safeCarModel = escapeHtml(carModel);
    const safeCarYear = escapeHtml(carYear);
    const safeMileage = escapeHtml(mileage);
    const safeAdditionalInfo = additionalInfo ? escapeHtml(additionalInfo) : '';

    console.log("Received car purchase request:", { name: safeName, email: safeEmail, phone: safePhone, carMake: safeCarMake, carModel: safeCarModel });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: "AutoKopers <onboarding@resend.dev>",
      to: [email],
      subject: "Jūsų automobilio pardavimo užklausa gauta",
      replyTo: "labas@autokopers.lt",
      text: `Sveiki, ${name}!\n\nGavome jūsų automobilio pardavimo užklausą.\nMarkė: ${carMake}\nModelis: ${carModel}\nMetai: ${carYear}\nRida: ${mileage} km\n${additionalInfo ? `Papildoma informacija: ${additionalInfo}` : ''}\n\nNetrukus susisieksime.\nAutoKopers komanda`,
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
      text: `Nauja užklausa. Vardas: ${name}. El. paštas: ${email}. Tel.: ${phone}. Markė: ${carMake}. Modelis: ${carModel}. Metai: ${carYear}. Rida: ${mileage} km. ${additionalInfo ? `Papildoma informacija: ${additionalInfo}` : ''}`,
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
