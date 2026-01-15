import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { InvoiceData } from "./InvoiceForm";
import { sellerInfo, vatTypeLabels, VatType } from "@/data/suppliers";
import logo from "@/assets/logo.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SendInvoiceEmailDialog from "./SendInvoiceEmailDialog";

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

  // Apskaičiuoja PVM sumą pagal PVM tipą
  const calculateVat = (price: number, vatType: VatType) => {
    if (vatType === "with_vat") {
      // PVM pridedama prie kainos
      return price * 0.21;
    }
    if (vatType === "with_vat_included") {
      // PVM jau įskaičiuota į kainą - išskaičiuojame
      return price - (price / 1.21);
    }
    return 0;
  };

  // Apskaičiuoja bazinę kainą be PVM
  const getBasePrice = (price: number, vatType: VatType) => {
    if (vatType === "with_vat_included") {
      // Kaina su PVM - apskaičiuojame be PVM
      return price / 1.21;
    }
    return price;
  };

  const subtotal = data.items.reduce((sum, item) => {
    const linePrice = item.quantity * item.price;
    return sum + getBasePrice(linePrice, item.vatType);
  }, 0);
  
  const totalVat = data.items.reduce(
    (sum, item) => sum + calculateVat(item.quantity * item.price, item.vatType),
    0
  );
  
  const total = data.items.reduce((sum, item) => {
    const linePrice = item.quantity * item.price;
    if (item.vatType === "with_vat") {
      return sum + linePrice + (linePrice * 0.21);
    }
    // Visiems kitiems atvejams (įskaitant with_vat_included) - tiesiog pridedame kainą
    return sum + linePrice;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  const generatePdfData = async () => {
    if (!invoiceRef.current) return null;

    const el = invoiceRef.current;
    const prevAnimation = el.style.animation;
    const prevOpacity = el.style.opacity;
    const prevTransform = el.style.transform;

    el.style.animation = "none";
    el.style.opacity = "1";
    el.style.transform = "none";

    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 0,
      allowTaint: true,
    });

    el.style.animation = prevAnimation;
    el.style.opacity = prevOpacity;
    el.style.transform = prevTransform;

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
    
    return pdf;
  };

  const handleDownloadPDF = async () => {
    const pdf = await generatePdfData();
    if (pdf) {
      pdf.save(`Saskaita-${data.invoiceNumber}.pdf`);
    }
  };

  const generatePdfBase64 = async (): Promise<string | null> => {
    const pdf = await generatePdfData();
    if (!pdf) return null;
    
    // Get PDF as base64 (remove data URL prefix)
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    return pdfBase64;
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
        <SendInvoiceEmailDialog
          invoiceNumber={data.invoiceNumber}
          buyerName={data.buyer.name}
          totalAmount={total}
          generatePdfBase64={generatePdfBase64}
        />
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
            <p style={{ color: '#000000', margin: '2px 0' }}>Sąsk.nr: {data.bankAccount.accountNumber}</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>{data.bankAccount.bankName}</p>
          </div>

          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>PIRKĖJAS</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>{data.buyer.name},</p>
            <p style={{ color: '#000000', margin: '2px 0' }}>
              {data.buyer.isCompany ? "įmonės kodas" : "asmens kodas"} {data.buyer.companyCode},
            </p>
            <p style={{ color: '#000000', margin: '2px 0' }}>adresas: {data.buyer.address}.</p>
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

        {/* Discount Display */}
        {data.invoiceType === "car_sale" && data.carDetails?.originalPrice && data.carDetails?.discount && data.carDetails.discount > 0 && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px', 
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '12px', color: '#166534', fontSize: '14px', margin: '0 0 12px 0' }}>
              SUTEIKTA NUOLAIDA
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <p style={{ color: '#374151', margin: '4px 0', fontSize: '14px' }}>Pradinė kaina:</p>
              <p style={{ color: '#374151', margin: '4px 0', fontSize: '14px', textAlign: 'right', textDecoration: 'line-through' }}>
                {formatCurrency(data.carDetails.originalPrice)}
              </p>
              <p style={{ color: '#16a34a', margin: '4px 0', fontSize: '14px', fontWeight: '600' }}>Nuolaida:</p>
              <p style={{ color: '#16a34a', margin: '4px 0', fontSize: '14px', textAlign: 'right', fontWeight: '600' }}>
                - {formatCurrency(data.carDetails.discount)}
              </p>
              <p style={{ color: '#166534', margin: '4px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #bbf7d0', paddingTop: '8px' }}>
                Kaina su nuolaida:
              </p>
              <p style={{ color: '#166534', margin: '4px 0', fontSize: '16px', textAlign: 'right', fontWeight: 'bold', borderTop: '1px solid #bbf7d0', paddingTop: '8px' }}>
                {formatCurrency(data.carDetails.originalPrice - data.carDetails.discount)}
              </p>
            </div>
          </div>
        )}

        {/* Totals */}
        <div style={{ marginBottom: '24px', color: '#000000' }}>
          {!data.carDetails?.isMarginScheme && totalVat > 0 && (
            <>
              <p style={{ margin: '4px 0', color: '#000000' }}>Suma be PVM: {formatCurrency(subtotal)}</p>
              <p style={{ margin: '4px 0', color: '#000000' }}>PVM 21%: {formatCurrency(totalVat)}</p>
              <p style={{ fontWeight: 'bold', marginTop: '8px', color: '#000000' }}>Viso su PVM: {formatCurrency(total)}</p>
            </>
          )}
          {(data.carDetails?.isMarginScheme || totalVat === 0) && (
            <p style={{ fontWeight: 'bold', marginTop: '8px', color: '#000000' }}>Iš viso: {formatCurrency(total)}</p>
          )}
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