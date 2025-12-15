import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Search, Calculator, ChevronRight, Info } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";
import LoanApplicationForm from "./LoanApplicationForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Hero = () => {
  const [loanAmount, setLoanAmount] = useState(7000);
  const [loanTerm, setLoanTerm] = useState(72);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const annualInterestRate = 0.069;
  const monthlyAdminFee = 9.5;
  const contractFee = 50;
  
  const monthlyRate = annualInterestRate / 12;
  const monthlyPayment = loanAmount > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
      (Math.pow(1 + monthlyRate, loanTerm) - 1) + monthlyAdminFee
    : 0;
  
  const totalPayment = monthlyPayment * loanTerm + contractFee;

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
          <div className="text-white order-2 lg:order-1 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Calculator className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Paskolos nuo 6.9% metinių palūkanų</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Greitas 
              <span className="text-accent"> Finansavimas</span> be Streso
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white/85 leading-relaxed max-w-xl">
              Platus naudotų automobilių pasirinkimas su finansavimu. Taip pat teikiame paskolas kitoms reikmėms – technikai, remontui ir kt.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white hover:bg-white/90 text-primary font-semibold text-lg px-8 shadow-lg hover:shadow-xl transition-all group"
                onClick={() => document.getElementById('featured-cars')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Search className="mr-2 h-5 w-5" />
                Peržiūrėti Automobilius
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

          {/* Right side - Calculator with conditions */}
          <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  {/* Calculator side */}
                  <div className="p-5 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calculator className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-lg font-bold text-foreground">
                        Paskolos skaičiuoklė
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-foreground">
                            Paskolos suma
                          </label>
                          <span className="text-base font-bold text-primary">{loanAmount.toLocaleString()} €</span>
                        </div>
                        <Slider
                          value={[loanAmount]}
                          onValueChange={(value) => setLoanAmount(value[0])}
                          min={1000}
                          max={30000}
                          step={100}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1 000 €</span>
                          <span>30 000 €</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-foreground">
                            Terminas
                          </label>
                          <span className="text-base font-bold text-primary">{loanTerm} mėn.</span>
                        </div>
                        <Slider
                          value={[loanTerm]}
                          onValueChange={(value) => setLoanTerm(value[0])}
                          min={6}
                          max={144}
                          step={6}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>6 mėn.</span>
                          <span>144 mėn.</span>
                        </div>
                      </div>

                      <div className="bg-primary/5 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-muted-foreground">Mėnesio įmoka nuo</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Skaičiuojama su 6.9% metinėmis palūkanomis + 9.50 € mėn. mokestis.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {monthlyPayment.toFixed(0)} <span className="text-lg">€/mėn.</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Bendra suma: {totalPayment.toFixed(0)} €
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditions side */}
                  <div className="bg-muted/40 p-5 lg:p-6 flex flex-col">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Kredito sąlygos</h4>
                    
                    <div className="space-y-2 flex-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Metinė palūkanų norma</span>
                        <span className="font-semibold text-foreground">6.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paskolos suma</span>
                        <span className="font-semibold text-foreground">1 000 – 30 000 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Terminas</span>
                        <span className="font-semibold text-foreground">6 – 144 mėn.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mėn. mokestis</span>
                        <span className="font-semibold text-foreground">9.50 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sutarties mokestis</span>
                        <span className="font-semibold text-foreground">50 €</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">BVKMNN nuo</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Bendrosios vidutinės kredito kainos metinė norma.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="font-bold text-primary">8.11%</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setIsFormOpen(true)}
                      className="w-full mt-4 btn-gradient font-semibold"
                      size="default"
                    >
                      Gauti pasiūlymą
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
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