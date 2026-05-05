import { lazy, Suspense } from "react";
import { Mail, Phone, MapPin, Send, ExternalLink, Crown, Sparkles, TrendingDown, Globe2 } from "lucide-react";
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
      {/* Didmena announcement banner */}
      <Link
        to="/didmena"
        className="block bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-amber-950 text-center py-2 px-4 text-sm font-semibold hover:brightness-110 transition-all"
      >
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="bg-amber-950 text-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Naujiena</span>
          Pristatome didmenos platformą — <span className="underline font-bold">plačiau</span>
        </span>
      </Link>
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

        {/* Didmena / Wholesale - Premium section */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#1a1207] via-[#2d1d0a] to-[#1a1207]">
          {/* Decorative gold glow */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[120px]" />
          </div>
          {/* Subtle pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(251,191,36,0.8) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-5 py-2 rounded-full text-xs font-bold mb-6 uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                <Crown className="h-4 w-4" />
                Didmena · Premium
              </div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent leading-tight">
                Išskirtinės kainos.<br />Tiesiai iš Europos.
              </h2>

              <p className="text-lg md:text-xl text-amber-100/80 mb-4 max-w-2xl mx-auto leading-relaxed">
                Mūsų <strong className="text-amber-300">uždara didmenos platforma</strong> ir Telegram kanalas yra
                vieta, kur automobilių prekiautojai ir VIP klientai pirmieji gauna
                geriausius pasiūlymus dar prieš jiems pasiekiant viešą rinką.
              </p>
              <p className="text-base md:text-lg text-amber-100/60 mb-10 max-w-2xl mx-auto">
                Tūkstančiai patikrintų automobilių. Kasdieniai šviežūs lotai.
                Konkurencingiausios kainos rinkoje.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5 hover:border-amber-400/50 transition-all">
                  <TrendingDown className="h-7 w-7 text-amber-400 mx-auto mb-2" />
                  <div className="text-amber-100 font-semibold text-sm">Didmeninės kainos</div>
                  <div className="text-amber-100/50 text-xs mt-1">Iki 30% žemiau rinkos</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5 hover:border-amber-400/50 transition-all">
                  <Globe2 className="h-7 w-7 text-amber-400 mx-auto mb-2" />
                  <div className="text-amber-100 font-semibold text-sm">Visa Europa</div>
                  <div className="text-amber-100/50 text-xs mt-1">DE, NL, BE, FR aukcionai</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5 hover:border-amber-400/50 transition-all">
                  <Sparkles className="h-7 w-7 text-amber-400 mx-auto mb-2" />
                  <div className="text-amber-100 font-semibold text-sm">Pirmenybė nariams</div>
                  <div className="text-amber-100/50 text-xs mt-1">Pasiūlymai pirma kitų</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://koperseurope.de/auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-bold px-8 py-4 rounded-xl transition-all shadow-[0_10px_40px_rgba(251,191,36,0.4)] hover:shadow-[0_10px_50px_rgba(251,191,36,0.6)] hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5" />
                  Atidaryti didmenos platformą
                </a>
                <a
                  href="https://t.me/koperseurope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-amber-500/10 text-amber-200 font-semibold px-8 py-4 rounded-xl transition-all border-2 border-amber-400/50 hover:border-amber-300"
                >
                  <Send className="h-5 w-5" />
                  Prisijungti prie Telegram
                </a>
              </div>

              <p className="text-amber-100/40 text-xs mt-6 italic">
                Registracija nemokama · Prieiga skirta automobilių prekiautojams
              </p>
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
