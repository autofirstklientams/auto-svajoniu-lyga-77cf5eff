import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingDown, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FinancingSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Calculator,
      titleKey: "financing.flexiblePlans",
      descKey: "financing.flexiblePlansDesc",
    },
    {
      icon: TrendingDown,
      titleKey: "financing.lowRates",
      descKey: "financing.lowRatesDesc",
    },
    {
      icon: Clock,
      titleKey: "financing.quickApproval",
      descKey: "financing.quickApprovalDesc",
    },
  ];

  const handleCalculate = () => {
    // Scroll to calculator in Hero section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t("financing.title")}</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t("financing.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-xl font-bold mb-2 text-white">{t(feature.titleKey)}</h3>
                <p className="text-white/80">{t(feature.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            className="bg-white hover:bg-white/90 text-primary font-semibold text-lg px-8 shadow-lg"
            onClick={handleCalculate}
          >
            {t("financing.calculate")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinancingSection;
