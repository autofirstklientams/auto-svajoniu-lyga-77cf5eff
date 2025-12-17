import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import InvoiceForm, { InvoiceData, InvoiceItem, InvoiceType, CarDetails } from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import InvoiceHistory from "@/components/InvoiceHistory";
import { useInvoices, SavedInvoice } from "@/hooks/useInvoices";
import logo from "@/assets/logo.png";
import { VatType, bankAccounts } from "@/data/suppliers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Invoice = () => {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [editingData, setEditingData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { invoices, loading: invoicesLoading, lastInvoiceNumber, saveInvoice, deleteInvoice } =
    useInvoices();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Prašome prisijungti");
        navigate("/auth");
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGenerate = async (data: InvoiceData) => {
    const saved = await saveInvoice(data);
    if (saved) {
      setInvoiceData(data);
    }
  };

  const handleViewSaved = (invoice: SavedInvoice) => {
    const itemsWithVat: InvoiceItem[] = invoice.items.map(item => ({
      ...item,
      vatType: (item.vatType as VatType) || "vat_exempt",
    }));

    const carDetails: CarDetails | undefined = invoice.invoice_type === "car_sale" && (invoice.car_vin || invoice.car_plate || invoice.car_mileage || invoice.car_notes || invoice.car_make || invoice.car_model)
      ? {
          make: invoice.car_make || "",
          model: invoice.car_model || "",
          vin: invoice.car_vin || "",
          plate: invoice.car_plate || "",
          sdk: "",
          mileage: invoice.car_mileage?.toString() || "",
          notes: invoice.car_notes || "",
          isMarginScheme: invoice.is_margin_scheme || false,
        }
      : undefined;

    setInvoiceData({
      invoiceNumber: invoice.invoice_number,
      date: invoice.invoice_date,
      buyer: {
        id: "saved",
        name: invoice.buyer_name,
        companyCode: invoice.buyer_company_code,
        vatCode: invoice.buyer_vat_code || "",
        address: invoice.buyer_address,
        isCompany: invoice.buyer_is_company,
      },
      items: itemsWithVat,
      note: invoice.note || "",
      invoiceType: invoice.invoice_type || "commission",
      carDetails,
      attachments: invoice.attachments,
      bankAccount: bankAccounts[0],
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Kraunama...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 animate-fade-in print:hidden">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Grįžti
              </Link>
            </Button>
            <img src={logo} alt="Auto Kopers" className="h-10" />
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center">
            Sąskaitų Generatorius
          </h1>
        </header>

        {invoiceData ? (
          <InvoicePreview
            data={invoiceData}
            onBack={() => {
              setInvoiceData(null);
              setEditingData(null);
            }}
            onEdit={() => {
              setEditingData(invoiceData);
              setInvoiceData(null);
            }}
          />
        ) : (
          <div className="space-y-8">
            <InvoiceForm
              onGenerate={handleGenerate}
              nextInvoiceNumber={lastInvoiceNumber + 1}
              initialData={editingData}
              onClearInitialData={() => setEditingData(null)}
            />
            <InvoiceHistory
              invoices={invoices}
              loading={invoicesLoading}
              onView={handleViewSaved}
              onDelete={deleteInvoice}
            />
          </div>
        )}

        <footer className="text-center mt-12 pb-6 text-sm text-muted-foreground print:hidden">
          <p>© 2025 MB "Autodealeriai" · autokopers.lt</p>
        </footer>
      </div>
    </main>
  );
};

export default Invoice;
