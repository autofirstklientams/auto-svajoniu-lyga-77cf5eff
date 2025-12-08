import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoanApplicationForm from "./LoanApplicationForm";

interface LoanCalculatorProps {
  showCalculator?: boolean;
}

const LoanCalculator = ({ showCalculator = true }: LoanCalculatorProps) => {
  const [loanAmount, setLoanAmount] = useState(7000);
  const [loanTerm, setLoanTerm] = useState(72);
  const [downPayment, setDownPayment] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Kredito parametrai
  const annualInterestRate = 0.069;
  const monthlyAdminFee = 9.5;
  const contractFee = 50;
  
  const termBasedRate = 9.11 - ((loanTerm - 6) / (144 - 6)) * (9.11 - 8.11);
  const amountAdjustment = 0.5 - ((loanAmount - 1000) / (30000 - 1000)) * (0.5 + 0.3);
  const bvkmnn = termBasedRate + amountAdjustment;
  
  const monthlyRate = annualInterestRate / 12;
  const monthlyPayment = loanAmount > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
      (Math.pow(1 + monthlyRate, loanTerm) - 1) + monthlyAdminFee
    : 0;
  
  const totalPayment = monthlyPayment * loanTerm + contractFee;
  const totalInterest = totalPayment - loanAmount;

  const handleSubmit = () => {
    setIsFormOpen(true);
  };

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

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* How it works section */}
          <div className="space-y-6">
            <div className="flex gap-4 p-4 rounded-xl bg-background border border-border hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-foreground">Užpildykite paraišką</h3>
                <p className="text-muted-foreground">
                  Nurodykite norimą paskolos sumą, terminą ir savo asmens duomenis
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-background border border-border hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-foreground">Gaukite pasiūlymą</h3>
                <p className="text-muted-foreground">
                  Finansinis partneris pateiks asmeninį paskolos pasiūlymą per 24 val.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-background border border-border hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-foreground">Pasirašykite sutartį</h3>
                <p className="text-muted-foreground">
                  Peržiūrėkite pasiūlymą ir sudarykite paskolos sutartį patogiai internetu
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-foreground">Gaukite paskolą</h3>
                <p className="text-muted-foreground">
                  Paskolos pinigai bus pervesti į jūsų banko sąskaitą
                </p>
              </div>
            </div>
          </div>

          {/* Credit info card */}
          <Card className="shadow-lg">
            <CardContent className="p-6 lg:p-8">
              <h3 className="text-xl font-bold mb-6 text-foreground">Kredito sąlygos</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Metinė palūkanų norma</span>
                  <span className="font-semibold text-foreground text-lg">6.9%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Paskolos suma</span>
                  <span className="font-semibold text-foreground">1 000 € – 30 000 €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Terminas</span>
                  <span className="font-semibold text-foreground">6 – 144 mėn.</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Mėn. administravimo mokestis</span>
                  <span className="font-semibold text-foreground">9.50 €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Sutarties sudarymo mokestis</span>
                  <span className="font-semibold text-foreground">50 €</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-4 -mx-4">
                  <span className="font-semibold text-foreground">BVKMNN nuo</span>
                  <span className="font-bold text-primary text-xl">8.11%</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-6 italic">
                BVKMNN (Bendrosios vidutinės kredito kainos metinė norma) – visi kredito kaštai, 
                išreikšti metine procentine norma.
              </p>

              <Button 
                onClick={handleSubmit}
                className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Pateikti paraišką
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LoanCalculator;
