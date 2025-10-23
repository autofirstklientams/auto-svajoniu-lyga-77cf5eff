import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import CreateListing from "./CreateListing";
import { Pencil, Trash2 } from "lucide-react";

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
}

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session) {
        navigate("/partner-login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
          <h1 className="text-2xl font-bold">Partnerio dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Atsijungti
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Mano skelbimai</h2>
          <Button onClick={() => {
            setEditingCar(null);
            setShowCreateForm(true);
          }}>
            Pridėti skelbimą
          </Button>
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
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{car.make} {car.model}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCar(car);
                        setShowCreateForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(car.id)}
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
                <div className="space-y-2 text-sm">
                  <p><strong>Metai:</strong> {car.year}</p>
                  <p><strong>Kaina:</strong> {car.price.toLocaleString()} €</p>
                  {car.mileage && <p><strong>Rida:</strong> {car.mileage.toLocaleString()} km</p>}
                  {car.fuel_type && <p><strong>Kuras:</strong> {car.fuel_type}</p>}
                  {car.transmission && <p><strong>Pavarų dėžė:</strong> {car.transmission}</p>}
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
