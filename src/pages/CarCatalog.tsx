import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Helmet } from "react-helmet";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  image_url: string | null;
  fuel_type: string | null;
  transmission: string | null;
  body_type: string | null;
  is_recommended: boolean;
}

interface MakeCount {
  make: string;
  count: number;
}

type SortOption = "recommended" | "newest" | "price_asc" | "price_desc" | "year_desc" | "year_asc" | "mileage_asc" | "mileage_desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Rekomenduojami" },
  { value: "newest", label: "Naujausi viršuje" },
  { value: "price_asc", label: "Pigiausi viršuje" },
  { value: "price_desc", label: "Brangiausi viršuje" },
  { value: "year_desc", label: "Metai mažėjančia tvarka" },
  { value: "year_asc", label: "Metai didėjančia tvarka" },
  { value: "mileage_asc", label: "Rida mažėjančia tvarka" },
  { value: "mileage_desc", label: "Rida didėjančia tvarka" },
];

const CarCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [makeCounts, setMakeCounts] = useState<MakeCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "recommended");
  const [showAllMakes, setShowAllMakes] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allCars, searchQuery, selectedMakes, sortBy]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (sortBy !== "recommended") newParams.set("sort", sortBy);
    if (selectedMakes.length > 0) newParams.set("makes", selectedMakes.join(","));
    if (searchQuery) newParams.set("q", searchQuery);
    setSearchParams(newParams);
  }, [sortBy, selectedMakes, searchQuery]);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("visible_web", true);

      if (error) throw error;

      setAllCars(data || []);

      // Calculate make counts
      const counts: Record<string, number> = {};
      (data || []).forEach((car) => {
        counts[car.make] = (counts[car.make] || 0) + 1;
      });

      const makeCountsArray = Object.entries(counts)
        .map(([make, count]) => ({ make, count }))
        .sort((a, b) => b.count - a.count);

      setMakeCounts(makeCountsArray);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allCars];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query)
      );
    }

    // Apply make filter
    if (selectedMakes.length > 0) {
      filtered = filtered.filter((car) => selectedMakes.includes(car.make));
    }

    // Apply sorting
    switch (sortBy) {
      case "recommended":
        filtered.sort((a, b) => {
          if (a.is_recommended && !b.is_recommended) return -1;
          if (!a.is_recommended && b.is_recommended) return 1;
          return 0;
        });
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
        break;
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "year_desc":
        filtered.sort((a, b) => b.year - a.year);
        break;
      case "year_asc":
        filtered.sort((a, b) => a.year - b.year);
        break;
      case "mileage_asc":
        filtered.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;
      case "mileage_desc":
        filtered.sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
        break;
    }

    setCars(filtered);
  };

  const toggleMake = (make: string) => {
    setSelectedMakes((prev) =>
      prev.includes(make)
        ? prev.filter((m) => m !== make)
        : [...prev, make]
    );
  };

  const clearFilters = () => {
    setSelectedMakes([]);
    setSearchQuery("");
    setSortBy("recommended");
  };

  const displayedMakes = showAllMakes ? makeCounts : makeCounts.slice(0, 10);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Markė</h3>
        <div className="space-y-2">
          {displayedMakes.map(({ make, count }) => (
            <label
              key={make}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedMakes.includes(make)}
                  onCheckedChange={() => toggleMake(make)}
                />
                <span className="font-medium">{make}</span>
              </div>
              <span className="text-muted-foreground text-sm">{count}</span>
            </label>
          ))}
        </div>
        {makeCounts.length > 10 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setShowAllMakes(!showAllMakes)}
          >
            {showAllMakes ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Rodyti mažiau
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Rodyti visas ({makeCounts.length})
              </>
            )}
          </Button>
        )}
      </div>

      {selectedMakes.length > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Išvalyti filtrus
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Automobiliai | AutoKOPERS</title>
        <meta name="description" content="Peržiūrėkite visus AutoKOPERS siūlomus automobilius. Platus pasirinkimas naudotų automobilių su patikrinta istorija." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Automobiliai
              </h1>
              <p className="text-muted-foreground mt-2">
                {cars.length} {cars.length === 1 ? "rezultatas" : "rezultatai"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Paieška..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mobile filter button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrai
                    {selectedMakes.length > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                        {selectedMakes.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <h2 className="text-xl font-bold mb-6">Filtrai</h2>
                  <FilterSidebar />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-6">Filtrai</h2>
                <FilterSidebar />
              </div>
            </aside>

            {/* Car Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl">
                  <p className="text-muted-foreground text-lg">
                    Automobilių pagal pasirinktus filtrus nerasta
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Išvalyti filtrus
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cars.map((car, index) => (
                    <div
                      key={car.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
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
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CarCatalog;