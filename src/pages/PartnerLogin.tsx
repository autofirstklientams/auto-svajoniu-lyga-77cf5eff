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
                    <Label htmlFor="email">El. paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jusu@pastas.lt"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Slaptažodis</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
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
                      placeholder="UAB Automobiliai"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">El. paštas</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="jusu@pastas.lt"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Slaptažodis</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonas</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+370 600 00000"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Kuriama..." : "Sukurti paskyrą"}
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
