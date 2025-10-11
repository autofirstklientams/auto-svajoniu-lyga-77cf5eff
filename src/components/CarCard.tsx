import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel } from "lucide-react";

interface CarCardProps {
  image: string;
  title: string;
  price: string;
  year: number;
  mileage: string;
  fuel: string;
  featured?: boolean;
}

const CarCard = ({ image, title, price, year, mileage, fuel, featured }: CarCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)] group">
      <div className="relative overflow-hidden">
        {featured && (
          <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground">
            Rekomenduojama
          </Badge>
        )}
        <img 
          src={image} 
          alt={title}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-3xl font-bold text-primary mb-4">{price}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{mileage}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span>{fuel}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Peržiūrėti
          </Button>
          <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/10">
            Finansavimas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
