import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import CarPurchaseForm from "@/components/CarPurchaseForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import hero from "@/assets/hero-car.jpg";

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const ensureCanonical = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export default function SellYourCar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "Parduosime tavo automobilį | AutoKopers";
    setMeta(
      "description",
      "Palik automobilį parduoti AutoKopers – pasirūpinsime skelbimais, pirkėjais ir dokumentais. Greita, saugu, patogu."
    );
    ensureCanonical(window.location.origin + "/sell-your-car");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Parduosime tavo automobilį
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Palik savo automobilį parduoti pas mus ir gauk maksimalų rezultatą be vargo.
                Mes pasirūpinsime viskuo: nuo profesionalių nuotraukų ir skelbimų iki derybų su pirkėjais ir dokumentų sutvarkymo.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg mb-6">
                <ul className="grid gap-3 text-base text-white">
                  <li>✓ Profesionalios nuotraukos ir išsamūs skelbimai</li>
                  <li>✓ Potencialių pirkėjų atranka ir apžiūros</li>
                  <li>✓ Derybos ir saugus atsiskaitymas</li>
                  <li>✓ Visų dokumentų sutvarkymas</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setOpen(true)} 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  Pateikti užklausą
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


        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <article className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">Kaip tai veikia?</h2>
                  <p className="text-muted-foreground">Trumpai: užklausa → įvertinimas → sutartis → pardavimas → išmokėjimas.</p>
                </article>
                <article className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">Kodėl mes?</h2>
                  <p className="text-muted-foreground">Patirtis, skaidrumas ir greitis. Dirbame taip, kad tau būtų maksimaliai paprasta.</p>
                </article>
                <article className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">Kiek tai kainuoja?</h2>
                  <p className="text-muted-foreground">Komisinis mokestis suderinamas individualiai, priklausomai nuo automobilio ir paslaugų apimties.</p>
                </article>
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
