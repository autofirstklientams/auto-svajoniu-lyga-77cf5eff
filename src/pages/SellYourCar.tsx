import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Helmet } from "react-helmet";
import CarPurchaseForm from "@/components/CarPurchaseForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import hero from "@/assets/hero-car.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SellYourCar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative min-h-[500px] flex items-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hero})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10 py-16">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("sellCar.heroTitle")}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                {t("sellCar.heroDesc")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setOpen(true)} 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  {t("sellCar.submitRequest")}
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  size="lg" 
                  className="border-white bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold backdrop-blur-sm"
                >
                  <a href="tel:+37062851439" className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    +370 628 51439
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                {t("sellCar.howWorks")}
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">{t("sellCar.step1")}</h3>
                  <p className="text-sm text-muted-foreground">{t("sellCar.step1Desc")}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">{t("sellCar.step2")}</h3>
                  <p className="text-sm text-muted-foreground">{t("sellCar.step2Desc")}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">{t("sellCar.step3")}</h3>
                  <p className="text-sm text-muted-foreground">{t("sellCar.step3Desc")}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    4
                  </div>
                  <h3 className="font-semibold mb-2">{t("sellCar.step4")}</h3>
                  <p className="text-sm text-muted-foreground">{t("sellCar.step4Desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                {t("sellCar.whyChoose")}
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">📸 {t("sellCar.professional")}</h3>
                  <p className="text-muted-foreground">
                    {t("sellCar.professionalDesc")}
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">⏱️ {t("sellCar.timeSaved")}</h3>
                  <p className="text-muted-foreground">
                    {t("sellCar.timeSavedDesc")}
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">🛡️ {t("sellCar.safety")}</h3>
                  <p className="text-muted-foreground">
                    {t("sellCar.safetyDesc")}
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">💰 {t("sellCar.bestPrice")}</h3>
                  <p className="text-muted-foreground">
                    {t("sellCar.bestPriceDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                {t("sellCar.readyToSell")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t("sellCar.readyToSellDesc")}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={() => setOpen(true)} 
                  size="lg"
                  className="font-semibold"
                >
                  {t("sellCar.submitRequest")}
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  size="lg"
                  className="font-semibold"
                >
                  <a href="tel:+37062851439" className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    +370 628 51439
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CarPurchaseForm open={open} onOpenChange={setOpen} />
    </div>
  );
}