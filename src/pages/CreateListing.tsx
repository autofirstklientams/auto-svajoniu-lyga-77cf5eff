import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";

const CreateListing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("partner_logged_in");
    if (!isLoggedIn) {
      navigate("/partner-login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      toast.success("Skelbimas sėkmingai sukurtas!");
      navigate("/partner-dashboard");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">AutoFinance</span>
              <span className="text-2xl font-bold text-accent">LT</span>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/partner-dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Grįžti į skydelį
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Naujas skelbimas</h1>
          <p className="text-xl text-muted-foreground">
            Užpildykite automobilio informaciją
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Automobilio duomenys</CardTitle>
            <CardDescription>
              Visi laukai yra privalomi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Markė</Label>
                  <Input
                    id="make"
                    placeholder="BMW"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modelis</Label>
                  <Input
                    id="model"
                    placeholder="X5"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Metai</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2022"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">Rida (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="35000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Kaina (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="42990"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuel">Kuro tipas</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pasirinkite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="benzinas">Benzinas</SelectItem>
                      <SelectItem value="dyzelinas">Dyzelinas</SelectItem>
                      <SelectItem value="elektra">Elektra</SelectItem>
                      <SelectItem value="hibridas">Hibridas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission">Pavarų dėžė</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pasirinkite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatine">Automatinė</SelectItem>
                      <SelectItem value="mechanine">Mechaninė</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Aprašymas</Label>
                <Textarea
                  id="description"
                  placeholder="Detalus automobilio aprašymas, komplektacija, būklė..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">Nuotraukos</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Spustelėkite arba nuvilkite nuotraukas čia
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG iki 10MB
                  </p>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Kuriama..." : "Sukurti skelbimą"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/partner-dashboard")}
                  disabled={isLoading}
                >
                  Atšaukti
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateListing;
