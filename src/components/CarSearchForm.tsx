import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const CarSearchForm = () => {
  const { t } = useLanguage();
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

  const formSchema = z.object({
    name: z.string().trim().min(1, t("carSearchForm.errNameRequired")).max(100),
    email: z.string().trim().email(t("carSearchForm.errEmail")).max(255),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{8,15}$/, t("carSearchForm.errPhone")),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = formSchema.safeParse({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-car-search', {
        body: formData
      });

      if (error) throw error;

      toast.success(t("carSearchForm.success"));

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
      toast.error(error.message || t("carSearchForm.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{t("carSearchForm.title")}</CardTitle>
        <CardDescription>
          {t("carSearchForm.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">{t("carSearchForm.make")}</Label>
              <Input
                id="make"
                placeholder={t("carSearchForm.makePlaceholder")}
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="model">{t("carSearchForm.model")}</Label>
              <Input
                id="model"
                placeholder={t("carSearchForm.modelPlaceholder")}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yearFrom">{t("carSearchForm.yearFrom")}</Label>
              <Input
                id="yearFrom"
                type="number"
                placeholder="2018"
                value={formData.yearFrom}
                onChange={(e) => setFormData({ ...formData, yearFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="yearTo">{t("carSearchForm.yearTo")}</Label>
              <Input
                id="yearTo"
                type="number"
                placeholder="2023"
                value={formData.yearTo}
                onChange={(e) => setFormData({ ...formData, yearTo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceFrom">{t("carSearchForm.priceFrom")}</Label>
              <Input
                id="priceFrom"
                type="number"
                placeholder="10000"
                value={formData.priceFrom}
                onChange={(e) => setFormData({ ...formData, priceFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="priceTo">{t("carSearchForm.priceTo")}</Label>
              <Input
                id="priceTo"
                type="number"
                placeholder="30000"
                value={formData.priceTo}
                onChange={(e) => setFormData({ ...formData, priceTo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuelType">{t("carSearchForm.fuelType")}</Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
              >
                <SelectTrigger id="fuelType">
                  <SelectValue placeholder={t("carSearchForm.fuelPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Benzinas">{t("carSearchForm.fuelGasoline")}</SelectItem>
                  <SelectItem value="Dyzelinas">{t("carSearchForm.fuelDiesel")}</SelectItem>
                  <SelectItem value="Elektra">{t("carSearchForm.fuelElectric")}</SelectItem>
                  <SelectItem value="Hibridas">{t("carSearchForm.fuelHybrid")}</SelectItem>
                  <SelectItem value="Dujos">{t("carSearchForm.fuelGas")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transmission">{t("carSearchForm.transmission")}</Label>
              <Select
                value={formData.transmission}
                onValueChange={(value) => setFormData({ ...formData, transmission: value })}
              >
                <SelectTrigger id="transmission">
                  <SelectValue placeholder={t("carSearchForm.transmissionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechaninė">{t("carSearchForm.transManual")}</SelectItem>
                  <SelectItem value="Automatinė">{t("carSearchForm.transAuto")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="additionalInfo">{t("carSearchForm.additionalInfo")}</Label>
            <Textarea
              id="additionalInfo"
              placeholder={t("carSearchForm.additionalInfoPlaceholder")}
              rows={4}
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">{t("carSearchForm.contactDetails")}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">{t("carSearchForm.name")}</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">{t("carSearchForm.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("carSearchForm.phone")}</Label>
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
            {isSubmitting ? t("carSearchForm.submitting") : t("carSearchForm.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CarSearchForm;
