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
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const [loanAmount, setLoanAmount] = useState(7000);
  const [loanTerm, setLoanTerm] = useState(72);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t } = useLanguage();

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
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content (hidden on mobile) */}
          <div className="text-white order-2 lg:order-1 animate-fade-in hidden lg:block">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Calculator className="h-4 w-4 text-white" />
              <span className="text-sm font-medium">{t("hero.badge")}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")}{" "}
              <span className="text-white">
                {t("hero.titleHighlight")}
              </span>{" "}
              {t("hero.titleEnd")}
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white/85 leading-relaxed max-w-xl">
              {t("hero.description")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white hover:bg-white/90 text-primary font-semibold text-lg px-8 shadow-lg hover:shadow-xl transition-all group"
                onClick={() => document.getElementById('featured-cars')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Search className="mr-2 h-5 w-5" />
                {t("hero.viewCars")}
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-white/70">{t("hero.satisfiedClients")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24h</div>
                  <div className="text-sm text-white/70">{t("hero.decision")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">6.9%</div>
                  <div className="text-sm text-white/70">{t("hero.interestFrom")}</div>
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
                        {t("hero.calculator")}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-foreground">
                            {t("hero.loanAmount")}
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
                            {t("hero.term")}
                          </label>
                          <span className="text-base font-bold text-primary">{loanTerm} {t("hero.months")}</span>
                        </div>
                        <Slider
                          value={[loanTerm]}
                          onValueChange={(value) => setLoanTerm(value[0])}
                          min={6}
                          max={144}
                          step={6}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>6 {t("hero.months")}</span>
                          <span>144 {t("hero.months")}</span>
                        </div>
                      </div>

                      <div className="bg-primary/5 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-muted-foreground">{t("hero.monthlyPaymentFrom")}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{t("hero.calculatorTooltip")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {monthlyPayment.toFixed(0)} <span className="text-lg">{t("hero.perMonth")}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t("hero.totalAmount")}: {totalPayment.toFixed(0)} €
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditions side */}
                  <div className="bg-muted/40 p-5 lg:p-6 flex flex-col">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">{t("hero.loanConditions")}</h4>
                    
                    <div className="space-y-2 flex-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("hero.annualRate")}</span>
                        <span className="font-semibold text-foreground">6.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("hero.loanSum")}</span>
                        <span className="font-semibold text-foreground">1 000 – 30 000 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("hero.term")}</span>
                        <span className="font-semibold text-foreground">6 – 144 {t("hero.months")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("hero.monthlyFee")}</span>
                        <span className="font-semibold text-foreground">9.50 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("hero.contractFee")}</span>
                        <span className="font-semibold text-foreground">50 €</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">{t("hero.bvkmnFrom")}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{t("hero.bvkmnTooltip")}</p>
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
                      {t("hero.getOffer")}
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
