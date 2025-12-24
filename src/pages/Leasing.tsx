import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, ChevronRight, Info, Clock, FileCheck, CreditCard, CheckCircle2, Shield, TrendingDown, Users, Scale } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoanApplicationForm from "@/components/LoanApplicationForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Leasing = () => {
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanTerm, setLoanTerm] = useState(60);
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

  const steps = [
    { icon: FileCheck, title: "Užpildykite paraišką", desc: "Nurodykite paskolos sumą ir terminą" },
    { icon: Clock, title: "Gaukite pasiūlymą", desc: "Atsakymas per 24 val." },
    { icon: CreditCard, title: "Pasirašykite sutartį", desc: "Patogiai internetu" },
    { icon: CheckCircle2, title: "Gaukite pinigus", desc: "Tiesiogiai į sąskaitą" },
  ];

  const benefits = [
    {
      icon: Scale,
      title: "Palyginame sąlygas",
      description: "Surandame geriausią pasiūlymą iš kelių finansų partnerių"
    },
    {
      icon: TrendingDown,
      title: "Žemos palūkanos",
      description: "Konkurencingos palūkanų normos nuo 6.9% metinių"
    },
    {
      icon: Clock,
      title: "Greitas sprendimas",
      description: "Atsakymas per 24 valandas, pinigai - per 1-2 dienas"
    },
    {
      icon: Users,
      title: "Individuali konsultacija",
      description: "Padėsime pasirinkti tinkamiausią finansavimo variantą"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary/90 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Finansavimas
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Greitas ir paprastas procesas – gaukite finansavimą per 24 valandas su žemiausiomis palūkanomis rinkoje
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Kaip veikia finansavimas?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border hover:shadow-lg hover:border-primary/30 transition-all"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                    index === steps.length - 1 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent text-accent-foreground'
                  }`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Žingsnis {index + 1}</div>
                  <h3 className="font-semibold text-sm mb-1 text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Paskaičiuokite mėnesinę įmoką</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Naudokite skaičiuoklę ir sužinokite preliminarią mėnesinę įmoką
            </p>
            
            <Card className="shadow-xl border-0 max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  {/* Calculator side */}
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Paskolos skaičiuoklė</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-medium text-foreground">Paskolos suma</label>
                          <span className="text-lg font-bold text-primary">{loanAmount.toLocaleString()} €</span>
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
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-medium text-foreground">Terminas</label>
                          <span className="text-lg font-bold text-primary">{loanTerm} mėn.</span>
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

                      <div className="bg-primary/5 rounded-xl p-4">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm text-muted-foreground">Mėnesio įmoka nuo</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Skaičiuojama su 6.9% metinėmis palūkanomis + 9.50 € mėn. mokestis.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-4xl font-bold text-primary">
                          {monthlyPayment.toFixed(0)} <span className="text-xl">€/mėn.</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Bendra grąžintina suma: {totalPayment.toFixed(0)} €
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditions side */}
                  <div className="bg-muted/40 p-6 lg:p-8 flex flex-col">
                    <h4 className="font-semibold text-foreground mb-4">Kredito sąlygos</h4>
                    
                    <div className="space-y-3 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Metinė palūkanų norma</span>
                        <span className="font-semibold text-foreground">6.9%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Paskolos suma</span>
                        <span className="font-semibold text-foreground">1 000 € – 30 000 €</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Terminas</span>
                        <span className="font-semibold text-foreground">6 – 144 mėn.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mėn. administravimo mokestis</span>
                        <span className="font-semibold text-foreground">9.50 €</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sutarties mokestis</span>
                        <span className="font-semibold text-foreground">50 €</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">BVKMNN nuo</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
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
                      className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                      size="lg"
                    >
                      Pateikti paraišką
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Kodėl rinktis mus?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Pasiruošę pradėti?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Užpildykite paraišką dabar ir gaukite pasiūlymą per 24 valandas
            </p>
            <Button 
              onClick={() => setIsFormOpen(true)}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8"
            >
              Gauti pasiūlymą
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />

      <LoanApplicationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        loanAmount={loanAmount}
        loanTerm={loanTerm}
        monthlyPayment={monthlyPayment}
      />
    </div>
  );
};

export default Leasing;