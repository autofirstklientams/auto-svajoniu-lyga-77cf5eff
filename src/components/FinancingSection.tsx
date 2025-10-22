import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingDown, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Lankstūs Planai",
    description: "Pritaikyta finansavimo tvarka pagal jūsų galimybes",
  },
  {
    icon: TrendingDown,
    title: "Žemos Palūkanos",
    description: "Konkurencingos palūkanų normos nuo 3.9% metinių",
  },
  {
    icon: Clock,
    title: "Patvirtinimas per 24 val.",
    description: "Greitas paraiškos nagrinėjimas ir atsakymas",
  },
  {
    icon: Shield,
    title: "Saugūs Sandoriai",
    description: "Patikima ir skaidri finansavimo tvarka",
  },
];

const FinancingSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Finansavimo Sprendimai</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Individualūs finansavimo planai, pritaikyti jūsų poreikiams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 shadow-lg"
          >
            Apskaičiuoti Mėnesinę Įmoką
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinancingSection;
