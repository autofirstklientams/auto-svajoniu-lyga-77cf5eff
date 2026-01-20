import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Available sender emails
const SENDER_EMAILS: Record<string, string> = {
  labas: "Auto Kopers <labas@autokopers.lt>",
  aivaras: "Auto Kopers <aivaras@autokopers.lt>",
  ziggy: "Auto Kopers <ziggy@autokopers.lt>",
};

interface InvoiceEmailRequest {
  recipientEmail: string;
  invoiceNumber: string;
  buyerName: string;
  totalAmount: number;
  pdfBase64: string;
  customMessage?: string | null;
  senderEmail?: "labas" | "aivaras" | "ziggy";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipientEmail, 
      invoiceNumber, 
      buyerName, 
      totalAmount, 
      pdfBase64, 
      customMessage,
      senderEmail = "labas"
    }: InvoiceEmailRequest = await req.json();

    console.log("Sending invoice email to:", recipientEmail);
    console.log("Invoice number:", invoiceNumber);
    console.log("Sender email:", senderEmail);
    console.log("PDF base64 length:", pdfBase64?.length || 0);
    if (customMessage) {
      console.log("Custom message included");
    }

    // Validate PDF base64
    if (!pdfBase64 || pdfBase64.length === 0) {
      throw new Error("PDF base64 is empty or missing");
    }

    // Get sender email
    const fromEmail = SENDER_EMAILS[senderEmail] || SENDER_EMAILS.labas;

    // Build custom message HTML if provided
    const customMessageHtml = customMessage 
      ? `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #333; white-space: pre-line;">${customMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>`
      : '';

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: `PVM Sąskaita faktūra Nr. ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://www.autokopers.lt/logo-email.png" alt="Auto Kopers" style="max-width: 220px; height: auto; margin-bottom: 20px;" />
          
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
            El. paštas: ${senderEmail}@autokopers.lt<br/>
            Telefonas: +370 628 51439
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Saskaita-${invoiceNumber}.pdf`,
          content: pdfBase64,
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
