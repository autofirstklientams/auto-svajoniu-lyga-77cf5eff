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
                Parduosime tavo automobilį
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Palik savo automobilį parduoti pas mus ir gauk maksimalų rezultatą be vargo.
                Mes pasirūpinsime viskuo: nuo profesionalių nuotraukų ir skelbimų iki derybų su pirkėjais ir dokumentų sutvarkymo.
              </p>
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

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Kaip tai veikia?
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">Užklausa</h3>
                  <p className="text-sm text-muted-foreground">Užpildyk formą su automobilio informacija</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">Įvertinimas</h3>
                  <p className="text-sm text-muted-foreground">Susisiekiame ir įvertiname automobilį</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">Pardavimas</h3>
                  <p className="text-sm text-muted-foreground">Skelbiame, rodome ir deramės su pirkėjais</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    4
                  </div>
                  <h3 className="font-semibold mb-2">Išmokėjimas</h3>
                  <p className="text-sm text-muted-foreground">Sutvarkome dokumentus ir išmokame pinigus</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Kodėl pasirinkti mus?
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">📸 Profesionalios paslaugos</h3>
                  <p className="text-muted-foreground">
                    Profesionalios nuotraukos, detalūs skelbimai ir aktyvus rinkodaros darbas užtikrina, 
                    kad tavo automobilis pasiektų kuo platesnę auditoriją.
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">⏱️ Sutaupytas laikas</h3>
                  <p className="text-muted-foreground">
                    Nereikia pačiam rašyti skelbimų, atsakinėti į žinutes, rodyti automobilio 
                    ar derėtis su pirkėjais – visa tai darome mes.
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">🛡️ Saugumas</h3>
                  <p className="text-muted-foreground">
                    Patikrinami pirkėjai, saugus pinigų perdavimas ir pilnas dokumentų sutvarkymas. 
                    Tau nereikia jaudintis dėl sukčiavimo ar biurokratijos.
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">💰 Geriausia kaina</h3>
                  <p className="text-muted-foreground">
                    Padedame nustatyti optimalią kainą, kuri užtikrina greitą pardavimą 
                    ir maksimalią naudą tau. 10+ metų patirtis automobilių rinkoje.
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
                Pasiruošęs parduoti?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Komisinis mokestis suderinamas individualiai, priklausomai nuo automobilio 
                ir paslaugų apimties. Susisiek ir sužinok daugiau!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={() => setOpen(true)} 
                  size="lg"
                  className="font-semibold"
                >
                  Pateikti užklausą
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
