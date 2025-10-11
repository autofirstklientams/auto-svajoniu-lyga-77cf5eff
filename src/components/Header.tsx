import { Button } from "@/components/ui/button";
import { Car, Phone } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AutoFinance</span>
            <span className="text-2xl font-bold text-accent">LT</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
              Automobiliai
            </a>
            <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
              Finansavimas
            </a>
            <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
              Apie Mus
            </a>
            <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
              Kontaktai
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +370 600 00000
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              Susisiekti
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
