import { Shield, Award, Users, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TrustSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      titleKey: "trust.reliable",
      descKey: "trust.reliableDesc",
    },
    {
      icon: Award,
      titleKey: "trust.experience",
      descKey: "trust.experienceDesc",
    },
    {
      icon: Users,
      titleKey: "trust.lowRates",
      descKey: "trust.lowRatesDesc",
    },
    {
      icon: Clock,
      titleKey: "trust.fastProcess",
      descKey: "trust.fastProcessDesc",
    },
  ];

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground">{t(feature.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
