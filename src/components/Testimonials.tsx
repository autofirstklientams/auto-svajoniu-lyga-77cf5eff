import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jonas Petraitis",
    text: "Labai greitas ir profesionalus aptarnavimas. Per kelias dienas gavau finansavimą ir savo svajonių automobilį!",
    rating: 5,
  },
  {
    name: "Laura Kazlauskienė",
    text: "Malonus bendravimas, aiškūs pasiūlymai. Rekomenduoju visiems, kurie ieško patikimo automobilio.",
    rating: 5,
  },
  {
    name: "Mindaugas Jonaitis",
    text: "Puiki patirtis! Padėjo išsirinkti automobilį ir sutvarkė visus finansavimo dokumentus be jokio streso.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Mūsų klientai sako</h2>
          <p className="text-xl text-muted-foreground">
            Tūkstančiai patenkintų klientų jau rado savo automobilį
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
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
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
