import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { InvoiceData } from "./InvoiceForm";
import { sellerInfo, vatTypeLabels, VatType } from "@/data/suppliers";
import logo from "@/assets/logo.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoicePreviewProps {
  data: InvoiceData;
  onBack: () => void;
}

const InvoicePreview = ({ data, onBack }: InvoicePreviewProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("lt-LT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const calculateVat = (price: number, vatType: VatType) => {
    if (vatType === "with_vat") {
      return price * 0.21;
    }
    return 0;
  };

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalVat = data.items.reduce(
    (sum, item) => sum + calculateVat(item.quantity * item.price, item.vatType),
    0
  );
  const total = subtotal + totalVat;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Saskaita-${data.invoiceNumber}.pdf`);
  };

  const getInvoiceTitle = () => {
    switch (data.invoiceType) {
      case "car_sale":
        return "PVM SĄSKAITA FAKTŪRA";
      case "service":
        return "PVM SĄSKAITA FAKTŪRA";
      default:
        return "PVM SĄSKAITA FAKTŪRA";
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atgal
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Spausdinti
        </Button>
        <Button className="btn-gradient" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Atsisiųsti PDF
        </Button>
      </div>

      {/* Invoice */}
      <div ref={invoiceRef} className="invoice-container bg-card p-8 animate-fade-in">
        {/* Header */}
        <div className="invoice-header -m-8 mb-6 p-8">
          <div className="flex justify-between items-start">
            <div>
              <img src={logo} alt="Auto Kopers" className="h-12 mb-4 brightness-0 invert" />
              <h1 className="text-2xl font-bold">{getInvoiceTitle()}</h1>
              <p className="text-primary-foreground/80 mt-1">
                Serija AK Nr. {data.invoiceNumber}
              </p>
            </div>
            <div className="text-right text-primary-foreground/90">
              <p className="text-lg font-semibold">{formatDate(data.date)}</p>
            </div>
          </div>
        </div>

        {/* Seller & Buyer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <h3 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider">
              Pardavėjas
            </h3>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="font-bold text-foreground">{sellerInfo.name}</p>
              <p className="text-sm text-muted-foreground">Įmonės kodas: {sellerInfo.companyCode}</p>
              <p className="text-sm text-muted-foreground">PVM kodas: {sellerInfo.vatCode}</p>
              <p className="text-sm text-muted-foreground">{sellerInfo.address}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Bankas: {sellerInfo.bankName}
              </p>
              <p className="text-sm text-muted-foreground">A/S: {sellerInfo.bankAccount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider">
              Pirkėjas
            </h3>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="font-bold text-foreground">{data.buyer.name}</p>
              <p className="text-sm text-muted-foreground">
                {data.buyer.isCompany ? "Įmonės kodas" : "Asmens kodas"}: {data.buyer.companyCode}
              </p>
              {data.buyer.vatCode && (
                <p className="text-sm text-muted-foreground">PVM kodas: {data.buyer.vatCode}</p>
              )}
              <p className="text-sm text-muted-foreground">{data.buyer.address}</p>
            </div>
          </div>
        </div>

        {/* Car Details */}
        {data.invoiceType === "car_sale" && data.carDetails && (
          <div className="mb-6 bg-accent/10 rounded-lg p-4">
            <h3 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">
              Automobilio duomenys
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {data.carDetails.vin && (
                <div>
                  <span className="text-muted-foreground">VIN:</span>{" "}
                  <span className="font-medium">{data.carDetails.vin}</span>
                </div>
              )}
              {data.carDetails.plate && (
                <div>
                  <span className="text-muted-foreground">Numeris:</span>{" "}
                  <span className="font-medium">{data.carDetails.plate}</span>
                </div>
              )}
              {data.carDetails.mileage && (
                <div>
                  <span className="text-muted-foreground">Rida:</span>{" "}
                  <span className="font-medium">{data.carDetails.mileage} km</span>
                </div>
              )}
              {data.carDetails.notes && (
                <div>
                  <span className="text-muted-foreground">Pastabos:</span>{" "}
                  <span className="font-medium">{data.carDetails.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="invoice-table-header">
                <th className="text-left p-3 rounded-tl-lg">Nr.</th>
                <th className="text-left p-3">Pavadinimas</th>
                <th className="text-center p-3">Kiekis</th>
                <th className="text-center p-3">Vnt.</th>
                <th className="text-right p-3">Kaina</th>
                <th className="text-center p-3">PVM</th>
                <th className="text-right p-3 rounded-tr-lg">Suma</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => {
                const lineTotal = item.quantity * item.price;
                const lineVat = calculateVat(lineTotal, item.vatType);
                return (
                  <tr key={index} className="invoice-table-row border-b border-border">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-center">{item.unit}</td>
                    <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="p-3 text-center text-xs text-muted-foreground">
                      {vatTypeLabels[item.vatType]}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(lineTotal + lineVat)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Suma be PVM:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {totalVat > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>PVM (21%):</span>
                <span>{formatCurrency(totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
              <span>Iš viso:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        {data.note && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">{data.note}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <div className="border-b border-dashed border-muted-foreground/50 pb-8 mb-2" />
            <p className="text-sm text-muted-foreground">Sąskaitą išrašė</p>
          </div>
          <div className="text-center">
            <div className="border-b border-dashed border-muted-foreground/50 pb-8 mb-2" />
            <p className="text-sm text-muted-foreground">Sąskaitą gavo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
