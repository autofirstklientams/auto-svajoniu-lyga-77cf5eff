import { Link } from "react-router-dom";
import CarCard from "./CarCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Car {
  id: string;
  slug: string | null;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  image_url: string | null;
  fuel_type: string | null;
  is_recommended: boolean;
  is_reserved: boolean;
  is_sold: boolean;
}

const fetchFeaturedCars = async (): Promise<Car[]> => {
  const { data, error } = await supabase
    .from("cars")
    .select("id, slug, make, model, year, price, mileage, image_url, fuel_type, is_recommended, is_reserved, is_sold")
    .eq("visible_web", true)
    .eq("is_featured", true)
    .order("is_recommended", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;
  return data || [];
};

const FeaturedCars = () => {
  const { t } = useLanguage();

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: fetchFeaturedCars,
  });

  if (isLoading) {
    return (
      <section id="featured-cars" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[240px] w-full rounded-xl" />
                <div className="space-y-2 px-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-2 px-2 pt-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (cars.length === 0) {
    return (
      <section id="featured-cars" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">{t("featured.noCars")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-cars" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("featured.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("featured.description")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {cars.map((car, index) => (
            <div 
              key={car.id} 
              className="animate-fade-in"
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
                isReserved={car.is_reserved}
                isSold={car.is_sold}
                priority={index < 4}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild size="lg" className="group">
            <Link to="/automobiliai">
              {t("featured.viewAll")}
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
