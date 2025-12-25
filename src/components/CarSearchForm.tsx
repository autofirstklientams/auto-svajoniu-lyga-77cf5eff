import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CarSearchForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    priceFrom: "",
    priceTo: "",
    fuelType: "",
    transmission: "",
    additionalInfo: "",
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-car-search', {
        body: formData
      });

      if (error) throw error;

      toast.success("Užklausa išsiųsta! Susisieksime su jumis artimiausiu metu.");
      
      // Reset form
      setFormData({
        make: "",
        model: "",
        yearFrom: "",
        yearTo: "",
        priceFrom: "",
        priceTo: "",
        fuelType: "",
        transmission: "",
        additionalInfo: "",
        name: "",
        email: "",
        phone: "",
      });
    } catch (error: any) {
      console.error("Error submitting car search:", error);
      toast.error(error.message || "Nepavyko išsiųsti užklausos. Bandykite dar kartą.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Automobilio paieškos užklausa</CardTitle>
        <CardDescription>
          Užpildykite formą ir mes ieškosime jums tinkamo automobilio visoje Europoje
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Gamintojas</Label>
              <Input
                id="make"
                placeholder="pvz. BMW, Audi, Mercedes"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="model">Modelis</Label>
              <Input
                id="model"
                placeholder="pvz. X5, A6, E-Class"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yearFrom">Metai nuo</Label>
              <Input
                id="yearFrom"
                type="number"
                placeholder="pvz. 2018"
                value={formData.yearFrom}
                onChange={(e) => setFormData({ ...formData, yearFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="yearTo">Metai iki</Label>
              <Input
                id="yearTo"
                type="number"
                placeholder="pvz. 2023"
                value={formData.yearTo}
                onChange={(e) => setFormData({ ...formData, yearTo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceFrom">Kaina nuo (€)</Label>
              <Input
                id="priceFrom"
                type="number"
                placeholder="pvz. 10000"
                value={formData.priceFrom}
                onChange={(e) => setFormData({ ...formData, priceFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="priceTo">Kaina iki (€)</Label>
              <Input
                id="priceTo"
                type="number"
                placeholder="pvz. 30000"
                value={formData.priceTo}
                onChange={(e) => setFormData({ ...formData, priceTo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuelType">Kuro tipas</Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
              >
                <SelectTrigger id="fuelType">
                  <SelectValue placeholder="Pasirinkite kuro tipą" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Benzinas">Benzinas</SelectItem>
                  <SelectItem value="Dyzelinas">Dyzelinas</SelectItem>
                  <SelectItem value="Elektra">Elektra</SelectItem>
                  <SelectItem value="Hibridas">Hibridas</SelectItem>
                  <SelectItem value="Dujos">Dujos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transmission">Pavarų dėžė</Label>
              <Select
                value={formData.transmission}
                onValueChange={(value) => setFormData({ ...formData, transmission: value })}
              >
                <SelectTrigger id="transmission">
                  <SelectValue placeholder="Pasirinkite pavarų dėžę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechaninė">Mechaninė</SelectItem>
                  <SelectItem value="Automatinė">Automatinė</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="additionalInfo">Papildoma informacija</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Nurodykite papildomus pageidavimus (spalva, įranga, rida ir t.t.)"
              rows={4}
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Jūsų kontaktiniai duomenys</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Vardas, pavardė *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">El. paštas *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefonas *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Siunčiama..." : "Pateikti užklausą"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CarSearchForm;
