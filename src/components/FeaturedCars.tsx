import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CarCard from "./CarCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExternalCarPlatforms from "./ExternalCarPlatforms";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  image_url: string | null;
  fuel_type: string | null;
  is_recommended: boolean;
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
        .eq("visible_web", true)
        .eq("is_featured", true)
        .order("is_recommended", { ascending: false })
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
      <section id="featured-cars" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (cars.length === 0) {
    return (
      <section id="featured-cars" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <ExternalCarPlatforms />
        </div>
      </section>
    );
  }

  return (
    <section id="featured-cars" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Rekomenduojami automobiliai
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Atrinkti automobiliai su patikrinta istorija ir konkurencinga kaina
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <div 
              key={car.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CarCard
                id={car.id}
                title={`${car.make} ${car.model}`}
                year={car.year}
                price={`${car.price.toLocaleString()} €`}
                numericPrice={car.price}
                mileage={`${car.mileage?.toLocaleString() || "N/A"} km`}
                fuel={car.fuel_type || "-"}
                image={car.image_url || "/placeholder.svg"}
                isRecommended={car.is_recommended}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild size="lg" className="group">
            <Link to="/automobiliai">
              Visi automobiliai
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        
        <ExternalCarPlatforms />
      </div>
    </section>
  );
};

export default FeaturedCars;
