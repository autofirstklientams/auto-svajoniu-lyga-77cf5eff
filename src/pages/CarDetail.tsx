import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoanCalculator from "@/components/LoanCalculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings2, 
  Car as CarIcon,
  Palette,
  Users,
  DoorOpen,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface CarImage {
  id: string;
  image_url: string;
  display_order: number;
}

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
  features: Record<string, string[]> | null;
}

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<CarImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    if (id) {
      fetchCar();
      fetchImages();
    }
  }, [id]);

  const fetchCar = async () => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .eq("visible_web", true)
      .single();

    if (error) {
      console.error("Error fetching car:", error);
      setCar(null);
    } else {
      setCar(data as Car);
    }
    setIsLoading(false);
  };

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("car_images")
      .select("*")
      .eq("car_id", id)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setImages(data);
    }
  };

  const allImages = images.length > 0 
    ? images.map(img => img.image_url) 
    : car?.image_url 
      ? [car.image_url] 
      : [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-car-purchase", {
        body: {
          ...formData,
          carInfo: `${car.make} ${car.model} (${car.year}) - ${car.price}€`,
          carId: car.id,
        },
      });

      if (error) throw error;

      toast.success("Užklausa išsiųsta! Susisieksime su jumis artimiausiu metu.");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      toast.error("Klaida siunčiant užklausą. Bandykite dar kartą.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[400px] w-full mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Automobilis nerastas</h1>
          <p className="text-muted-foreground mb-6">
            Šis automobilis neegzistuoja arba buvo pašalintas.
          </p>
          <Link to="/car-search">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Grįžti į paiešką
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { icon: Calendar, label: "Metai", value: car.year },
    { icon: Gauge, label: "Rida", value: car.mileage ? `${car.mileage.toLocaleString()} km` : "-" },
    { icon: Fuel, label: "Kuras", value: car.fuel_type || "-" },
    { icon: Settings2, label: "Pavarų dėžė", value: car.transmission || "-" },
    { icon: CarIcon, label: "Kėbulas", value: car.body_type || "-" },
    { icon: Palette, label: "Spalva", value: car.color || "-" },
    { icon: Users, label: "Vietos", value: car.seats || "-" },
    { icon: DoorOpen, label: "Durys", value: car.doors || "-" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/car-search" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Grįžti į paiešką
        </Link>

        {/* Title & Price */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {car.make} {car.model}
            </h1>
            <p className="text-muted-foreground">{car.year} • {car.condition || "Naudotas"}</p>
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatPrice(car.price)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            {allImages.length > 0 && (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index 
                        ? "border-primary" 
                        : "border-transparent hover:border-muted-foreground/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifikacijos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <spec.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{spec.label}</p>
                        <p className="font-medium text-foreground">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional specs */}
                {(car.engine_capacity || car.power_kw || car.vin || car.steering_wheel) && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    {car.engine_capacity && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Variklis</p>
                        <p className="font-medium text-foreground">{car.engine_capacity} L</p>
                      </div>
                    )}
                    {car.power_kw && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Galia</p>
                        <p className="font-medium text-foreground">{car.power_kw} kW</p>
                      </div>
                    )}
                    {car.steering_wheel && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Vairas</p>
                        <p className="font-medium text-foreground">{car.steering_wheel}</p>
                      </div>
                    )}
                    {car.vin && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">VIN</p>
                        <p className="font-medium text-foreground text-sm">{car.vin}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {car.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Aprašymas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{car.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Defects */}
            {car.defects && (
              <Card>
                <CardHeader>
                  <CardTitle>Defektai</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{car.defects}</p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {car.features && Object.keys(car.features).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Įranga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(car.features).map(([category, items]) => (
                      items && items.length > 0 && (
                        <div key={category}>
                          <h4 className="font-medium text-foreground mb-2">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item, index) => (
                              <Badge key={index} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Loan Calculator & Contact Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Loan Calculator */}
            <LoanCalculator 
              carPrice={car.price} 
              carInfo={`${car.make} ${car.model} (${car.year})`}
            />
            
            {/* Contact Form */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Domina šis automobilis?</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Vardas *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonas *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">El. paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Žinutė</Label>
                    <Textarea
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Jūsų klausimai ar pageidavimai..."
                    />
                  </div>
                  <Button type="submit" className="w-full btn-gradient" disabled={isSubmitting}>
                    {isSubmitting ? "Siunčiama..." : "Siųsti užklausą"}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <p className="text-sm text-muted-foreground">Arba susisiekite tiesiogiai:</p>
                  <a 
                    href="tel:+37062851439" 
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    +370 628 51439
                  </a>
                  <a 
                    href="mailto:labas@autokopers.lt" 
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    labas@autokopers.lt
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>
          <img
            src={allImages[currentImageIndex]}
            alt={`${car.make} ${car.model}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="h-12 w-12" />
          </button>
          <div className="absolute bottom-4 text-white text-lg">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CarDetail;
