import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
    <>
      <Header />
      <header className="bg-gradient-to-b from-background to-muted/40">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                Parduosime tavo automobilį
              </h1>
              <p className="text-muted-foreground text-base md:text-lg mb-6">
                Palik savo automobilį parduoti pas mus ir gauk maksimalų rezultatą be vargo.
                Mes pasirūpinsime viskuo: nuo profesionalių nuotraukų ir skelbimų iki derybų su pirkėjais ir dokumentų sutvarkymo.
              </p>
              <ul className="grid gap-3 text-sm md:text-base text-foreground">
                <li>• Profesionalios nuotraukos ir išsamūs skelbimai</li>
                <li>• Potencialių pirkėjų atranka ir apžiūros</li>
                <li>• Derybos ir saugus atsiskaitymas</li>
                <li>• Visų dokumentų sutvarkymas</li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
                  Pateikti užklausą
                </Button>
                <a href="tel:+37062851439">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    +370 628 51439
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src={hero}
                alt="AutoKopers pardavimo paslauga – pasirūpinsime tavo automobilio pardavimu"
                className="rounded-lg shadow"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <article className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Kaip tai veikia?</h2>
              <p className="text-muted-foreground">Trumpai: užklausa → įvertinimas → sutartis → pardavimas → išmokėjimas.</p>
            </article>
            <article className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Kodėl mes?</h2>
              <p className="text-muted-foreground">Patirtis, skaidrumas ir greitis. Dirbame taip, kad tau būtų maksimaliai paprasta.</p>
            </article>
            <article className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Kiek tai kainuoja?</h2>
              <p className="text-muted-foreground">Komisinis mokestis suderinamas individualiai, priklausomai nuo automobilio ir paslaugų apimties.</p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
      <CarPurchaseForm open={open} onOpenChange={setOpen} />
    </>
  );
}
