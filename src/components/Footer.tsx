import { Car } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold">AutoFinance LT</span>
            </div>
            <p className="text-white/80">
              Profesionalūs automobilių pardavimo ir finansavimo sprendimai
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Nuorodos</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-accent transition-colors">Automobiliai</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Finansavimas</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Apie Mus</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Kontaktai</h3>
            <ul className="space-y-2 text-white/80">
              <li>Tel: +370 600 00000</li>
              <li>El. paštas: info@autofinance.lt</li>
              <li>Adresas: Vilnius, Lietuva</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Darbo Laikas</h3>
            <ul className="space-y-2 text-white/80">
              <li>Pr-Pt: 9:00 - 18:00</li>
              <li>Šeštadieniais: 10:00 - 16:00</li>
              <li>Sekmadieniais: Nedirbame</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-white/60">
          <p>&copy; 2024 AutoFinance LT. Visos teisės saugomos.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
