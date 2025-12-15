import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Trash2, FileText, Loader2 } from "lucide-react";
import { SavedInvoice } from "@/hooks/useInvoices";

interface InvoiceHistoryProps {
  invoices: SavedInvoice[];
  loading: boolean;
  onView: (invoice: SavedInvoice) => void;
  onDelete: (id: string) => void;
}

const InvoiceHistory = ({ invoices, loading, onView, onDelete }: InvoiceHistoryProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("lt-LT");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "car_sale":
        return "Automobilio pardavimas";
      case "service":
        return "Paslaugos";
      default:
        return "Komisinis mokestis";
    }
  };

  if (loading) {
    return (
      <Card className="form-section">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Kraunama...</span>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="form-section">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Dar nėra išsaugotų sąskaitų</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Sukurtos sąskaitos bus rodomos čia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="form-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Sąskaitų istorija ({invoices.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    Nr. {invoice.invoice_number}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {getTypeLabel(invoice.invoice_type)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {invoice.buyer_name}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(invoice.invoice_date)}</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(invoice)}
                  title="Peržiūrėti"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Ar tikrai norite ištrinti šią sąskaitą?")) {
                      onDelete(invoice.id);
                    }
                  }}
                  title="Ištrinti"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceHistory;
