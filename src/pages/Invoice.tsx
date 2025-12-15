// Invoice Generator - Admin Only
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, User, Package, MessageSquare, Upload, Plus, Trash2, Copy, X, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoKopersLogo from "@/assets/autokopers-logo.jpeg";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  vatType: "su_pvm" | "be_pvm" | "neapmokestinama";
}

interface SavedInvoice {
  id: string;
  number: string;
  date: string;
  buyer: string;
  total: number;
  type: string;
}

const BUYERS = [
  { value: "inbank", label: "AS Inbank filialas" },
  { value: "bigbank", label: "Bigbank AS filialas" },
  { value: "seb", label: "SEB lizingas" },
  { value: "swedbank", label: "Swedbank lizingas" },
  { value: "silita", label: 'UAB "SILITA"' },
  { value: "mokilizingas", label: "UAB Mokilizingas" },
];

const QUICK_ITEMS = [
  "Komisinis atlyginimas",
  "Komunaliniai mokesčiai",
  "Patalpų subnuoma",
  "Tarpininkavimo paslaugos (komisinis atlyginimas)",
];

const NOTES = [
  "Apmokėti per 10 d.d nuo sąskaitos gavimo.",
  "Apmokėti per 14 d.d nuo sąskaitos gavimo.",
  "Apmokėti per 30 d.d nuo sąskaitos gavimo.",
  "Apmokėti iš karto.",
  "Apmokėta.",
  "Be pastabos",
];

const INVOICE_TYPES = [
  { value: "komisiniai", label: "Komisiniai" },
  { value: "pardavimas", label: "Automobilio pardavimas" },
  { value: "nuoma", label: "Nuoma" },
  { value: "remontas", label: "Remontas" },
  { value: "kita", label: "Kita" },
];

