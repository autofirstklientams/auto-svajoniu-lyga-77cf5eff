import { useEffect, useState } from "react";
import CarCard from "./CarCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExternalCarPlatforms from "./ExternalCarPlatforms";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  image_url: string | null;
}

const FeaturedCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setCars(data || []);
    } catch (error: any) {
      toast.error("Klaida užkraunant automobilius");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Kraunama...
          </h2>
        </div>
      </section>
    );
  }

  if (cars.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <ExternalCarPlatforms />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Rekomenduojami automobiliai
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              title={`${car.make} ${car.model}`}
              year={car.year}
              price={`${car.price.toLocaleString()} €`}
              mileage={`${car.mileage?.toLocaleString() || "N/A"} km`}
              fuel={"-"}
              image={car.image_url || "/placeholder.svg"}
            />
          ))}
        </div>
        <ExternalCarPlatforms />
      </div>
    </section>
  );
};

export default FeaturedCars;
