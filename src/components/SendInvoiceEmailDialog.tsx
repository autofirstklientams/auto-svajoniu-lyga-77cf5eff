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
import { Mail, Loader2, Save, X, Star, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SavedEmail {
  id: string;
  email: string;
  name: string | null;
  use_count: number;
  last_used_at: string | null;
}

type SenderEmail = "labas" | "aivaras" | "ziggy";

const SENDER_OPTIONS: { value: SenderEmail; label: string }[] = [
  { value: "labas", label: "labas@autokopers.lt" },
  { value: "aivaras", label: "aivaras@autokopers.lt" },
  { value: "ziggy", label: "ziggy@autokopers.lt" },
];

const SENDER_STORAGE_KEY = "invoice-sender-preference";

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
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState<SenderEmail>(() => {
    const saved = localStorage.getItem(SENDER_STORAGE_KEY);
    return (saved as SenderEmail) || "labas";
  });
  const [sending, setSending] = useState(false);
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSavedEmails();
    }
  }, [open]);

  // Save sender preference when it changes
  useEffect(() => {
    localStorage.setItem(SENDER_STORAGE_KEY, senderEmail);
  }, [senderEmail]);

  const fetchSavedEmails = async () => {
    setLoadingSaved(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_emails")
        .select("id, email, name, use_count, last_used_at")
        .eq("user_id", user.id)
        .order("use_count", { ascending: false })
        .order("last_used_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setSavedEmails(data || []);
    } catch (error) {
      console.error("Error fetching saved emails:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addRecipient = (emailToAdd: string) => {
    const trimmed = emailToAdd.trim().toLowerCase();
    if (!trimmed || !isValidEmail(trimmed)) {
      toast({
        title: "Klaida",
        description: "Įveskite teisingą el. pašto adresą",
        variant: "destructive",
      });
      return false;
    }
    if (recipients.includes(trimmed)) {
      toast({
        title: "Informacija",
        description: "Šis adresas jau pridėtas",
      });
      return false;
    }
    setRecipients(prev => [...prev, trimmed]);
    return true;
  };

  const removeRecipient = (emailToRemove: string) => {
    setRecipients(prev => prev.filter(e => e !== emailToRemove));
  };

  const handleAddFromInput = () => {
    if (addRecipient(emailInput)) {
      setEmailInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFromInput();
    }
  };

  const handleSavedEmailClick = (savedEmail: string) => {
    if (!recipients.includes(savedEmail.toLowerCase())) {
      setRecipients(prev => [...prev, savedEmail.toLowerCase()]);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailInput || !isValidEmail(emailInput)) {
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
          email: emailInput.trim(),
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

  const updateEmailUsage = async (emailAddress: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const savedEmail = savedEmails.find(e => e.email === emailAddress);
      if (savedEmail) {
        await supabase
          .from("saved_emails")
          .update({
            use_count: savedEmail.use_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", savedEmail.id);
      }
    } catch (error) {
      console.error("Error updating email usage:", error);
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast({
        title: "Klaida",
        description: "Pridėkite bent vieną gavėją",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setSendProgress({ current: 0, total: recipients.length });

    try {
      const pdfBase64 = await generatePdfBase64();
      
      if (!pdfBase64) {
        throw new Error("Nepavyko sugeneruoti PDF");
      }

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < recipients.length; i++) {
        const recipientEmail = recipients[i];
        setSendProgress({ current: i + 1, total: recipients.length });

        try {
          const { error } = await supabase.functions.invoke("send-invoice-email", {
            body: {
              recipientEmail,
              invoiceNumber,
              buyerName,
              totalAmount,
              pdfBase64,
              customMessage: customMessage.trim() || null,
              senderEmail,
            },
          });

          if (error) throw error;
          await updateEmailUsage(recipientEmail);
          successCount++;
        } catch (err) {
          console.error(`Failed to send to ${recipientEmail}:`, err);
          failCount++;
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast({
          title: "Išsiųsta!",
          description: recipients.length === 1
            ? `Sąskaita išsiųsta adresu ${recipients[0]}`
            : `Sąskaita išsiųsta ${successCount} gavėjams`,
        });
      } else if (successCount > 0 && failCount > 0) {
        toast({
          title: "Dalinai išsiųsta",
          description: `Išsiųsta: ${successCount}, nepavyko: ${failCount}`,
          variant: "destructive",
        });
      } else {
        throw new Error("Nepavyko išsiųsti nė vienam gavėjui");
      }

      setOpen(false);
      setRecipients([]);
      setEmailInput("");
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
      setSendProgress({ current: 0, total: 0 });
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
                    variant={recipients.includes(saved.email.toLowerCase()) ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1 pr-1"
                  >
                    <span onClick={() => handleSavedEmailClick(saved.email)}>
                      {saved.name ? `${saved.name} (${saved.email})` : saved.email}
                      {saved.use_count > 0 && (
                        <span className="ml-1 text-xs opacity-70">({saved.use_count})</span>
                      )}
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

          {/* Sender email selection */}
          <div className="grid gap-2">
            <Label htmlFor="sender">Siųsti nuo</Label>
            <Select value={senderEmail} onValueChange={(v) => setSenderEmail(v as SenderEmail)} disabled={sending}>
              <SelectTrigger id="sender">
                <SelectValue placeholder="Pasirinkite siuntėjo el. paštą" />
              </SelectTrigger>
              <SelectContent>
                {SENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients list */}
          {recipients.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Gavėjai ({recipients.length})</Label>
              <div className="flex flex-wrap gap-2">
                {recipients.map((r) => (
                  <Badge key={r} variant="outline" className="flex items-center gap-1 pr-1">
                    <Mail className="w-3 h-3" />
                    {r}
                    <button
                      onClick={() => removeRecipient(r)}
                      className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                      disabled={sending}
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
            <Label htmlFor="email">Pridėti gavėją</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="pirkejas@email.lt"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddFromInput}
                disabled={!emailInput || sending}
                title="Pridėti gavėją"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSaveEmail}
                disabled={!emailInput || sending}
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
          <Button onClick={handleSend} disabled={sending || recipients.length === 0} className="btn-gradient">
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {sendProgress.total > 1
                  ? `Siunčiama ${sendProgress.current}/${sendProgress.total}...`
                  : "Siunčiama..."}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Siųsti {recipients.length > 1 ? `(${recipients.length})` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceEmailDialog;
