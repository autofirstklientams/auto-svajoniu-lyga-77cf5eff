import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/autokopers-logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src={logo} alt="AutoKOPERS" className="h-10" />
            </div>
            <p className="text-muted-foreground">
              Patikimas automobilių pardavimas ir finansavimas Lietuvoje
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Nuorodos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Automobiliai
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Finansavimas
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Apie Mus
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Kontaktai</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +370 6 4444 999
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@autokopers.lt
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Gariūnų g. 49, Vilnius
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Darbo laikas</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Pr-Pt: 9:00 - 18:00</li>
              <li>Št: 10:00 - 16:00</li>
              <li>Sk: Išeiginė</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 AutoKOPERS. Visos teisės saugomos.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
