import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

interface LoanCalculatorProps {
  carPrice: number;
  compact?: boolean;
}

const INTEREST_RATE = 0.089; // 8.9% annual interest rate
const DEFAULT_DOWN_PAYMENT_PERCENT = 0.15; // 15% down payment

export const calculateMonthlyPayment = (
  price: number,
  months: number = 60,
  downPaymentPercent: number = DEFAULT_DOWN_PAYMENT_PERCENT
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

const LoanCalculator = ({ carPrice, compact = false }: LoanCalculatorProps) => {
  const [months, setMonths] = useState(60);

  const monthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(carPrice, months);
  }, [carPrice, months]);

  const downPayment = useMemo(() => {
    return Math.round(carPrice * DEFAULT_DOWN_PAYMENT_PERCENT);
  }, [carPrice]);

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
            max={84}
            step={6}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 mėn.</span>
            <span>84 mėn.</span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pradinis įnašas (15%)</span>
            <span className="font-medium text-foreground">{formatPrice(downPayment)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bendra suma</span>
            <span className="font-medium text-foreground">{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
            <span className="font-medium text-foreground">Mėnesinė įmoka</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(monthlyPayment)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          * Skaičiavimas orientacinis. Tikslias sąlygas sužinosite pateikę lizingo paraišką. 
          Metinė palūkanų norma: {(INTEREST_RATE * 100).toFixed(1)}%.
        </p>
      </CardContent>
    </Card>
  );
};

export default LoanCalculator;
