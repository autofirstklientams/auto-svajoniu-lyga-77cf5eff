import { Mail, Phone, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustSection from "@/components/TrustSection";
import FeaturedCars from "@/components/FeaturedCars";
import FinancingSection from "@/components/FinancingSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        {/* Mobile: Calculator -> Cars -> Trust/Testimonials. Desktop: Trust first */}
        <div className="hidden md:block">
          <TrustSection />
        </div>
        <div id="featured-cars">
          <FeaturedCars />
        </div>
        <div className="md:hidden">
          <FinancingSection />
          <TrustSection />
        </div>
        <div className="hidden md:block">
          <FinancingSection />
        </div>
        <Testimonials />
        <section id="contact" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">{t("contact.title")}</h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t("contact.description")}
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-background rounded-lg shadow-sm">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t("contact.email")}</h3>
                  <a href="mailto:labas@autokopers.lt" className="text-primary hover:underline break-all">
                    labas@autokopers.lt
                  </a>
                </div>
                <div className="p-6 bg-background rounded-lg shadow-sm">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t("contact.phone")}</h3>
                  <a href="tel:+37062851439" className="text-primary hover:underline">
                    +370 628 51439
                  </a>
                </div>
                <div className="p-6 bg-background rounded-lg shadow-sm">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t("contact.address")}</h3>
                  <p className="text-muted-foreground">
                    Varduvos g. 2, Kaunas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
