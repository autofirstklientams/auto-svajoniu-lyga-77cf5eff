import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCars from "@/components/FeaturedCars";
import CarSearchForm from "@/components/CarSearchForm";
import { Helmet } from "react-helmet";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CarSearch = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Automobilių paieška pagal užsakymą | Autokopers</title>
        <meta name="description" content="Ieškome automobilių visoje Europoje pagal jūsų poreikius. Patikriname istoriją, parvežame iki durų. Naudoti automobiliai su garantija Kaune." />
        <link rel="canonical" href="https://www.autokopers.lt/car-search" />
        <meta property="og:title" content="Automobilių paieška pagal užsakymą | Autokopers" />
        <meta property="og:description" content="Ieškome automobilių visoje Europoje pagal jūsų poreikius. Patikriname istoriją, parvežame iki durų." />
        <meta property="og:url" content="https://www.autokopers.lt/car-search" />
      </Helmet>
      <Header />
      <main>
        <section className="relative min-h-[300px] flex items-center overflow-hidden bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-4 mb-4">
                <Search className="h-12 w-12" />
                <h1 className="text-5xl md:text-6xl font-bold">{t("carSearch.title")}</h1>
              </div>
              <p className="text-xl md:text-2xl text-white/90">
                {t("carSearch.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-foreground">{t("carSearch.customOrderTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                {t("carSearch.customOrderDesc")}
              </p>
            </div>
            <CarSearchForm />
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">{t("carSearch.localTitle")}</h2>
              <p className="text-muted-foreground text-lg">
                {t("carSearch.localDesc")}
              </p>
            </div>
            <FeaturedCars />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CarSearch;
