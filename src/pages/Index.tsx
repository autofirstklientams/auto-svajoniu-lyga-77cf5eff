import { Mail, Phone, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LoanCalculator from "@/components/LoanCalculator";
import FeaturedCars from "@/components/FeaturedCars";
import FinancingSection from "@/components/FinancingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <div id="financing">
          <LoanCalculator />
        </div>
        <div id="featured-cars">
          <FeaturedCars />
        </div>
        <FinancingSection />
        <section id="contact" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Susisiekite su mumis</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Turite klausimų? Mūsų komanda pasiruošusi padėti!
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-background rounded-lg shadow-sm">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">El. paštas</h3>
                  <a href="mailto:labas@autokopers.lt" className="text-primary hover:underline break-all">
                    labas@autokopers.lt
                  </a>
                </div>
                <div className="p-6 bg-background rounded-lg shadow-sm">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Telefonas</h3>
                  <a href="tel:+37062851439" className="text-primary hover:underline">
                    +370 628 51439
                  </a>
                </div>
                <div className="p-6 bg-background rounded-lg shadow-sm">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Adresas</h3>
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
