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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #e4e4e7;">
                      <img src="https://www.autokopers.lt/logo-email.png" alt="Auto Kopers" style="max-width: 180px; height: auto; display: block;" />
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 40px;">
                      <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #18181b;">
                        PVM Sąskaita faktūra
                      </h1>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                        Sveiki, <strong>${buyerName}</strong>!
                      </p>
                      
                      <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                        Siunčiame jums PVM sąskaitą faktūrą. Dokumentas pridėtas kaip PDF failas.
                      </p>
                      
                      <!-- Invoice Details Box -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafafa; border-radius: 8px; border: 1px solid #e4e4e7; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding-bottom: 12px;">
                                  <span style="font-size: 13px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Sąskaitos numeris</span>
                                  <div style="font-size: 18px; font-weight: 600; color: #18181b; margin-top: 4px;">${invoiceNumber}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <span style="font-size: 13px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Bendra suma</span>
                                  <div style="font-size: 24px; font-weight: 700; color: #16a34a; margin-top: 4px;">${totalAmount.toFixed(2)} €</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      ${customMessage ? `
                      <!-- Custom Message -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e; white-space: pre-line;">${customMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <p style="margin: 0; font-size: 14px; color: #71717a;">
                        📎 Sąskaita faktūra pridėta kaip PDF failas prie šio laiško.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px 32px 40px; background-color: #18181b; border-radius: 0 0 12px 12px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                              Auto Kopers
                            </p>
                            <p style="margin: 0 0 4px 0; font-size: 14px; color: #a1a1aa;">
                              📧 ${senderEmail}@autokopers.lt
                            </p>
                            <p style="margin: 0 0 4px 0; font-size: 14px; color: #a1a1aa;">
                              📞 +370 628 51439
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                              🌐 www.autokopers.lt
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
                
                <!-- Bottom Text -->
                <p style="margin: 24px 0 0 0; font-size: 12px; color: #71717a; text-align: center;">
                  Šis laiškas sugeneruotas automatiškai. Jei turite klausimų, susisiekite su mumis.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
