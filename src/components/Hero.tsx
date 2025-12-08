import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Search, Calculator, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";
import LoanApplicationForm from "./LoanApplicationForm";

const Hero = () => {
  const [loanAmount, setLoanAmount] = useState(7000);
  const [loanTerm, setLoanTerm] = useState(72);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const annualInterestRate = 0.069;
  const monthlyAdminFee = 9.5;
  
  const monthlyRate = annualInterestRate / 12;
  const monthlyPayment = loanAmount > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
      (Math.pow(1 + monthlyRate, loanTerm) - 1) + monthlyAdminFee
    : 0;

  return (
    <section className="relative min-h-[700px] flex items-center overflow-hidden py-12 lg:py-0">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.95) 50%, hsl(var(--primary) / 0.85) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-white order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Calculator className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Finansavimas nuo 6.9% metinių palūkanų</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Greitas Automobilio 
              <span className="text-accent"> Finansavimas</span> be Streso
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white/85 leading-relaxed max-w-xl">
              Platus naudotų automobilių pasirinkimas – patikima garantija ir paprasti sprendimai. Gaukite pasiūlymą per 5 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 shadow-lg hover:shadow-xl transition-all group"
                onClick={() => document.getElementById('featured-cars')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Search className="mr-2 h-5 w-5" />
                Peržiūrėti Automobilius
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm font-semibold text-lg px-8"
                onClick={() => document.getElementById('loan-details')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Sužinoti daugiau
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">500+</div>
                  <div className="text-sm text-white/70">Patenkintų klientų</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">24h</div>
                  <div className="text-sm text-white/70">Sprendimas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">6.9%</div>
                  <div className="text-sm text-white/70">Palūkanos nuo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Calculator */}
          <div className="order-1 lg:order-2">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Paskolos skaičiuoklė
                    </h2>
                    <p className="text-sm text-muted-foreground">Apskaičiuokite mėnesinę įmoką</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Paskolos suma
                      </label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-20 h-7 text-right text-sm"
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                      </div>
                    </div>
                    <Slider
                      value={[loanAmount]}
                      onValueChange={(value) => setLoanAmount(value[0])}
                      min={1000}
                      max={30000}
                      step={100}
                      className="mb-1"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 000 €</span>
                      <span>30 000 €</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Terminas
                      </label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(Number(e.target.value))}
                          className="w-20 h-7 text-right text-sm"
                        />
                        <span className="text-sm text-muted-foreground">mėn.</span>
                      </div>
                    </div>
                    <Slider
                      value={[loanTerm]}
                      onValueChange={(value) => setLoanTerm(value[0])}
                      min={6}
                      max={144}
                      step={6}
                      className="mb-1"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>6 mėn.</span>
                      <span>144 mėn.</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-sm text-muted-foreground">
                        Mėnesio įmoka nuo:
                      </span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-primary">
                          {monthlyPayment.toFixed(0)}
                        </span>
                        <span className="text-xl font-bold text-primary"> €</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setIsFormOpen(true)}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                      size="lg"
                    >
                      Gauti pasiūlymą
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      * Palūkanos gali kisti pagal kredito reitingą
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LoanApplicationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        loanAmount={loanAmount}
        loanTerm={loanTerm}
        monthlyPayment={monthlyPayment}
      />
    </section>
  );
};

export default Hero;
