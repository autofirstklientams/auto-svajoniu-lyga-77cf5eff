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

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 4,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: false,
    });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "NONE");
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
        className="bg-white p-12 shadow-lg animate-fade-in"
        style={{ 
          fontFamily: 'Times New Roman, serif',
          color: '#000000',
          minHeight: '297mm',
          width: '210mm',
          margin: '0 auto'
        }}
      >
        {/* Logo */}
        <div className="mb-8">
          <img src={logo} alt="Auto Kopers" className="h-14" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold" style={{ color: '#000' }}>PVM SĄSKAITA FAKTŪRA</h1>
          <p className="font-bold" style={{ color: '#000' }}>Nr. {data.invoiceNumber}</p>
          <p style={{ color: '#000' }}>{formatDate(data.date)}</p>
        </div>

        {/* Seller & Buyer Info */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <p className="font-bold mb-2" style={{ color: '#000' }}>PARDAVĖJAS</p>
            <p style={{ color: '#000' }}>{sellerInfo.name}</p>
            <p style={{ color: '#000' }}>Įmonės kodas: {sellerInfo.companyCode}</p>
            <p style={{ color: '#000' }}>PVM mokėtojo kodas: {sellerInfo.vatCode}</p>
            <p style={{ color: '#000' }}>{sellerInfo.address}</p>
            <p style={{ color: '#000' }}>Sąsk.nr: {sellerInfo.bankAccount}</p>
            <p style={{ color: '#000' }}>{sellerInfo.bankName}</p>
          </div>

          <div>
            <p className="font-bold mb-2" style={{ color: '#000' }}>PIRKĖJAS</p>
            <p style={{ color: '#000' }}>{data.buyer.name},</p>
            <p style={{ color: '#000' }}>
              {data.buyer.isCompany ? "įmonės kodas" : "asmens kodas"} {data.buyer.companyCode},
            </p>
            <p style={{ color: '#000' }}>adresas {data.buyer.address}.</p>
            {data.buyer.vatCode && (
              <p style={{ color: '#000' }}>PVM mokėtojo kodas: {data.buyer.vatCode}</p>
            )}
          </div>
        </div>

        {/* Car Details */}
        {data.invoiceType === "car_sale" && data.carDetails && (data.carDetails.make || data.carDetails.model) && (
          <div className="mb-6">
            <p className="font-bold mb-2" style={{ color: '#000' }}>AUTOMOBILIO DUOMENYS</p>
            <div className="text-sm" style={{ color: '#000' }}>
              {(data.carDetails.make || data.carDetails.model) && (
                <p>Automobilis: {data.carDetails.make} {data.carDetails.model}</p>
              )}
              {data.carDetails.vin && <p>VIN: {data.carDetails.vin}</p>}
              {data.carDetails.plate && <p>Valst. numeris: {data.carDetails.plate}</p>}
              {data.carDetails.mileage && <p>Rida: {data.carDetails.mileage} km</p>}
              {data.carDetails.notes && <p>Pastabos: {data.carDetails.notes}</p>}
            </div>
          </div>
        )}

        {/* Items Table - Closed with borders */}
        <div className="mb-6">
          <table className="w-full" style={{ borderCollapse: 'collapse', color: '#000' }}>
            <thead>
              <tr>
                <th 
                  className="text-left p-2 font-bold" 
                  style={{ border: '1px solid #000', width: '50px' }}
                >
                  Eil. Nr.
                </th>
                <th 
                  className="text-left p-2 font-bold" 
                  style={{ border: '1px solid #000' }}
                >
                  Prekės, paslaugos pavadinimas
                </th>
                <th 
                  className="text-center p-2 font-bold" 
                  style={{ border: '1px solid #000', width: '70px' }}
                >
                  Kiekis
                </th>
                <th 
                  className="text-right p-2 font-bold" 
                  style={{ border: '1px solid #000', width: '100px' }}
                >
                  Kaina
                </th>
                <th 
                  className="text-right p-2 font-bold" 
                  style={{ border: '1px solid #000', width: '100px' }}
                >
                  Suma
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => {
                const lineTotal = item.quantity * item.price;
                return (
                  <tr key={index}>
                    <td className="p-2 text-center" style={{ border: '1px solid #000' }}>
                      {index + 1}
                    </td>
                    <td className="p-2" style={{ border: '1px solid #000' }}>
                      {item.description}
                    </td>
                    <td className="p-2 text-center" style={{ border: '1px solid #000' }}>
                      {item.quantity}
                    </td>
                    <td className="p-2 text-right" style={{ border: '1px solid #000' }}>
                      {formatCurrency(item.price)}
                    </td>
                    <td className="p-2 text-right" style={{ border: '1px solid #000' }}>
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-6" style={{ color: '#000' }}>
          <p>PVM 21% {formatCurrency(totalVat)}</p>
          <p className="font-bold mt-2">Iš viso: {formatCurrency(total)}</p>
        </div>

        {/* VAT Note */}
        {data.items.some(item => item.vatType === "vat_exempt") && (
          <p className="mb-4 text-sm" style={{ color: '#000' }}>
            PVM įstatymu 28 straipsnio 1 dalimi, komisinis mokestis (tarpininkavimo paslaugos dėl paskolos suteikimo) nėra PVM objektas
          </p>
        )}

        {/* Custom Note */}
        {data.note && (
          <p className="mb-6 text-sm" style={{ color: '#000' }}>
            {data.note}
          </p>
        )}

        {/* Signature */}
        <div className="mt-16" style={{ color: '#000' }}>
          <p>Sąskaitą išrašė:</p>
          <p className="mt-8">{sellerInfo.name}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;