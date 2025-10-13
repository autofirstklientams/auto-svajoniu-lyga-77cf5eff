import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/autokopers-logo.jpeg";

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock prisijungimas
    setTimeout(() => {
      localStorage.setItem("partner_logged_in", "true");
      toast.success("Sėkmingai prisijungėte!");
      navigate("/partner-dashboard");
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock registracija
    setTimeout(() => {
      toast.success("Paskyra sukurta! Galite prisijungti.");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Grįžti į pagrindinį
          </Button>
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="AutoKOPERS" className="h-12" />
          </div>
          <p className="text-muted-foreground">Partnerių Prisijungimas</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Prisijungti</TabsTrigger>
            <TabsTrigger value="signup">Registruotis</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Prisijungti</CardTitle>
                <CardDescription>
                  Įveskite savo duomenis prisijungimui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Elektroninis paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vardas.pavarde@jusuimonė.lt"
                      required
                      aria-label="Įveskite savo elektroninį paštą"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Slaptažodis</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mažiausiai 8 simboliai"
                      required
                      minLength={8}
                      aria-label="Įveskite savo slaptažodį"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Jungiamasi..." : "Prisijungti"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Registruotis</CardTitle>
                <CardDescription>
                  Sukurkite naują partnerio paskyrą
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Įmonės pavadinimas</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="pvz. UAB Auto prekybos centras"
                      required
                      minLength={3}
                      maxLength={100}
                      aria-label="Įveskite savo įmonės oficialų pavadinimą"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Elektroninis paštas</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="kontaktai@jusuimonė.lt"
                      required
                      aria-label="Įveskite įmonės elektroninį paštą"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Slaptažodis</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mažiausiai 8 simboliai"
                      required
                      minLength={8}
                      aria-label="Sukurkite saugų slaptažodį (mažiausiai 8 simboliai)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Kontaktinis telefonas</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+370 600 12345"
                      required
                      pattern="[+]?[0-9\s\-()]+"
                      aria-label="Įveskite kontaktinį telefono numerį"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Kuriama paskyra..." : "Sukurti partnerio paskyrą"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerLogin;
