import { Pencil, Trash2, Copy, Globe, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  image_url: string | null;
  visible_web: boolean;
  visible_autoplius: boolean;
}

interface CarListingCardProps {
  car: Car;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function CarListingCard({ car, onEdit, onDelete, onDuplicate }: CarListingCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative">
        {car.image_url ? (
          <img
            src={car.image_url}
            alt={`${car.make} ${car.model}`}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Nėra nuotraukos</span>
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {car.visible_web && (
            <Badge className="bg-green-500/90 text-white border-none shadow-sm">
              <Globe className="h-3 w-3 mr-1" />
              Web
            </Badge>
          )}
          {car.visible_autoplius && (
            <Badge className="bg-blue-500/90 text-white border-none shadow-sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              Autoplius
            </Badge>
          )}
          {!car.visible_web && !car.visible_autoplius && (
            <Badge variant="secondary" className="bg-background/90 shadow-sm">
              Nepublikuota
            </Badge>
          )}
        </div>

        {/* Quick actions - visible on hover */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/90 shadow-sm hover:bg-background"
            onClick={onDuplicate}
            title="Kopijuoti"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/90 shadow-sm hover:bg-background"
            onClick={onEdit}
            title="Redaguoti"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 shadow-sm"
            onClick={onDelete}
            title="Ištrinti"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              {car.make} {car.model}
            </h3>
            <p className="text-muted-foreground text-sm">{car.year} m.</p>
          </div>
          <p className="text-xl font-bold text-primary">
            {car.price.toLocaleString()} €
          </p>
        </div>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          {car.mileage && (
            <span>{car.mileage.toLocaleString()} km</span>
          )}
          {car.fuel_type && (
            <span>{car.fuel_type}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
