import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/autokopers-logo.jpeg";

const Header = () => {
  return (
    <>
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-6 py-2 md:py-0 md:h-10 text-xs md:text-sm">
            <a href="mailto:labas@autokopers.lt" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">labas@autokopers.lt</span>
            </a>
            <a href="tel:+37062851439" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-3 w-3 md:h-4 md:w-4" />
              +370 628 51439
            </a>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Varduvos g. 2, Kaunas</span>
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
              <a 
                href="#featured-cars" 
                className="text-foreground hover:text-primary font-medium transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('featured-cars')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Auto supirkimas
              </a>
              <a 
                href="#featured-cars" 
                className="text-foreground hover:text-primary font-medium transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('featured-cars')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Auto paieška
              </a>
              <a 
                href="#financing" 
                className="text-foreground hover:text-primary font-medium transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('financing')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Lizingas
              </a>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Apie mus
              </Link>
              <a 
                href="#contact" 
                className="text-foreground hover:text-primary font-medium transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Kontaktai
              </a>
              <Link to="/partner-login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Partnerio zona
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