const Invoice = () => {
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Invoice form state
  const [invoiceNumber, setInvoiceNumber] = useState("1");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [invoiceType, setInvoiceType] = useState("komisiniai");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [customBuyer, setCustomBuyer] = useState("");
  const [isCustomBuyer, setIsCustomBuyer] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedNote, setSelectedNote] = useState(NOTES[0]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [quickItemsSelected, setQuickItemsSelected] = useState<string[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Prašome prisijungti");
        navigate("/partner-login");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !roles) {
        toast.error("Neturite administratoriaus teisių");
        navigate("/partner-dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Klaida tikrinant prieigą");
      navigate("/partner-login");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      price: 0,
      vatType: "neapmokestinama",
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const duplicateItem = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      const newItem = { ...itemToDuplicate, id: crypto.randomUUID() };
      setItems([...items, newItem]);
    }
  };

  const toggleQuickItem = (itemName: string) => {
    if (quickItemsSelected.includes(itemName)) {
      setQuickItemsSelected(quickItemsSelected.filter(i => i !== itemName));
      setItems(items.filter(item => item.name !== itemName));
    } else {
      setQuickItemsSelected([...quickItemsSelected, itemName]);
      const newItem: InvoiceItem = {
        id: crypto.randomUUID(),
        name: itemName,
        quantity: 1,
        price: 0,
        vatType: "neapmokestinama",
      };
      setItems([...items, newItem]);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateVAT = () => {
    return items.reduce((sum, item) => {
      if (item.vatType === "su_pvm") {
        return sum + (item.quantity * item.price * 0.21);
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      toast.loading("Generuojama sąskaita...");
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`saskaita-${invoiceNumber}.pdf`);

      // Save to list
      const newInvoice: SavedInvoice = {
        id: crypto.randomUUID(),
        number: invoiceNumber,
        date: invoiceDate,
        buyer: isCustomBuyer ? customBuyer : (BUYERS.find(b => b.value === selectedBuyer)?.label || ""),
        total: calculateTotal(),
        type: INVOICE_TYPES.find(t => t.value === invoiceType)?.label || "",
      };
      setSavedInvoices([newInvoice, ...savedInvoices]);

      toast.dismiss();
      toast.success("Sąskaita sugeneruota!");
    } catch (error) {
      toast.dismiss();
      toast.error("Klaida generuojant sąskaitą");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Kraunama...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin-dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Grįžti į admin panelę
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <img src={autoKopersLogo} alt="AutoKopers" className="h-10 mb-4" />
            <h1 className="text-4xl font-serif text-foreground">Sąskaitų Generatorius</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Invoice Data Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif text-foreground">Sąskaitos duomenys</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Sąskaitos numeris</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Data</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Sąskaitos tipas</Label>
              <Select value={invoiceType} onValueChange={setInvoiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Buyer Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif text-foreground">Pirkėjas</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={!isCustomBuyer ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCustomBuyer(false)}
              >
                Pasirinkti iš sąrašo
              </Button>
              <Button
                variant={isCustomBuyer ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCustomBuyer(true)}
              >
                ✏️ Įvesti naują pirkėją
              </Button>
            </div>

            {!isCustomBuyer ? (
              <div>
                <Label>Pasirinkite pirkėją</Label>
                <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite iš sąrašo arba įveskite patys" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUYERS.map((buyer) => (
                      <SelectItem key={buyer.value} value={buyer.value}>
                        {buyer.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Pirkėjo duomenys</Label>
                <Textarea
                  value={customBuyer}
                  onChange={(e) => setCustomBuyer(e.target.value)}
                  placeholder="Įveskite pirkėjo pavadinimą, adresą, įmonės kodą..."
                  rows={4}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Items Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-serif text-foreground">Prekės / Paslaugos</h2>
            </div>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Pridėti
            </Button>
          </div>

          {/* Quick Selection */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Greitas pasirinkimas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ITEMS.map((item) => (
                <Badge
                  key={item}
                  variant={quickItemsSelected.includes(item) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => toggleQuickItem(item)}
                >
                  {item}
                  {quickItemsSelected.includes(item) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5">
                    <Label>Pavadinimas</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Paslaugos aprašymas"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Kiekis</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Kaina (€)</Label>
                    <Input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => duplicateItem(item.id)}
                      title="Kopijuoti"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                      title="Ištrinti"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-sm text-muted-foreground">PVM:</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={item.vatType === "su_pvm" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateItem(item.id, "vatType", "su_pvm")}
                    >
                      Su PVM
                    </Button>
                    <Button
                      type="button"
                      variant={item.vatType === "be_pvm" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateItem(item.id, "vatType", "be_pvm")}
                    >
                      Be PVM
                    </Button>
                    <Button
                      type="button"
                      variant={item.vatType === "neapmokestinama" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateItem(item.id, "vatType", "neapmokestinama")}
                    >
                      Neapmokestinama (komisiniai)
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Pridėkite prekių arba paslaugų
              </p>
            )}
          </div>
        </Card>

        {/* Notes Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif text-foreground">Pastaba</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {NOTES.map((note) => (
              <Badge
                key={note}
                variant={selectedNote === note ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setSelectedNote(note)}
              >
                {note.length > 30 ? note.substring(0, 30) + "..." : note}
              </Badge>
            ))}
          </div>

          <Textarea
            value={selectedNote}
            onChange={(e) => setSelectedNote(e.target.value)}
            rows={2}
          />
        </Card>

        {/* Attachments Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-serif text-foreground">Priedai</h2>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p>Įkelti failus</p>
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Generate Button */}
        <Button
          onClick={generatePDF}
          className="w-full py-6 text-lg"
          disabled={items.length === 0}
        >
          Generuoti sąskaitą faktūrą
        </Button>

        {/* Saved Invoices */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-serif text-foreground mb-4">Išrašytos sąskaitos</h2>
          
          {savedInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Dar nėra išsaugotų sąskaitų
            </p>
          ) : (
            <div className="space-y-3">
              {savedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Sąskaita #{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date} • {invoice.buyer} • {invoice.type}
                    </p>
                  </div>
                  <p className="font-bold text-primary">{invoice.total.toFixed(2)} €</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Hidden Invoice Template for PDF */}
      <div className="fixed left-[-9999px]">
        <div ref={invoiceRef} className="bg-white p-8" style={{ width: "794px" }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PVM SĄSKAITA FAKTŪRA</h1>
              <p className="text-gray-600">Serija AK Nr. {invoiceNumber}</p>
              <p className="text-gray-600">{invoiceDate}</p>
            </div>
            <img src={autoKopersLogo} alt="AutoKopers" className="h-12" />
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Pardavėjas:</h3>
              <p className="text-gray-600">MB AutoKopers</p>
              <p className="text-gray-600">Įmonės kodas: 306524370</p>
              <p className="text-gray-600">PVM kodas: LT100016565515</p>
              <p className="text-gray-600">Adresas: Kaunas</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Pirkėjas:</h3>
              <p className="text-gray-600">
                {isCustomBuyer ? customBuyer : BUYERS.find(b => b.value === selectedBuyer)?.label}
              </p>
            </div>
          </div>

          <table className="w-full mb-8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th className="text-left p-3 border border-gray-200">Nr.</th>
                <th className="text-left p-3 border border-gray-200">Pavadinimas</th>
                <th className="text-right p-3 border border-gray-200">Kiekis</th>
                <th className="text-right p-3 border border-gray-200">Kaina</th>
                <th className="text-right p-3 border border-gray-200">PVM</th>
                <th className="text-right p-3 border border-gray-200">Suma</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="p-3 border border-gray-200">{index + 1}</td>
                  <td className="p-3 border border-gray-200">{item.name}</td>
                  <td className="text-right p-3 border border-gray-200">{item.quantity}</td>
                  <td className="text-right p-3 border border-gray-200">{item.price.toFixed(2)} €</td>
                  <td className="text-right p-3 border border-gray-200">
                    {item.vatType === "su_pvm" ? "21%" : item.vatType === "be_pvm" ? "0%" : "Neapm."}
                  </td>
                  <td className="text-right p-3 border border-gray-200">
                    {(item.quantity * item.price).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Suma be PVM:</span>
                <span>{calculateSubtotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-2">
                <span>PVM (21%):</span>
                <span>{calculateVAT().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-300">
                <span>Viso:</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {selectedNote && selectedNote !== "Be pastabos" && (
            <div className="mb-8">
              <p className="text-gray-600 italic">{selectedNote}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 mt-16">
            <div>
              <p className="border-t border-gray-300 pt-2">Sąskaitą išrašė</p>
            </div>
            <div>
              <p className="border-t border-gray-300 pt-2">Sąskaitą priėmė</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
