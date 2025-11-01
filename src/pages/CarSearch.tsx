import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCars from "@/components/FeaturedCars";
import { Search } from "lucide-react";

const CarSearch = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative min-h-[300px] flex items-center overflow-hidden bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-4 mb-4">
                <Search className="h-12 w-12" />
                <h1 className="text-5xl md:text-6xl font-bold">Auto paieška</h1>
              </div>
              <p className="text-xl md:text-2xl text-white/90">
                Raskite sau tinkamiausią automobilį iš mūsų plataus asortimento
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Mūsų automobiliai</h2>
              <p className="text-muted-foreground text-lg">
                Siūlome platų naudotų automobilių pasirinkimą su garantija ir galimybe gauti finansavimą. 
                Visi automobiliai yra kruopščiai patikrinti ir paruošti pardavimui.
              </p>
            </div>
            
            <FeaturedCars />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CarSearch;
