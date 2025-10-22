import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(7000);
  const [loanTerm, setLoanTerm] = useState(72);
  const [downPayment, setDownPayment] = useState(0);

  // Kredito parametrai
  const annualInterestRate = 0.069; // 6.9% metinė palūkanų norma
  const monthlyAdminFee = 9.5; // Mėnesinis administravimo mokestis
  const contractFee = 50; // Vienkartinis sutarties sudarymo mokestis
  
  const monthlyRate = annualInterestRate / 12;
  const monthlyPayment = loanAmount > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
      (Math.pow(1 + monthlyRate, loanTerm) - 1) + monthlyAdminFee
    : 0;
  
  // Bendros sumos skaičiavimas
  const totalPayment = monthlyPayment * loanTerm + contractFee;
  const totalInterest = totalPayment - loanAmount;
  
  // BVKMNN (APR) - Bendrosios vidutinės kredito kainos metinė norma
  const bvkmnn = 8.32;

  const handleSubmit = () => {
    toast.success("Paraiška pateikta! Netrukus susisieksime su jumis.", {
      description: `Paskolos suma: ${loanAmount}€, Terminas: ${loanTerm} mėn., Mėnesinė įmoka: ${monthlyPayment.toFixed(2)}€`
    });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
                Automobilio paskolos skaičiuoklė
              </h2>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-semibold text-foreground">Standartinis pavyzdys:</span> Palūkanos gali kisti pagal kredito reitingą
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Paskolos suma
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-24 h-8 text-right"
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
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1000€</span>
                    <span>30000€</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Paskolos terminas
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="w-24 h-8 text-right"
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
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>6 mėn.</span>
                    <span>144 mėn.</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Pradinis įnašas
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-24 h-8 text-right"
                      />
                      <span className="text-sm text-muted-foreground">€</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Mėnesio įmoka nuo:
                    </span>
                    <span className="text-4xl font-bold text-primary">
                      {monthlyPayment.toFixed(2)} €
                    </span>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Pateikti paraišką
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-foreground text-sm">Kredito informacija</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metinė palūkanų norma:</span>
                      <span className="font-medium text-foreground">6.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mėn. administravimo mokestis:</span>
                      <span className="font-medium text-foreground">9.5 €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sutarties sudarymo mokestis:</span>
                      <span className="font-medium text-foreground">50 €</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 mt-2">
                      <span className="text-muted-foreground">Bendra mokėtina suma:</span>
                      <span className="font-semibold text-foreground">{totalPayment.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Iš jų palūkanos ir mokesčiai:</span>
                      <span className="font-medium text-foreground">{totalInterest.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 mt-2">
                      <span className="text-muted-foreground font-semibold">BVKMNN:</span>
                      <span className="font-bold text-primary">{bvkmnn.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center italic">
                  BVKMNN (Bendrosios vidutinės kredito kainos metinė norma) - tai visi kredito kaštai, 
                  išreikšti metine procentine norma nuo bendros kredito sumos.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground">
              Kaip tai veikia?
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Užpildykite paraišką</h3>
                  <p className="text-muted-foreground">
                    Nurodykite norimą paskolos sumą, terminą ir savo asmens duomenis
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Gaukite pasiūlymą</h3>
                  <p className="text-muted-foreground">
                    Finansinis partneris pateiks asmeninį paskolos pasiūlymą
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Pasirašykite sutartį</h3>
                  <p className="text-muted-foreground">
                    Peržiūrėkite pasiūlymą ir sudarykite paskolos sutartį patogiu internetu
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Gaukite paskolą</h3>
                  <p className="text-muted-foreground">
                    Paskolos pinigai netrukus bus pervesti jums į asmeninę banko sąskaitą
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoanCalculator;
