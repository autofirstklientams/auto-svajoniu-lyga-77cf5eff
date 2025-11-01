import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Users, Award, Target } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Apie mus</h1>
              <p className="text-xl md:text-2xl text-white/90">
                Jūsų patikimas partneris automobilio finansavimo srityje
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold mb-6 text-foreground">Kas mes esame?</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  AutoKOPERS – tai automobilių pardavimo ir finansavimo bendrovė, teikianti patikimus sprendimus jau daugiau nei 10 metų. 
                  Mūsų tikslas – padėti kiekvienam rasti savo svajonių automobilį su lankstaus finansavimo galimybėmis.
                </p>
                <p className="text-muted-foreground text-lg mb-6">
                  Mes siūlome platų naudotų automobilių pasirinkimą, garantijuojame jų kokybę ir teikiame visapusišką pagalbą 
                  visose pirkimo stadijose – nuo automobilio pasirinkimo iki finansavimo sutarties sudarymo.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <Target className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">Mūsų misija</h3>
                  <p className="text-muted-foreground">
                    Suteikti kiekvienam galimybę įsigyti automobilį su patogiu ir lanksčiu finansavimu, 
                    užtikrinant skaidrumą ir patikimumą visame procese.
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <Award className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">Mūsų vertybės</h3>
                  <p className="text-muted-foreground">
                    Sąžiningumas, profesionalumas ir klientų pasitenkinimas – tai vertybės, 
                    kuriomis grindžiame savo veiklą kiekvieną dieną.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Kodėl pasirinkti mus?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Patikimumas</h3>
                <p className="text-muted-foreground">
                  Visi automobiliai patikrinti ir su garantija
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">10+ metų patirtis</h3>
                <p className="text-muted-foreground">
                  Ilgametė patirtis automobilių rinkoje
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Lankstus finansavimas</h3>
                <p className="text-muted-foreground">
                  Individualūs sprendimai kiekvienam klientui
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Susisiekite su mumis</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Turite klausimų? Mūsų komanda pasiruošusi padėti!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/#contact"
                  className="inline-flex items-center justify-center h-11 rounded-md px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors"
                >
                  Susisiekti
                </a>
                <a 
                  href="/#financing"
                  className="inline-flex items-center justify-center h-11 rounded-md px-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold transition-colors"
                >
                  Gauti pasiūlymą
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
