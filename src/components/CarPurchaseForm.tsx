import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().trim().min(1, "Vardas privalomas").max(100, "Per ilgas vardas"),
  email: z.string().trim().email("Neteisingas el. pašto formatas").max(255, "Per ilgas el. paštas"),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,15}$/, "Neteisingas telefono numerio formatas"),
  carMake: z.string().trim().min(1, "Automobilio markė privaloma").max(50, "Per ilga markė"),
  carModel: z.string().trim().min(1, "Automobilio modelis privalomas").max(50, "Per ilgas modelis"),
  carYear: z.string().trim().regex(/^\d{4}$/, "Metai turi būti keturių skaitmenų formatu (pvz., 2015)"),
  mileage: z.string().trim().regex(/^\d+$/, "Rida turi būti skaičius"),
  additionalInfo: z.string().trim().max(500, "Per ilgas papildomas aprašymas").optional(),
});

interface CarPurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CarPurchaseForm = ({ open, onOpenChange }: CarPurchaseFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    carMake: "",
    carModel: "",
    carYear: "",
    mileage: "",
    additionalInfo: "",
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
      const { error } = await supabase.functions.invoke('send-car-purchase', {
        body: formData,
      });

      if (error) throw error;

      toast.success("Užklausa pateikta!", {
        description: "Netrukus susisieksime su jumis dėl automobilio įvertinimo."
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        carMake: "",
        carModel: "",
        carYear: "",
        mileage: "",
        additionalInfo: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting car purchase request:", error);
      toast.error("Klaida pateikiant užklausą. Bandykite dar kartą.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Automobilio pardavimo užklausa
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vardas, Pavardė *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Vardenis Pavardenis"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">El. paštas *</Label>
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
            <Label htmlFor="phone">Telefonas *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+370 600 00000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carMake">Markė *</Label>
              <Input
                id="carMake"
                value={formData.carMake}
                onChange={(e) => setFormData({ ...formData, carMake: e.target.value })}
                placeholder="BMW"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="carModel">Modelis *</Label>
              <Input
                id="carModel"
                value={formData.carModel}
                onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                placeholder="X5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carYear">Metai *</Label>
              <Input
                id="carYear"
                value={formData.carYear}
                onChange={(e) => setFormData({ ...formData, carYear: e.target.value })}
                placeholder="2015"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage">Rida (km) *</Label>
              <Input
                id="mileage"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                placeholder="150000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Papildoma informacija</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Būklė, defektai, papildoma įranga..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Siunčiama..." : "Pateikti užklausą"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CarPurchaseForm;
