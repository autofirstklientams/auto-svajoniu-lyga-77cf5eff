import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Building2, User, FileText, Car } from "lucide-react";
import { popularSuppliers, sellerInfo, VatType, vatTypeLabels, popularNotes } from "@/data/suppliers";
import { useSavedData, SavedBuyer, SavedProduct } from "@/hooks/useSavedData";

export type InvoiceType = "commission" | "car_sale" | "service";

export interface CarDetails {
  make: string;
  model: string;
  vin: string;
  plate: string;
  mileage: string;
  notes: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  price: number;
  vatType: VatType;
}

export interface Buyer {
  id: string;
  name: string;
  companyCode: string;
  vatCode: string;
  address: string;
  isCompany: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  buyer: Buyer;
  items: InvoiceItem[];
  note: string;
  invoiceType: InvoiceType;
  carDetails?: CarDetails;
  attachments?: string[];
}

interface InvoiceFormProps {
  onGenerate: (data: InvoiceData) => void;
  nextInvoiceNumber: number;
}

const InvoiceForm = ({ onGenerate, nextInvoiceNumber }: InvoiceFormProps) => {
  const { buyers, products, notes, addBuyer, addProduct, addNote, deleteBuyer, deleteProduct, deleteNote } = useSavedData();
  
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber.toString());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("commission");
  
  const [buyer, setBuyer] = useState<Buyer>({
    id: "",
    name: "",
    companyCode: "",
    vatCode: "",
    address: "",
    isCompany: true,
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit: "vnt.", price: 0, vatType: "vat_exempt" },
  ]);
  
  const [note, setNote] = useState("");
  
  const [carDetails, setCarDetails] = useState<CarDetails>({
    make: "",
    model: "",
    vin: "",
    plate: "",
    mileage: "",
    notes: "",
  });

  const [showSaveBuyer, setShowSaveBuyer] = useState(false);

  useEffect(() => {
    setInvoiceNumber(nextInvoiceNumber.toString());
  }, [nextInvoiceNumber]);

  const handleSelectBuyer = (buyerId: string) => {
    if (buyerId === "new") {
      setBuyer({ id: "", name: "", companyCode: "", vatCode: "", address: "", isCompany: true });
      return;
    }
    
    const popular = popularSuppliers.find((s) => s.id === buyerId);
    if (popular) {
      setBuyer({
        id: popular.id,
        name: popular.name,
        companyCode: popular.companyCode,
        vatCode: popular.vatCode || "",
        address: popular.address,
        isCompany: popular.isCompany,
      });
      return;
    }
    
    const saved = buyers.find((b) => b.id === buyerId);
    if (saved) {
      setBuyer({
        id: saved.id,
        name: saved.name,
        companyCode: saved.company_code,
        vatCode: saved.vat_code || "",
        address: saved.address,
        isCompany: saved.is_company,
      });
    }
  };

  const handleSelectProduct = (productId: string, index: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        description: product.description,
        price: product.default_price,
      };
      setItems(newItems);
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit: "vnt.", price: 0, vatType: "vat_exempt" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Jei automobilio pardavimas, sukuriame prekę iš automobilio duomenų
    let finalItems = items;
    if (invoiceType === "car_sale" && carDetails.make && carDetails.model) {
      const carDescription = `Automobilis ${carDetails.make} ${carDetails.model}${carDetails.vin ? `, VIN: ${carDetails.vin}` : ""}${carDetails.plate ? `, Nr.: ${carDetails.plate}` : ""}${carDetails.mileage ? `, Rida: ${carDetails.mileage} km` : ""}`;
      finalItems = [{
        description: carDescription,
        quantity: 1,
        unit: "vnt.",
        price: items[0]?.price || 0,
        vatType: items[0]?.vatType || "vat_exempt",
      }];
    }
    
    const data: InvoiceData = {
      invoiceNumber,
      date,
      buyer,
      items: finalItems,
      note,
      invoiceType,
      carDetails: invoiceType === "car_sale" ? carDetails : undefined,
    };
    
    onGenerate(data);
  };

  const handleSaveBuyer = async () => {
    if (buyer.name && buyer.companyCode) {
      await addBuyer({
        name: buyer.name,
        company_code: buyer.companyCode,
        vat_code: buyer.vatCode || null,
        address: buyer.address,
        is_company: buyer.isCompany,
      });
      setShowSaveBuyer(false);
    }
  };

  const handleSaveProduct = async (index: number) => {
    const item = items[index];
    if (item.description) {
      await addProduct(item.description, item.price);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Header */}
      <Card className="form-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sąskaitos informacija
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Sąskaitos Nr.</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="input-elegant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-elegant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Sąskaitos tipas</Label>
              <Select value={invoiceType} onValueChange={(v) => setInvoiceType(v as InvoiceType)}>
                <SelectTrigger className="input-elegant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commission">Komisinis mokestis</SelectItem>
                  <SelectItem value="car_sale">Automobilio pardavimas</SelectItem>
                  <SelectItem value="service">Paslaugos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Selection */}
      <Card className="form-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {buyer.isCompany ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            Pirkėjas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pasirinkti pirkėją</Label>
            <Select onValueChange={handleSelectBuyer}>
              <SelectTrigger className="input-elegant">
                <SelectValue placeholder="Pasirinkite arba įveskite naują" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">+ Naujas pirkėjas</SelectItem>
                {popularSuppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
                {buyers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} (išsaugotas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={buyer.isCompany}
                onChange={() => setBuyer({ ...buyer, isCompany: true })}
                className="w-4 h-4"
              />
              <Building2 className="w-4 h-4" />
              Juridinis asmuo
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!buyer.isCompany}
                onChange={() => setBuyer({ ...buyer, isCompany: false })}
                className="w-4 h-4"
              />
              <User className="w-4 h-4" />
              Fizinis asmuo
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName">Pavadinimas / Vardas</Label>
              <Input
                id="buyerName"
                value={buyer.name}
                onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                className="input-elegant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyCode">{buyer.isCompany ? "Įmonės kodas" : "Asmens kodas"}</Label>
              <Input
                id="companyCode"
                value={buyer.companyCode}
                onChange={(e) => setBuyer({ ...buyer, companyCode: e.target.value })}
                className="input-elegant"
                required
              />
            </div>
            {buyer.isCompany && (
              <div className="space-y-2">
                <Label htmlFor="vatCode">PVM kodas</Label>
                <Input
                  id="vatCode"
                  value={buyer.vatCode}
                  onChange={(e) => setBuyer({ ...buyer, vatCode: e.target.value })}
                  className="input-elegant"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="address">Adresas</Label>
              <Input
                id="address"
                value={buyer.address}
                onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                className="input-elegant"
                required
              />
            </div>
          </div>

          {buyer.name && buyer.companyCode && !buyer.id && (
            <Button type="button" variant="outline" size="sm" onClick={handleSaveBuyer}>
              <Save className="w-4 h-4 mr-2" />
              Išsaugoti pirkėją
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Car Details (for car_sale type) */}
      {invoiceType === "car_sale" && (
        <Card className="form-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Automobilio duomenys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carMake">Markė</Label>
                <Input
                  id="carMake"
                  value={carDetails.make}
                  onChange={(e) => setCarDetails({ ...carDetails, make: e.target.value })}
                  className="input-elegant"
                  placeholder="pvz. BMW"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carModel">Modelis</Label>
                <Input
                  id="carModel"
                  value={carDetails.model}
                  onChange={(e) => setCarDetails({ ...carDetails, model: e.target.value })}
                  className="input-elegant"
                  placeholder="pvz. 520d"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN kodas</Label>
                <Input
                  id="vin"
                  value={carDetails.vin}
                  onChange={(e) => setCarDetails({ ...carDetails, vin: e.target.value })}
                  className="input-elegant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate">Valstybinis numeris/SDK</Label>
                <Input
                  id="plate"
                  value={carDetails.plate}
                  onChange={(e) => setCarDetails({ ...carDetails, plate: e.target.value })}
                  className="input-elegant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Rida (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={carDetails.mileage}
                  onChange={(e) => setCarDetails({ ...carDetails, mileage: e.target.value })}
                  className="input-elegant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carNotes">Pastabos</Label>
                <Input
                  id="carNotes"
                  value={carDetails.notes}
                  onChange={(e) => setCarDetails({ ...carDetails, notes: e.target.value })}
                  className="input-elegant"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items - show price/VAT for car sale, full items for other types */}
      <Card className="form-section">
        <CardHeader>
          <CardTitle>{invoiceType === "car_sale" ? "Kaina" : "Prekės / Paslaugos"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoiceType === "car_sale" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kaina €</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={items[0]?.price || 0}
                  onChange={(e) => updateItem(0, "price", parseFloat(e.target.value) || 0)}
                  className="input-elegant"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>PVM</Label>
                <Select
                  value={items[0]?.vatType || "vat_exempt"}
                  onValueChange={(v) => updateItem(0, "vatType", v as VatType)}
                >
                  <SelectTrigger className="input-elegant">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(vatTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-4 space-y-1">
                    <Label>Aprašymas</Label>
                    <div className="flex gap-2">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className="input-elegant flex-1"
                        required
                      />
                      {products.length > 0 && (
                        <Select onValueChange={(v) => handleSelectProduct(v, index)}>
                          <SelectTrigger className="w-10 p-0 justify-center">
                            <span className="text-xs">📋</span>
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-1 space-y-1">
                    <Label>Kiekis</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      className="input-elegant"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-1 space-y-1">
                    <Label>Vnt.</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(index, "unit", e.target.value)}
                      className="input-elegant"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <Label>Kaina €</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                      className="input-elegant"
                      required
                    />
                  </div>
                  <div className="col-span-10 md:col-span-3 space-y-1">
                    <Label>PVM</Label>
                    <Select
                      value={item.vatType}
                      onValueChange={(v) => updateItem(index, "vatType", v as VatType)}
                    >
                      <SelectTrigger className="input-elegant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(vatTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveProduct(index)}
                      title="Išsaugoti prekę"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Pridėti eilutę
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Note */}
      <Card className="form-section">
        <CardHeader>
          <CardTitle>Pastabos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {popularNotes.map((n) => (
              <Button
                key={n.id}
                type="button"
                variant={note === n.text ? "default" : "outline"}
                size="sm"
                onClick={() => setNote(n.text)}
              >
                {n.id === "none" ? "Be pastabos" : n.text.substring(0, 20) + "..."}
              </Button>
            ))}
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Papildoma informacija..."
            className="input-elegant"
          />
          {note && !popularNotes.find((n) => n.text === note) && (
            <Button type="button" variant="outline" size="sm" onClick={() => addNote(note)}>
              <Save className="w-4 h-4 mr-2" />
              Išsaugoti pastabą
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full btn-gradient h-12 text-lg">
        <FileText className="w-5 h-5 mr-2" />
        Generuoti sąskaitą
      </Button>
    </form>
  );
};

export default InvoiceForm;
