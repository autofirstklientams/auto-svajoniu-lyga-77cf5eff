import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calculator, FileText } from "lucide-react";
import LoanApplicationForm from "@/components/LoanApplicationForm";

interface LoanCalculatorProps {
  carPrice: number;
  carInfo?: string;
  compact?: boolean;
}

const INTEREST_RATE = 0.089; // 8.9% annual interest rate

const DOWN_PAYMENT_OPTIONS = [
  { value: 0, label: "Be pradinio įnašo" },
  { value: 0.10, label: "10%" },
  { value: 0.15, label: "15%" },
  { value: 0.20, label: "20%" },
  { value: 0.30, label: "30%" },
];

export const calculateMonthlyPayment = (
  price: number,
  months: number = 60,
  downPaymentPercent: number = 0
): number => {
  const downPayment = price * downPaymentPercent;
  const principal = price - downPayment;
  const monthlyRate = INTEREST_RATE / 12;
  
  if (principal <= 0) return 0;
  
  // PMT formula for loan payment
  const monthlyPayment = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
    (Math.pow(1 + monthlyRate, months) - 1);
  
  return Math.round(monthlyPayment);
};

const LoanCalculator = ({ carPrice, carInfo, compact = false }: LoanCalculatorProps) => {
  const [months, setMonths] = useState(60);
  const [downPaymentPercent, setDownPaymentPercent] = useState(0);
  const [customDownPayment, setCustomDownPayment] = useState<string>("");
  const [useCustomDownPayment, setUseCustomDownPayment] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const downPayment = useMemo(() => {
    if (useCustomDownPayment && customDownPayment) {
      const parsed = parseFloat(customDownPayment);
      return isNaN(parsed) ? 0 : Math.min(parsed, carPrice);
    }
    return Math.round(carPrice * downPaymentPercent);
  }, [carPrice, downPaymentPercent, useCustomDownPayment, customDownPayment]);

  const loanAmount = useMemo(() => {
    return carPrice - downPayment;
  }, [carPrice, downPayment]);

  const monthlyPayment = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = INTEREST_RATE / 12;
    
    if (principal <= 0) return 0;
    
    const payment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(payment);
  }, [loanAmount, months]);

  const totalAmount = useMemo(() => {
    return downPayment + monthlyPayment * months;
  }, [downPayment, monthlyPayment, months]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calculator className="h-3.5 w-3.5" />
        <span>nuo <span className="font-semibold text-primary">{formatPrice(monthlyPayment)}</span>/mėn.</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Lizingo skaičiuoklė
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Car price display */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Automobilio kaina</p>
          <p className="text-2xl font-bold text-foreground">{formatPrice(carPrice)}</p>
        </div>

        {/* Down payment options */}
        <div className="space-y-3">
          <span className="text-sm text-muted-foreground">Pradinis įnašas</span>
          <RadioGroup
            value={useCustomDownPayment ? "custom" : downPaymentPercent.toString()}
            onValueChange={(v) => {
              if (v === "custom") {
                setUseCustomDownPayment(true);
              } else {
                setUseCustomDownPayment(false);
                setDownPaymentPercent(parseFloat(v));
              }
            }}
            className="flex flex-wrap gap-2"
          >
            {DOWN_PAYMENT_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center">
                <RadioGroupItem
                  value={option.value.toString()}
                  id={`down-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`down-${option.value}`}
                  className="cursor-pointer rounded-lg border-2 border-muted bg-popover px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-colors"
                >
                  {option.label}
                </Label>
              </div>
            ))}
            <div className="flex items-center">
              <RadioGroupItem
                value="custom"
                id="down-custom"
                className="peer sr-only"
              />
              <Label
                htmlFor="down-custom"
                className="cursor-pointer rounded-lg border-2 border-muted bg-popover px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-colors"
              >
                Kita suma
              </Label>
            </div>
          </RadioGroup>
          
          {useCustomDownPayment && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Įveskite sumą"
                value={customDownPayment}
                onChange={(e) => setCustomDownPayment(e.target.value)}
                min={0}
                max={carPrice}
                className="max-w-[180px]"
              />
              <span className="text-sm text-muted-foreground">€</span>
            </div>
          )}
        </div>

        {/* Loan period slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Laikotarpis</span>
            <span className="font-semibold text-foreground">{months} mėn.</span>
          </div>
          <Slider
            value={[months]}
            onValueChange={(value) => setMonths(value[0])}
            min={12}
            max={144}
            step={6}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 mėn.</span>
            <span>144 mėn.</span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3 pt-4 border-t">
          {downPaymentPercent > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pradinis įnašas ({(downPaymentPercent * 100).toFixed(0)}%)</span>
              <span className="font-medium text-foreground">{formatPrice(downPayment)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bendra suma</span>
            <span className="font-medium text-foreground">{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
            <span className="font-medium text-foreground">Mėnesinė įmoka</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(monthlyPayment)}</span>
          </div>
        </div>

        {/* Leasing application button */}
        <Button className="w-full" size="lg" onClick={() => setShowApplicationForm(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Pateikti lizingo paraišką
        </Button>

        <LoanApplicationForm
          open={showApplicationForm}
          onOpenChange={setShowApplicationForm}
          loanAmount={loanAmount}
          loanTerm={months}
          monthlyPayment={monthlyPayment}
          carInfo={carInfo}
        />

        <p className="text-xs text-muted-foreground">
          * Skaičiavimas orientacinis. Tikslias sąlygas sužinosite pateikę lizingo paraišką. 
          Metinė palūkanų norma: {(INTEREST_RATE * 100).toFixed(1)}%.
        </p>
      </CardContent>
    </Card>
  );
};

export default LoanCalculator;
