import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2, Save, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface SavedEmail {
  id: string;
  email: string;
  name: string | null;
}

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
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const { toast } = useToast();

  // Fetch saved emails when dialog opens
  useEffect(() => {
    if (open) {
      fetchSavedEmails();
    }
  }, [open]);

  const fetchSavedEmails = async () => {
    setLoadingSaved(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_emails")
        .select("id, email, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedEmails(data || []);
    } catch (error) {
      console.error("Error fetching saved emails:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Klaida",
        description: "Įveskite teisingą el. pašto adresą",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Klaida",
          description: "Turite būti prisijungęs",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("saved_emails")
        .insert({
          user_id: user.id,
          email: email.trim(),
          name: buyerName || null,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Informacija",
            description: "Šis el. paštas jau išsaugotas",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Išsaugota!",
          description: "El. pašto adresas išsaugotas",
        });
        fetchSavedEmails();
      }
    } catch (error: any) {
      console.error("Error saving email:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko išsaugoti el. pašto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSavedEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_emails")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setSavedEmails(savedEmails.filter(e => e.id !== id));
      toast({
        title: "Ištrinta",
        description: "El. pašto adresas pašalintas",
      });
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

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
      const pdfBase64 = await generatePdfBase64();
      
      if (!pdfBase64) {
        throw new Error("Nepavyko sugeneruoti PDF");
      }

      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          recipientEmail: email.trim(),
          invoiceNumber,
          buyerName,
          totalAmount,
          pdfBase64,
          customMessage: customMessage.trim() || null,
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
      setCustomMessage("");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Siųsti sąskaitą el. paštu</DialogTitle>
          <DialogDescription>
            Sąskaita Nr. {invoiceNumber} bus išsiųsta su PDF priedu.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Saved emails */}
          {savedEmails.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3" />
                Išsaugoti adresai
              </Label>
              <div className="flex flex-wrap gap-2">
                {savedEmails.map((saved) => (
                  <Badge
                    key={saved.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1 pr-1"
                  >
                    <span onClick={() => setEmail(saved.email)}>
                      {saved.name ? `${saved.name} (${saved.email})` : saved.email}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSavedEmail(saved.id);
                      }}
                      className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="grid gap-2">
            <Label htmlFor="email">El. pašto adresas</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="pirkejas@email.lt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSaveEmail}
                disabled={!email || sending}
                title="Išsaugoti el. paštą"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Custom message */}
          <div className="grid gap-2">
            <Label htmlFor="message">Papildoma žinutė (neprivaloma)</Label>
            <Textarea
              id="message"
              placeholder="Čia galite parašyti papildomą žinutę gavėjui..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={sending}
              rows={3}
            />
          </div>

          {/* Invoice info */}
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
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
