import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  name: z.string().trim().min(1, "Vardas privalomas").max(100, "Per ilgas vardas"),
  email: z.string().trim().email("Neteisingas el. pašto formatas").max(255, "Per ilgas el. paštas"),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,15}$/, "Neteisingas telefono numerio formatas"),
});

interface LoanApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanAmount?: number;
  loanTerm?: number;
  monthlyPayment?: number;
  carInfo?: string;
}

const LoanApplicationForm = ({
  open,
  onOpenChange,
  loanAmount = 10000,
  loanTerm = 60,
  monthlyPayment,
  carInfo,
}: LoanApplicationFormProps) => {
  const { t } = useLanguage();
  // Calculate monthly payment if not provided
  const annualInterestRate = 0.069;
  const monthlyAdminFee = 9.5;
  const monthlyRate = annualInterestRate / 12;
  const calculatedMonthlyPayment = monthlyPayment ?? (
    loanAmount > 0 
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
        (Math.pow(1 + monthlyRate, loanTerm) - 1) + monthlyAdminFee
      : 0
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = formSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-inquiry', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: loanAmount,
          loanType: carInfo ? 'lizingas' : 'paskola',
          loanPeriod: `${loanTerm} mėn.`,
          source: 'autokopers',
        },
      });

      if (error) throw error;

      toast.success(t("loanApp.success"), {
        description: t("loanApp.successDesc")
      });
      
      setFormData({ name: "", email: "", phone: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(t("loanApp.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t("loanApp.title")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("loanApp.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("loanApp.namePlaceholder")}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t("loanApp.email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t("loanApp.emailPlaceholder")}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t("loanApp.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t("loanApp.phonePlaceholder")}
              required
            />
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm text-foreground">{t("loanApp.leasingData")}</h4>
            <div className="text-sm space-y-1">
              {carInfo && (
                <p className="flex justify-between">
                  <span className="text-muted-foreground">{t("loanApp.car")}</span>
                  <span className="font-medium text-foreground">{carInfo}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span className="text-muted-foreground">{t("loanApp.amount")}</span>
                <span className="font-medium text-foreground">{loanAmount.toLocaleString()} €</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">{t("loanApp.term")}</span>
                <span className="font-medium text-foreground">{loanTerm} {t("loanCalc.months")}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">{t("loanApp.monthlyPayment")}</span>
                <span className="font-medium text-primary">{calculatedMonthlyPayment.toFixed(2)} €</span>
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("loanApp.submitting") : t("loanApp.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanApplicationForm;