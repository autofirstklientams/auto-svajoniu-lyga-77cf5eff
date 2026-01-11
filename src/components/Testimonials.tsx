import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    name: "Tomas Pauliukaitis",
    textLt: "Labai greitas ir profesionalus aptarnavimas. Per kelias dienas gavau finansavimą ir savo svajonių automobilį!",
    textEn: "Very fast and professional service. In just a few days I got financing and my dream car!",
    rating: 5,
  },
  {
    name: "Laura Kazlauskienė",
    textLt: "Malonus bendravimas, aiškūs pasiūlymai. Rekomenduoju visiems, kurie ieško patikimo automobilio.",
    textEn: "Pleasant communication, clear offers. I recommend to everyone looking for a reliable car.",
    rating: 5,
  },
  {
    name: "Rimvydas Silnevič",
    textLt: "Puiki patirtis! Padėjo išsirinkti automobilį ir sutvarkė visus finansavimo dokumentus be jokio streso.",
    textEn: "Great experience! They helped me choose a car and handled all financing documents stress-free.",
    rating: 5,
  },
];

const Testimonials = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t("testimonials.title")}</h2>
          <p className="text-xl text-muted-foreground">
            {t("testimonials.description")}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{language === "lt" ? testimonial.textLt : testimonial.textEn}"
                </p>
                <p className="font-semibold">– {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
