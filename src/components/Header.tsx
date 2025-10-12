import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/autokopers-logo.jpeg";

const Header = () => {
  return (
    <>
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end gap-6 h-10 text-sm">
            <a href="mailto:info@autokopers.lt" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              info@autokopers.lt
            </a>
            <a href="tel:+37064444999" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              +370 6 4444 999
            </a>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Gariūnų g. 49, Vilnius
            </div>
          </div>
        </div>
      </div>
      
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <img src={logo} alt="AutoKOPERS" className="h-12" />
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
                Auto supirkimas
              </a>
              <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
                Auto paieška
              </a>
              <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
                Lizingas
              </a>
              <a href="#" className="text-foreground hover:text-primary font-medium transition-colors">
                Kontaktai
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <Button 
                onClick={() => window.location.href = '/partner-login'}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                Partnerio zona
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
