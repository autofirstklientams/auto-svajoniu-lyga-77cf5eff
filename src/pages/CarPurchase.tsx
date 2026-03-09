import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarPurchaseForm from "@/components/CarPurchaseForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Euro, Clock, Shield, CheckCircle, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CarPurchase = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t, language } = useLanguage();

  const features = [
    {
      icon: Euro,
      title: t("carPurchase.bestPrices"),
      description: t("carPurchase.bestPricesDesc"),
    },
    {
      icon: Clock,
      title: t("carPurchase.fastProcess"),
      description: t("carPurchase.fastProcessDesc"),
    },
    {
      icon: Shield,
      title: t("carPurchase.reliableDeal"),
      description: t("carPurchase.reliableDealDesc"),
    },
    {
      icon: CheckCircle,
      title: t("carPurchase.anyCondition"),
      description: t("carPurchase.anyConditionDesc"),
    },
  ];

  const steps = [
    {
      number: "1",
      title: t("carPurchase.stepContact"),
      description: t("carPurchase.stepContactDesc"),
    },
    {
      number: "2",
      title: t("carPurchase.stepEval"),
      description: t("carPurchase.stepEvalDesc"),
    },
    {
      number: "3",
      title: t("carPurchase.stepDeal"),
      description: t("carPurchase.stepDealDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CarPurchaseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <main>
        <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-4 mb-4">
                <Car className="h-12 w-12" />
                <h1 className="text-5xl md:text-6xl font-bold">{t("carPurchase.title")}</h1>
              </div>
              <p className="text-xl md:text-2xl text-white/90">
                {t("carPurchase.heroDesc")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">{t("carPurchase.whySell")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("carPurchase.whySellDesc")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">{t("carPurchase.howWorks")}</h2>
              <p className="text-xl text-muted-foreground">
                {t("carPurchase.simpleProcess")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4 text-2xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
                    {t("carPurchase.wantToSell")}
                  </h2>
                  <p className="text-center text-muted-foreground text-lg mb-8">
                    {t("carPurchase.wantToSellDesc")}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-muted/30 p-6 rounded-lg text-center">
                      <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-bold mb-2 text-foreground">{t("carPurchase.call")}</h3>
                      <a href="tel:+37062851439" className="text-primary text-lg hover:underline">
                        +370 628 51439
                      </a>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-bold mb-2 text-foreground">{t("carPurchase.workingHours")}</h3>
                      {language === "en" ? (
                        <>
                          <p className="text-muted-foreground">Mon-Fri: 9:00-18:00</p>
                          <p className="text-muted-foreground">Sat: 10:00-16:00</p>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground">Pr-Pt: 9:00-18:00</p>
                          <p className="text-muted-foreground">Št: 10:00-16:00</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <Button 
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8"
                      onClick={() => setIsFormOpen(true)}
                    >
                      {t("carPurchase.submitRequest")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CarPurchase;