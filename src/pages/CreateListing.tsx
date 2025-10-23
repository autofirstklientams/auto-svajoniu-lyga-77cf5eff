import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const carSchema = z.object({
  make: z.string().trim().min(1, "Markė privaloma"),
  model: z.string().trim().min(1, "Modelis privalomas"),
  year: z.number().min(1900, "Neteisingi metai").max(new Date().getFullYear() + 1),
  price: z.number().min(0, "Kaina negali būti neigiama"),
  mileage: z.number().min(0).optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url("Neteisingas nuotraukos URL").optional().or(z.literal("")),
});

interface CreateListingProps {
  car?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateListing = ({ car, onClose, onSuccess }: CreateListingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
    price: car?.price || 0,
    mileage: car?.mileage || 0,
    fuel_type: car?.fuel_type || "",
    transmission: car?.transmission || "",
    description: car?.description || "",
    image_url: car?.image_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = carSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vartotojas neprisijungęs");

      const carData = {
        ...formData,
        partner_id: user.id,
        image_url: formData.image_url || null,
        mileage: formData.mileage || null,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        description: formData.description || null,
      };

      if (car) {
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", car.id);
        if (error) throw error;
        toast.success("Skelbimas atnaujintas!");
      } else {
        const { error } = await supabase.from("cars").insert(carData);
        if (error) throw error;
        toast.success("Skelbimas sukurtas!");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Klaida saugant skelbimą");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{car ? "Redaguoti skelbimą" : "Naujas skelbimas"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Markė *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelis *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Metai *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Kaina (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Rida (km)</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_type">Kuro tipas</Label>
              <Select
                value={formData.fuel_type}
                onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pasirinkite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Benzinas">Benzinas</SelectItem>
                  <SelectItem value="Dyzelis">Dyzelis</SelectItem>
                  <SelectItem value="Elektra">Elektra</SelectItem>
                  <SelectItem value="Hibridinis">Hibridinis</SelectItem>
                  <SelectItem value="Dujos">Dujos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transmission">Pavarų dėžė</Label>
              <Select
                value={formData.transmission}
                onValueChange={(value) => setFormData({ ...formData, transmission: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pasirinkite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechaninė">Mechaninė</SelectItem>
                  <SelectItem value="Automatinė">Automatinė</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Nuotraukos URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Aprašymas</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saugoma..." : car ? "Atnaujinti" : "Sukurti"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Atšaukti
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateListing;
