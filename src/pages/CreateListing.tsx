import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/autokopers-logo.jpeg";

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
            <div className="flex items-center">
              <img src={logo} alt="AutoKOPERS" className="h-10" />
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
                  <Label htmlFor="make">Automobilio markė</Label>
                  <Input
                    id="make"
                    placeholder="pvz. BMW, Audi, Mercedes-Benz"
                    required
                    minLength={2}
                    maxLength={50}
                    aria-label="Įveskite automobilio markę"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Automobilio modelis</Label>
                  <Input
                    id="model"
                    placeholder="pvz. X5, A6, E-Class"
                    required
                    minLength={1}
                    maxLength={50}
                    aria-label="Įveskite automobilio modelį"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Pagaminimo metai</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="pvz. 2022"
                    required
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    aria-label="Įveskite automobilio pagaminimo metus"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">Rida (kilometrais)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="pvz. 35000"
                    required
                    min={0}
                    max={999999}
                    aria-label="Įveskite automobilio ridą kilometrais"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Pardavimo kaina (eurais)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="pvz. 42990"
                    required
                    min={100}
                    max={999999}
                    aria-label="Įveskite automobilio kainą eurais"
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
                <Label htmlFor="description">Detalus automobilio aprašymas</Label>
                <Textarea
                  id="description"
                  placeholder="Aprašykite automobilio būklę, komplektaciją, papildomą įrangą, priežiūros istoriją ir kitus svarbius aspektus, kurie padės pirkėjui priimti sprendimą..."
                  rows={6}
                  required
                  minLength={50}
                  maxLength={2000}
                  aria-label="Įveskite išsamų automobilio aprašymą (mažiausiai 50 simbolių)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">Automobilio nuotraukos</Label>
                <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-background">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-foreground mb-2 font-medium">
                    Įkelkite automobilio nuotraukas
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    Spustelėkite čia arba nuvilkite failus
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Palaikomi formatai: PNG, JPG, JPEG (maks. 10MB kiekviena)
                  </p>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    aria-label="Pasirinkite automobilio nuotraukas"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Kuriamas skelbimas..." : "Paskelbti automobilį"}
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
