import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import CreateListing from "./CreateListing";
import { Pencil, Trash2, LogOut, Copy, Globe, ExternalLink } from "lucide-react";
import logo from "@/assets/autokopers-logo.jpeg";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  description: string | null;
  image_url: string | null;
  body_type: string | null;
  engine_capacity: number | null;
  power_kw: number | null;
  doors: number | null;
  seats: number | null;
  color: string | null;
  steering_wheel: string | null;
  condition: string | null;
  vin: string | null;
  defects: string | null;
  features: any;
  visible_web: boolean;
  visible_autoplius: boolean;
}

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/partner-login");
        } else {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session) {
        navigate("/partner-login");
      } else {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const hasAdminRole = roles?.some(r => r.role === "admin");
      setIsAdmin(hasAdminRole || false);
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCars();
    }
  }, [user]);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("partner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error: any) {
      toast.error("Klaida užkraunant skelbimus");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį skelbimą?")) return;

    try {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Skelbimas ištrintas");
      fetchCars();
    } catch (error: any) {
      toast.error("Klaida trinant skelbimą");
    }
  };

  const handleDuplicate = async (car: Car) => {
    try {
      const { id, ...carData } = car;
      const { data: newCar, error } = await supabase
        .from("cars")
        .insert({
          ...carData,
          partner_id: user?.id,
          visible_web: false,
          visible_autoplius: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Copy images
      const { data: images } = await supabase
        .from("car_images")
        .select("*")
        .eq("car_id", car.id);

      if (images && images.length > 0) {
        const newImages = images.map(img => ({
          car_id: newCar.id,
          image_url: img.image_url,
          display_order: img.display_order,
        }));

        await supabase.from("car_images").insert(newImages);
      }

      toast.success("Skelbimas nukopijuotas! Redaguokite ir pasirinkite kur publikuoti.");
      setEditingCar(newCar);
      setShowCreateForm(true);
      fetchCars();
    } catch (error: any) {
      console.error("Duplicate error:", error);
      toast.error("Klaida kopijuojant skelbimą");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Kraunama...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="AutoKOPERS logotipas" className="h-12" />
          </Link>
          <div className="flex gap-2">
            {isAdmin && (
              <Button 
                onClick={() => navigate("/admin-dashboard")}
                variant="outline"
              >
                Administratoriaus zona
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Atsijungti
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Mano skelbimai</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-autoplius-xml`, '_blank')}
              variant="outline"
            >
              Atsisiųsti Autoplius XML
            </Button>
            <Button onClick={() => {
              setEditingCar(null);
              setShowCreateForm(true);
            }}>
              Pridėti skelbimą
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <CreateListing
            car={editingCar}
            onClose={() => {
              setShowCreateForm(false);
              setEditingCar(null);
            }}
            onSuccess={() => {
              setShowCreateForm(false);
              setEditingCar(null);
              fetchCars();
            }}
          />
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Card key={car.id}>
              <CardHeader className="pb-2">
                <div className="flex gap-1 mb-2">
                  {car.visible_web && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Web
                    </Badge>
                  )}
                  {car.visible_autoplius && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Autoplius
                    </Badge>
                  )}
                  {!car.visible_web && !car.visible_autoplius && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Nepublikuota
                    </Badge>
                  )}
                </div>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-base">{car.make} {car.model}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDuplicate(car)}
                      title="Kopijuoti skelbimą"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingCar(car);
                        setShowCreateForm(true);
                      }}
                      title="Redaguoti"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(car.id)}
                      title="Ištrinti"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {car.image_url && (
                  <img
                    src={car.image_url}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="space-y-1 text-sm">
                  <p><strong>Metai:</strong> {car.year}</p>
                  <p><strong>Kaina:</strong> {car.price.toLocaleString()} €</p>
                  {car.mileage && <p><strong>Rida:</strong> {car.mileage.toLocaleString()} km</p>}
                  {car.fuel_type && <p><strong>Kuras:</strong> {car.fuel_type}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cars.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Dar neturite skelbimų. Pradėkite nuo pirmo skelbimo sukūrimo!
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PartnerDashboard;
