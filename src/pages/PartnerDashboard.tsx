import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/autokopers-logo.jpeg";

// Mock duomenys
const mockListings = [
  {
    id: 1,
    title: "BMW X5 M Sport",
    price: "42,990 €",
    status: "Aktyvus",
    views: 245,
  },
  {
    id: 2,
    title: "Audi A6 Quattro",
    price: "35,500 €",
    status: "Aktyvus",
    views: 189,
  },
];

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState(mockListings);

  useEffect(() => {
    // Patikrinti ar prisijungęs
    const isLoggedIn = localStorage.getItem("partner_logged_in");
    if (!isLoggedIn) {
      navigate("/partner-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("partner_logged_in");
    toast.success("Atsijungėte");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <img src={logo} alt="AutoKOPERS" className="h-10" />
              <span className="ml-4 text-sm text-muted-foreground">Partnerio zona</span>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Atsijungti
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Partnerio skydelis</h1>
          <p className="text-xl text-muted-foreground">
            Valdykite savo skelbimus ir peržiūrėkite statistiką
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Aktyvūs skelbimai</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{listings.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Iš viso peržiūrų</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">
                {listings.reduce((sum, l) => sum + l.views, 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Užklausos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">12</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Mano skelbimai</h2>
          <Button
            onClick={() => navigate("/create-listing")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Pridėti skelbimą
          </Button>
        </div>

        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">
                      {listing.title}
                    </h3>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {listing.price}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Statusas: {listing.status}</span>
                      <span>Peržiūros: {listing.views}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Redaguoti
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      Ištrinti
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboard;
