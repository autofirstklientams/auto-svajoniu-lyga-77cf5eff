import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LoanApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanAmount: number;
  loanTerm: number;
  monthlyPayment: number;
}

const LoanApplicationForm = ({
  open,
  onOpenChange,
  loanAmount,
  loanTerm,
  monthlyPayment,
}: LoanApplicationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Prašome užpildyti visus laukus");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-loan-application', {
        body: {
          ...formData,
          loanAmount,
          loanTerm,
          monthlyPayment: monthlyPayment.toFixed(2),
        },
      });

      if (error) throw error;

      toast.success("Paraiška pateikta!", {
        description: "Netrukus susisieksime su jumis el. paštu arba telefonu."
      });
      
      setFormData({ name: "", email: "", phone: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Klaida pateikiant paraišką. Bandykite dar kartą.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Paskolos paraiška
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vardas, Pavardė</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Vardenis Pavardenis"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">El. paštas</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="vardas@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonas</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+370 600 00000"
              required
            />
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm text-foreground">Paskolos duomenys:</h4>
            <div className="text-sm space-y-1">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Suma:</span>
                <span className="font-medium text-foreground">{loanAmount} €</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Terminas:</span>
                <span className="font-medium text-foreground">{loanTerm} mėn.</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Mėn. įmoka:</span>
                <span className="font-medium text-primary">{monthlyPayment.toFixed(2)} €</span>
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Siunčiama..." : "Pateikti paraišką"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanApplicationForm;
