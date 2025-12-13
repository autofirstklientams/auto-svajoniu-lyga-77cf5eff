import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Menu, LogIn, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/autokopers-logo.jpeg";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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
            <Link to="/" className="flex items-center">
              <img src={logo} alt="AutoKOPERS logotipas" className="h-12" />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/car-search"
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Auto paieška
              </Link>
              <Link 
                to="/sell-your-car" 
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Parduosime tavo automobilį
              </Link>
              <Link 
                to="/leasing" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Lizingas
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Apie mus
              </Link>
              <Link 
                to="/#contact" 
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Kontaktai
              </Link>
              {user ? (
                <Button 
                  onClick={() => navigate("/partner-dashboard")}
                  className="border-primary text-primary-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  Partnerio zona
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate("/partner-login")}
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Partnerio zona
                </Button>
              )}
            </nav>

            {/* Mobile navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Atidaryti meniu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-8">
                    <Link to="/car-search" className="text-foreground hover:text-primary font-medium">Auto paieška</Link>
                    <Link to="/sell-your-car" className="text-primary hover:text-primary/80 font-semibold transition-colors">Parduosime tavo automobilį</Link>
                    <Link 
                      to="/leasing" 
                      className="text-foreground hover:text-primary font-medium"
                    >
                      Lizingas
                    </Link>
                    <Link to="/about" className="text-foreground hover:text-primary font-medium">Apie mus</Link>
                    <Link 
                      to="/#contact" 
                      className="text-foreground hover:text-primary font-medium"
                    >
                      Kontaktai
                    </Link>
                    {user ? (
                      <Button 
                        onClick={() => navigate("/partner-dashboard")}
                        className="w-full"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Partnerio zona
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate("/partner-login")}
                        variant="outline" 
                        className="w-full border-primary text-primary hover:bg-primary/10"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Partnerio zona
                      </Button>
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
