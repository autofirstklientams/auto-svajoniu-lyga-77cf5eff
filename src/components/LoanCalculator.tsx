import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calculator, ChevronRight, Info, Clock, FileCheck, CreditCard, CheckCircle2 } from "lucide-react";
import LoanApplicationForm from "./LoanApplicationForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LoanCalculatorProps {
  showCalculator?: boolean;
}

const LoanCalculator = ({ showCalculator = true }: LoanCalculatorProps) => {
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

  const handleSubmit = () => {
    setIsFormOpen(true);
  };

  const steps = [
    { icon: FileCheck, title: "Užpildykite paraišką", desc: "Nurodykite paskolos sumą ir terminą" },
    { icon: Clock, title: "Gaukite pasiūlymą", desc: "Atsakymas per 24 val." },
    { icon: CreditCard, title: "Pasirašykite sutartį", desc: "Patogiai internetu" },
    { icon: CheckCircle2, title: "Gaukite pinigus", desc: "Tiesiogiai į sąskaitą" },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4">
        <LoanApplicationForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          loanAmount={loanAmount}
          loanTerm={loanTerm}
          monthlyPayment={monthlyPayment}
        />
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Kaip veikia finansavimas?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paprastas ir greitas procesas – nuo paraiškos iki pinigų gavimo vos per kelias dienas
          </p>
        </div>

        {/* Steps - horizontal on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-background border border-border hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                index === steps.length - 1 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent text-accent-foreground'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1 text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Calculator Card - full width, compact */}
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
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Mėnesio įmoka nuo</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Skaičiuojama su 6.9% metinėmis palūkanomis + 9.50 € mėn. mokestis. Galutinė suma priklauso nuo kredito reitingo.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
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
              <div className="bg-muted/30 p-6 lg:p-8 flex flex-col">
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
                            <p>Bendrosios vidutinės kredito kainos metinė norma – visi kredito kaštai, išreikšti metine procentine norma.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold text-primary">8.11%</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
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
  );
};

export default LoanCalculator;
