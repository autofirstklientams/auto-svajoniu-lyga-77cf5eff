import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, ChevronRight, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { calculateMonthlyPayment } from "@/components/LoanCalculator";
import { useLanguage } from "@/contexts/LanguageContext";
import { OptimizedImage } from "@/components/OptimizedImage";

interface CarCardProps {
  id?: string;
  image: string;
  title: string;
  price: string;
  numericPrice?: number;
  year: number;
  mileage: string;
  fuel: string;
  featured?: boolean;
  isRecommended?: boolean;
}

function CarCardComponent({ id, image, title, price, numericPrice, year, mileage, fuel, featured, isRecommended }: CarCardProps) {
  const { t } = useLanguage();
  const monthlyPayment = numericPrice ? calculateMonthlyPayment(numericPrice) : null;
  
  const formatMonthlyPayment = (amount: number) => {
    return new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const content = (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-border/50 h-full">
      <div className="relative overflow-hidden">
        {isRecommended && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-1.5 sm:py-2 px-2 sm:px-3 flex items-center justify-center gap-1.5 sm:gap-2 shadow-md">
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">{t("featured.recommended")}</span>
          </div>
        )}
        {featured && !isRecommended && (
          <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-accent text-accent-foreground text-xs">
            {t("listing.featured")}
          </Badge>
        )}
        <OptimizedImage
          src={image}
          alt={title}
          className={`w-full h-40 sm:h-48 md:h-56 transition-transform duration-500 group-hover:scale-105 ${isRecommended ? 'pt-0' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-0.5 sm:gap-0 mb-1">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground line-clamp-1 order-1">{title}</h3>
          <p className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap order-2 sm:ml-2">{price}</p>
        </div>
        
        {monthlyPayment && (
          <div className="flex justify-start sm:justify-end mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {t("car.monthlyFrom")} <span className="font-semibold text-primary">{formatMonthlyPayment(monthlyPayment)}</span>{t("car.perMonthShort")}
            </span>
          </div>
        )}
        
        {!monthlyPayment && <div className="mb-2 sm:mb-3" />}
        
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-5 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{mileage}</span>
          </div>
          {fuel !== "-" && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Fuel className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{fuel}</span>
            </div>
          )}
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group/btn text-sm sm:text-base py-2 sm:py-2.5">
          {t("car.view")}
          <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );

  if (id) {
    return <Link to={`/car/${id}`}>{content}</Link>;
  }

  return content;
}

const CarCard = memo(CarCardComponent);
export default CarCard;
