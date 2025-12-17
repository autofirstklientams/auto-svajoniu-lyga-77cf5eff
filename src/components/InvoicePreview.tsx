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
  onEdit?: () => void;
}

const InvoicePreview = ({ data, onBack, onEdit }: InvoicePreviewProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2) + "€";
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

    const el = invoiceRef.current;
    const prevAnimation = el.style.animation;
    const prevOpacity = el.style.opacity;
    const prevTransform = el.style.transform;

    // Ensure the capture is not affected by fade-in animations/transforms
    el.style.animation = "none";
    el.style.opacity = "1";
    el.style.transform = "none";

    // Let the browser apply the styles before rendering to canvas
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const canvas = await html2canvas(el, {
      scale: 4,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 0,
      allowTaint: true,
    });

    // Restore styles
    el.style.animation = prevAnimation;
    el.style.opacity = prevOpacity;
    el.style.transform = prevTransform;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: false,
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "NONE");
    pdf.save(`Saskaita-${data.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atgal
        </Button>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Redaguoti
          </Button>
        )}
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
      <div 
        ref={invoiceRef} 
        className="bg-white p-12 shadow-lg"
        style={{ 
          fontFamily: 'Times New Roman, serif',
          color: '#000000',
          minHeight: '297mm',
          width: '210mm',
          margin: '0 auto',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <img src={logo} alt="Auto Kopers" style={{ height: '56px' }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000', margin: 0 }}>PVM SĄSKAITA FAKTŪRA</h1>
          <p style={{ fontWeight: 'bold', color: '#000000', margin: '4px 0' }}>Nr. {data.invoiceNumber}</p>
          <p style={{ color: '#000000', margin: 0 }}>{formatDate(data.date)}</p>
        </div>

        {/* Seller & Buyer Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '40px' }}>
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>PARDAVĖJAS</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>{sellerInfo.name}</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>Įmonės kodas: {sellerInfo.companyCode}</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>PVM mokėtojo kodas: {sellerInfo.vatCode}</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>{sellerInfo.address}</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>Sąsk.nr: {sellerInfo.bankAccount}</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>{sellerInfo.bankName}</p>
          </div>

          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>PIRKĖJAS</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>{data.buyer.name},</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>
              {data.buyer.isCompany ? "įmonės kodas" : "asmens kodas"} {data.buyer.companyCode},
            </p>
            <p style={{ color: '#000000', margin: '2px 0' }}>adresas {data.buyer.address}.</p>
            {data.buyer.vatCode && (
              <p style={{ color: '#000000', margin: '2px 0' }}>PVM mokėtojo kodas: {data.buyer.vatCode}</p>
            )}
          </div>
        </div>

        {/* Items Table - Closed with borders */}
        <div style={{ marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000000' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000000', width: '50px', textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#000000' }}>
                  Eil. Nr.
                </th>
                <th style={{ border: '1px solid #000000', textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#000000' }}>
                  Prekės, paslaugos pavadinimas
                </th>
                <th style={{ border: '1px solid #000000', width: '70px', textAlign: 'center', padding: '8px', fontWeight: 'bold', color: '#000000' }}>
                  Kiekis
                </th>
                <th style={{ border: '1px solid #000000', width: '100px', textAlign: 'right', padding: '8px', fontWeight: 'bold', color: '#000000' }}>
                  Kaina
                </th>
                <th style={{ border: '1px solid #000000', width: '100px', textAlign: 'right', padding: '8px', fontWeight: 'bold', color: '#000000' }}>
                  Suma
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => {
                const lineTotal = item.quantity * item.price;
                return (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'center', color: '#000000' }}>
                      {index + 1}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '8px', color: '#000000' }}>
                      {item.description}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'center', color: '#000000' }}>
                      {item.quantity}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'right', color: '#000000' }}>
                      {formatCurrency(item.price)}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'right', color: '#000000' }}>
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ marginBottom: '24px', color: '#000000' }}>
          {!data.carDetails?.isMarginScheme && (
            <p style={{ margin: '4px 0', color: '#000000' }}>PVM 21% {formatCurrency(totalVat)}</p>
          )}
          <p style={{ fontWeight: 'bold', marginTop: '8px', color: '#000000' }}>Iš viso: {formatCurrency(total)}</p>
        </div>

        {/* VAT Note */}
        {data.items.some(item => item.vatType === "vat_exempt") && (
          <p style={{ marginBottom: '16px', fontSize: '14px', color: '#000000' }}>
            PVM įstatymu 28 straipsnio 1 dalimi, komisinis mokestis (tarpininkavimo paslaugos dėl paskolos suteikimo) nėra PVM objektas
          </p>
        )}

        {/* Margin Scheme Note */}
        {data.invoiceType === "car_sale" && data.carDetails?.isMarginScheme && (
          <p style={{ marginBottom: '16px', fontSize: '14px', color: '#000000' }}>
            Taikomas LR PVM įstatymo 106 str. Apmokestinama taikant maržos schemą / Margin scheme.
          </p>
        )}

        {/* Car Notes */}
        {data.invoiceType === "car_sale" && data.carDetails?.notes && (
          <p style={{ marginBottom: '16px', fontSize: '14px', color: '#000000' }}>
            Pastabos: {data.carDetails.notes}
          </p>
        )}

        {/* Custom Note */}
        {data.note && (
          <p style={{ marginBottom: '24px', fontSize: '14px', color: '#000000' }}>
            {data.note}
          </p>
        )}

        {/* Signature */}
        <div style={{ marginTop: '64px', color: '#000000' }}>
          <p style={{ margin: 0, color: '#000000' }}>Sąskaitą išrašė:</p>
          <p style={{ marginTop: '32px', color: '#000000' }}>{sellerInfo.name}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;