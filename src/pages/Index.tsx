import { lazy, Suspense } from "react";
import { Mail, Phone, MapPin, Send, ExternalLink, Tag } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Helmet } from "react-helmet";

// Lazy load below-the-fold sections
const TrustSection = lazy(() => import("@/components/TrustSection"));
const FeaturedCars = lazy(() => import("@/components/FeaturedCars"));
const FinancingSection = lazy(() => import("@/components/FinancingSection"));
const Testimonials = lazy(() => import("@/components/Testimonials"));

const SectionFallback = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const location = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{language === "lt" ? "Autokopers – Automobilių Pardavimas ir Finansavimas Kaune" : "Autokopers – Car Sales & Financing in Kaunas"}</title>
        <meta name="description" content={language === "lt" ? "Naudotų automobilių pardavimas, supirkimas ir lizingas Kaune. Greitas finansavimas nuo 6.9%. Patikimi automobiliai su garantija." : "Used car sales, purchasing and leasing in Kaunas. Fast financing from 6.9%. Reliable cars with warranty."} />
        <link rel="canonical" href="https://www.autokopers.lt/" />
        <meta property="og:title" content="Autokopers – Automobilių Pardavimas ir Finansavimas" />
        <meta property="og:description" content="Naudotų automobilių pardavimas, supirkimas ir lizingas Kaune. Greitas finansavimas nuo 6.9%." />
        <meta property="og:url" content="https://www.autokopers.lt/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          "name": "Autokopers",
          "url": "https://www.autokopers.lt",
          "logo": "https://www.autokopers.lt/autokopers-social.jpg",
          "image": "https://www.autokopers.lt/autokopers-social.jpg",
          "telephone": "+37062851439",
          "email": "labas@autokopers.lt",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Palemono g. 173",
            "addressLocality": "Kaunas",
            "addressCountry": "LT"
          },
          "openingHoursSpecification": [
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "19:00" }
          ],
          "sameAs": ["https://www.facebook.com/AutoKopersLT", "https://www.instagram.com/autokoperslt/"]
        })}</script>
      </Helmet>
      {/* Announcement banner - auto-hides after May 3, 2026 */}
      {new Date() < new Date('2026-05-03') && (
        <a
          href="https://www.google.com/maps/place/Palemono+g.+173,+Kaunas"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t("home.banner")}
        </a>
      )}
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
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
        </Suspense>

        {/* Didmena / Wholesale section */}
        <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-y-4 border-amber-500">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 uppercase tracking-wider">
                <Tag className="h-4 w-4" />
                Didmena
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
                Didmeniniai pasiūlymai automobilių prekiautojams
              </h2>
              <p className="text-lg text-amber-900/80 mb-8 max-w-2xl mx-auto">
                Turime atskirą platformą ir Telegram kanalą, kuriame partneriai gauna
                automobilius <strong>didmeninėmis kainomis</strong> tiesiai iš Europos.
                Prisijunk ir gauk kasdienius pasiūlymus pirma kitų.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://koperseurope.de/auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
                >
                  <ExternalLink className="h-5 w-5" />
                  Eiti į didmenos platformą
                </a>
                <a
                  href="https://t.me/koperseurope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-amber-700 font-semibold px-6 py-3 rounded-lg transition-colors border-2 border-amber-500"
                >
                  <Send className="h-5 w-5" />
                  Telegram kanalas
                </a>
              </div>
            </div>
          </div>
        </section>

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
                  <a href="https://maps.app.goo.gl/3HSKiXHLQmBC99e" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Palemono g. 173, Kaunas
                  </a>
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
