import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Menu, LogIn, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import logo from "@/assets/autokopers-logo.jpeg";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            <a href="https://maps.app.goo.gl/3HSKiXHLQmBC99eA7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Palemono g. 173, Kaunas</span>
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src={logo} alt="AutoKOPERS logotipas" className="h-10 md:h-12" />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8 text-sm lg:text-base">
              <Link 
                to="/automobiliai"
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                {t("nav.cars")}
              </Link>
              <Link 
                to="/sell-your-car" 
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {t("nav.carPurchase")}
              </Link>
              <Link 
                to="/leasing" 
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {t("nav.leasing")}
              </Link>
              <a
                href="https://koperseurope.de/auth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 font-bold transition-colors"
              >
                Didmena
              </a>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                {t("nav.about")}
              </Link>
              <Link 
                to="/#contact" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                {t("contact.title")}
              </Link>
              {user ? (
                <Button 
                  onClick={() => navigate("/partner-dashboard")}
                  className="border-primary text-primary-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t("nav.partnerZone")}
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate("/partner-login")}
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t("nav.partnerZone")}
                </Button>
              )}
            </nav>

            {/* Mobile navigation */}
            <div className="md:hidden flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-8">
                    <SheetClose asChild>
                      <Link to="/automobiliai" className="text-foreground hover:text-primary font-medium">{t("nav.cars")}</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/sell-your-car" className="text-primary hover:text-primary/80 font-semibold transition-colors">{t("nav.carPurchase")}</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/leasing" className="text-primary hover:text-primary/80 font-semibold transition-colors">{t("nav.leasing")}</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <a
                        href="https://koperseurope.de/auth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-700 font-bold"
                      >
                        Didmena
                      </a>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/about" className="text-foreground hover:text-primary font-medium">{t("nav.about")}</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/#contact" className="text-foreground hover:text-primary font-medium">{t("contact.title")}</Link>
                    </SheetClose>
                    {user ? (
                      <SheetClose asChild>
                        <Button 
                          onClick={() => navigate("/partner-dashboard")}
                          className="w-full"
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t("nav.partnerZone")}
                        </Button>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Button 
                          onClick={() => navigate("/partner-login")}
                          variant="outline" 
                          className="w-full border-primary text-primary hover:bg-primary/10"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          {t("nav.partnerZone")}
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
