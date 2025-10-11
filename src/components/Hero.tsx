import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.95), hsl(var(--primary) / 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Svajonių Automobilis su Lengvu Finansavimu
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Raskite idealų automobilį ir finansavimo planą, pritaikytą jūsų poreikiams
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant="default"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 shadow-lg hover:shadow-xl transition-all"
            >
              <Search className="mr-2 h-5 w-5" />
              Naršyti Automobilius
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm font-semibold text-lg px-8"
            >
              Finansavimo Skaičiuoklė
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
