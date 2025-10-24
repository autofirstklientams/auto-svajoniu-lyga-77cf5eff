import { Shield, Award, Users, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Patikima Garantija",
    description: "Visi automobiliai su garantija ir draudimu",
  },
  {
    icon: Award,
    title: "15+ Metų Patirtis",
    description: "Ilgametė patirtis automobilių rinkoje",
  },
  {
    icon: Users,
    title: "5000+ Klientų",
    description: "Tūkstančiai patenkintų klientų visoje Lietuvoje",
  },
  {
    icon: Clock,
    title: "Greitas Procesas",
    description: "Finansavimas per 24 valandas",
  },
];

const TrustSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
