import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/autokopers-logo.jpeg";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="AutoKOPERS" className="h-10" />
            </Link>
            <p className="text-muted-foreground mb-4">
              Patikimas automobilių pardavimas ir finansavimas Lietuvoje
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/AutoKopersLT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/autokoperslt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Nuorodos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Automobiliai
                </Link>
              </li>
              <li>
                <Link to="/car-search" className="text-muted-foreground hover:text-primary transition-colors">
                  Paieška
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Apie mus
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Kontaktai</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="tel:+37062851439" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  +370 628 51439
                </a>
              </li>
              <li>
                <a href="mailto:labas@autokopers.lt" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  labas@autokopers.lt
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Varduvos g. 2, Kaunas
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Darbo laikas</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex justify-between">
                <span>Pr-Pt:</span>
                <span>9:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Št:</span>
                <span>10:00 - 19:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sk:</span>
                <span>Individualiai</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground/70 mt-3">
              Jeigu reikia – dirbame ir po darbo valandų
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">&copy; 2025 AutoKOPERS. Visos teisės saugomos.</p>
            <Button 
              onClick={() => window.location.href = '/partner-login'}
              variant="outline"
              size="sm"
            >
              Partnerio zona
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
