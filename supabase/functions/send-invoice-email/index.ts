import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  recipientEmail: string;
  invoiceNumber: string;
  buyerName: string;
  totalAmount: number;
  pdfBase64: string;
  customMessage?: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, invoiceNumber, buyerName, totalAmount, pdfBase64, customMessage }: InvoiceEmailRequest = await req.json();

    console.log("Sending invoice email to:", recipientEmail);
    console.log("Invoice number:", invoiceNumber);
    if (customMessage) {
      console.log("Custom message included");
    }

    // Convert base64 to buffer for attachment
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    // Build custom message HTML if provided
    const customMessageHtml = customMessage 
      ? `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #333; white-space: pre-line;">${customMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>`
      : '';

    const emailResponse = await resend.emails.send({
      from: "Auto Kopers <info@autokopers.lt>",
      to: [recipientEmail],
      subject: `PVM Sąskaita faktūra Nr. ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://vjdzzaerrxfctkkiwkmn.supabase.co/storage/v1/object/public/car-images/logo-email.png" alt="Auto Kopers" style="height: 50px; margin-bottom: 20px;" />
          
          <h2 style="color: #333;">PVM Sąskaita faktūra Nr. ${invoiceNumber}</h2>
          
          <p>Sveiki, ${buyerName}!</p>
          
          <p>Siunčiame jums PVM sąskaitą faktūrą Nr. <strong>${invoiceNumber}</strong>.</p>
          
          <p><strong>Suma:</strong> ${totalAmount.toFixed(2)}€</p>
          
          ${customMessageHtml}
          
          <p>Sąskaita faktūra pridėta kaip PDF failas.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #666; font-size: 14px;">
            Pagarbiai,<br/>
            <strong>Auto Kopers</strong><br/>
            El. paštas: info@autokopers.lt<br/>
            Telefonas: +370 600 00000
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Saskaita-${invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
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
