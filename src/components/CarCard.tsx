import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, ChevronRight } from "lucide-react";

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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-border/50">
      <div className="relative overflow-hidden">
        {featured && (
          <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground">
            Rekomenduojama
          </Badge>
        )}
        <img 
          src={image} 
          alt={title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-foreground line-clamp-1">{title}</h3>
          <p className="text-xl font-bold text-primary whitespace-nowrap ml-2">{price}</p>
        </div>
        
        <div className="flex gap-4 mb-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-4 w-4" />
            <span>{mileage}</span>
          </div>
          {fuel !== "-" && (
            <div className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4" />
              <span>{fuel}</span>
            </div>
          )}
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group/btn">
          Peržiūrėti
          <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CarCard;
