import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SendInvoiceEmailDialogProps {
  invoiceNumber: string;
  buyerName: string;
  totalAmount: number;
  generatePdfBase64: () => Promise<string | null>;
}

const SendInvoiceEmailDialog = ({
  invoiceNumber,
  buyerName,
  totalAmount,
  generatePdfBase64,
}: SendInvoiceEmailDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Klaida",
        description: "Įveskite teisingą el. pašto adresą",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      // Generate PDF as base64
      const pdfBase64 = await generatePdfBase64();
      
      if (!pdfBase64) {
        throw new Error("Nepavyko sugeneruoti PDF");
      }

      // Send email via edge function
      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          recipientEmail: email,
          invoiceNumber,
          buyerName,
          totalAmount,
          pdfBase64,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Išsiųsta!",
        description: `Sąskaita išsiųsta adresu ${email}`,
      });

      setOpen(false);
      setEmail("");
    } catch (error: any) {
      console.error("Error sending invoice email:", error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsiųsti sąskaitos",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Siųsti el. paštu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Siųsti sąskaitą el. paštu</DialogTitle>
          <DialogDescription>
            Sąskaita Nr. {invoiceNumber} bus išsiųsta su PDF priedu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">El. pašto adresas</Label>
            <Input
              id="email"
              type="email"
              placeholder="pirkejas@email.lt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>Pirkėjas:</strong> {buyerName}</p>
            <p><strong>Suma:</strong> {totalAmount.toFixed(2)}€</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Atšaukti
          </Button>
          <Button onClick={handleSend} disabled={sending} className="btn-gradient">
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Siunčiama...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Siųsti
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceEmailDialog;
