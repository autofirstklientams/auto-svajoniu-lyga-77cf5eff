import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Building2, User, FileText, Car } from "lucide-react";
import { popularSuppliers, sellerInfo, VatType, vatTypeLabels, popularNotes, BankAccount } from "@/data/suppliers";
import { useSavedData, SavedBuyer, SavedProduct } from "@/hooks/useSavedData";
import { useBankAccounts } from "@/hooks/useBankAccounts";

export type InvoiceType = "commission" | "car_sale" | "service";

export interface CarDetails {
  make: string;
  model: string;
  vin: string;
  plate: string;
  sdk: string;
  mileage: string;
  notes: string;
  isMarginScheme: boolean;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  price: number;
  priceInput?: string; // For display purposes with comma support
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
  bankAccount: BankAccount;
}

interface InvoiceFormProps {
  onGenerate: (data: InvoiceData) => void;
  nextInvoiceNumber: number;
  initialData?: InvoiceData | null;
  onClearInitialData?: () => void;
}

const InvoiceForm = ({ onGenerate, nextInvoiceNumber, initialData, onClearInitialData }: InvoiceFormProps) => {
  const { buyers, products, notes, addBuyer, addProduct, addNote, deleteBuyer, deleteProduct, deleteNote } = useSavedData();
  const { bankAccounts, addBankAccount, deleteBankAccount } = useBankAccounts();
  
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
    { description: "", quantity: 1, unit: "vnt.", price: 0, priceInput: "", vatType: "vat_exempt" },
  ]);
  
  // Automobilio kaina ir PVM (atskirai nuo papildomų paslaugų)
  const [carPriceInput, setCarPriceInput] = useState<string>("");
  const [carVatType, setCarVatType] = useState<VatType>("vat_exempt");
  
  // Papildomos paslaugos prie automobilio
  const [additionalItems, setAdditionalItems] = useState<InvoiceItem[]>([]);
  
  const [note, setNote] = useState("");
  
  const [carDetails, setCarDetails] = useState<CarDetails>({
    make: "",
    model: "",
    vin: "",
    plate: "",
    sdk: "",
    mileage: "",
    notes: "",
    isMarginScheme: false,
  });

  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [showAddBankAccount, setShowAddBankAccount] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({ accountNumber: "", bankName: "" });

  const [showSaveBuyer, setShowSaveBuyer] = useState(false);

  // Set default bank account when loaded
  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankAccount) {
      setSelectedBankAccount(bankAccounts[0]);
    }
  }, [bankAccounts, selectedBankAccount]);

  useEffect(() => {
    setInvoiceNumber(nextInvoiceNumber.toString());
  }, [nextInvoiceNumber]);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setInvoiceNumber(initialData.invoiceNumber);
      setDate(initialData.date);
      setInvoiceType(initialData.invoiceType);
      setBuyer(initialData.buyer);
      setItems(initialData.items);
      setNote(initialData.note);
      if (initialData.carDetails) {
        setCarDetails(initialData.carDetails);
      }
      if (initialData.bankAccount) {
        setSelectedBankAccount(initialData.bankAccount);
      }
      
      // Jei automobilio pardavimas, atskirti automobilio kainą nuo papildomų paslaugų
      if (initialData.invoiceType === "car_sale" && initialData.items.length > 0) {
        // Pirma eilutė yra automobilis
        setCarPriceInput(initialData.items[0]?.price?.toString() || "");
        setCarVatType(initialData.items[0]?.vatType || "vat_exempt");
        // Likusios eilutės yra papildomos paslaugos
        if (initialData.items.length > 1) {
          setAdditionalItems(initialData.items.slice(1));
        }
      } else {
        setItems(initialData.items);
      }
      
      // Clear initial data after populating
      onClearInitialData?.();
    }
  }, [initialData, onClearInitialData]);

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
    setItems([...items, { description: "", quantity: 1, unit: "vnt.", price: 0, priceInput: "", vatType: "vat_exempt" }]);
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

  // Papildomų paslaugų valdymas (automobilio pardavimui)
  const addAdditionalItem = () => {
    setAdditionalItems([...additionalItems, { description: "", quantity: 1, unit: "vnt.", price: 0, priceInput: "", vatType: "with_vat" }]);
  };

  const removeAdditionalItem = (index: number) => {
    setAdditionalItems(additionalItems.filter((_, i) => i !== index));
  };

  const updateAdditionalItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...additionalItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setAdditionalItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Jei automobilio pardavimas, sukuriame prekę iš automobilio duomenų + papildomos paslaugos
    let finalItems = items;
    if (invoiceType === "car_sale" && carDetails.make && carDetails.model) {
      const carDescription = `Automobilis ${carDetails.make} ${carDetails.model}${carDetails.vin ? `, VIN: ${carDetails.vin}` : ""}${carDetails.plate ? `, Nr.: ${carDetails.plate}` : ""}${carDetails.sdk ? `, SDK: ${carDetails.sdk}` : ""}${carDetails.mileage ? `, Rida: ${carDetails.mileage} km` : ""}`;
      const carItem: InvoiceItem = {
        description: carDescription,
        quantity: 1,
        unit: "vnt.",
        price: parseFloat(carPriceInput.replace(',', '.')) || 0,
        vatType: carVatType,
      };
      // Pridėti automobilį + papildomas paslaugas
      finalItems = [carItem, ...additionalItems];
    }
    
    const data: InvoiceData = {
      invoiceNumber,
      date,
      buyer,
      items: finalItems,
      note,
      invoiceType,
      carDetails: invoiceType === "car_sale" ? carDetails : undefined,
      bankAccount: selectedBankAccount || bankAccounts[0],
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

      {/* Bank Account Selection */}
      <Card className="form-section">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Banko sąskaita</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddBankAccount(!showAddBankAccount)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Pridėti
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddBankAccount && (
            <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
              <div className="space-y-2">
                <Label>Sąskaitos numeris</Label>
                <Input
                  value={newBankAccount.accountNumber}
                  onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
                  placeholder="LT..."
                  className="input-elegant"
                />
              </div>
              <div className="space-y-2">
                <Label>Bankas</Label>
                <Input
                  value={newBankAccount.bankName}
                  onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                  placeholder='pvz. AB "SEB"'
                  className="input-elegant"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (newBankAccount.accountNumber && newBankAccount.bankName) {
                      const added = addBankAccount(newBankAccount);
                      setSelectedBankAccount(added);
                      setNewBankAccount({ accountNumber: "", bankName: "" });
                      setShowAddBankAccount(false);
                    }
                  }}
                  disabled={!newBankAccount.accountNumber || !newBankAccount.bankName}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Išsaugoti
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddBankAccount(false);
                    setNewBankAccount({ accountNumber: "", bankName: "" });
                  }}
                >
                  Atšaukti
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Pasirinkti sąskaitą</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedBankAccount?.id || ""} 
                onValueChange={(id) => {
                  const account = bankAccounts.find(b => b.id === id);
                  if (account) setSelectedBankAccount(account);
                }}
              >
                <SelectTrigger className="input-elegant flex-1">
                  <SelectValue placeholder="Pasirinkite sąskaitą" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountNumber} ({account.bankName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBankAccount && bankAccounts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteBankAccount(selectedBankAccount.id);
                    setSelectedBankAccount(bankAccounts.find(a => a.id !== selectedBankAccount.id) || null);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
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
                <Label htmlFor="plate">Valstybinis numeris</Label>
                <Input
                  id="plate"
                  value={carDetails.plate}
                  onChange={(e) => setCarDetails({ ...carDetails, plate: e.target.value })}
                  className="input-elegant"
                  placeholder="pvz. ABC123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sdk">SDK</Label>
                <Input
                  id="sdk"
                  value={carDetails.sdk}
                  onChange={(e) => setCarDetails({ ...carDetails, sdk: e.target.value })}
                  className="input-elegant"
                  placeholder="pvz. HFURJAO"
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
          <CardTitle>{invoiceType === "car_sale" ? "Automobilio kaina" : "Prekės / Paslaugos"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoiceType === "car_sale" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Automobilio kaina €</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={carPriceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow digits, comma, and dot
                    if (val === "" || /^[\d,.\s]*$/.test(val)) {
                      setCarPriceInput(val);
                    }
                  }}
                  className="input-elegant"
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>PVM</Label>
                <Select
                  value={carVatType}
                  onValueChange={(v) => {
                    setCarVatType(v as VatType);
                    // Automatiškai nustatyti maržos schemą
                    if (v === "margin_scheme") {
                      setCarDetails({ ...carDetails, isMarginScheme: true });
                    } else {
                      setCarDetails({ ...carDetails, isMarginScheme: false });
                    }
                  }}
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
                      type="text"
                      inputMode="decimal"
                      value={item.priceInput !== undefined ? item.priceInput : (item.price === 0 ? "" : item.price.toString())}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^[\d,.\s]*$/.test(val)) {
                          const numericVal = parseFloat(val.replace(',', '.').replace(/\s/g, '')) || 0;
                          const newItems = [...items];
                          newItems[index] = { ...newItems[index], price: numericVal, priceInput: val };
                          setItems(newItems);
                        }
                      }}
                      className="input-elegant"
                      placeholder="0,00"
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

      {/* Papildomos paslaugos (tik automobilio pardavimui) */}
      {invoiceType === "car_sale" && (
        <Card className="form-section">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Papildomos paslaugos (neprivaloma)</span>
              <Button type="button" variant="outline" size="sm" onClick={addAdditionalItem}>
                <Plus className="w-4 h-4 mr-1" />
                Pridėti
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {additionalItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Čia galite pridėti papildomas paslaugas, pvz. garantiją, remontą, draudimą ir pan.
              </p>
            ) : (
              additionalItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-4 space-y-1">
                    <Label>Aprašymas</Label>
                    <div className="flex gap-2">
                      <Input
                        value={item.description}
                        onChange={(e) => updateAdditionalItem(index, "description", e.target.value)}
                        className="input-elegant flex-1"
                        placeholder="pvz. Garantija 12 mėn."
                        required
                      />
                      {products.length > 0 && (
                        <Select onValueChange={(v) => {
                          const product = products.find((p) => p.id === v);
                          if (product) {
                            updateAdditionalItem(index, "description", product.description);
                            updateAdditionalItem(index, "price", product.default_price);
                          }
                        }}>
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
                      onChange={(e) => updateAdditionalItem(index, "quantity", parseInt(e.target.value) || 1)}
                      className="input-elegant"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-1 space-y-1">
                    <Label>Vnt.</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateAdditionalItem(index, "unit", e.target.value)}
                      className="input-elegant"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <Label>Kaina €</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={item.priceInput !== undefined ? item.priceInput : (item.price === 0 ? "" : item.price.toString())}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^[\d,.\s]*$/.test(val)) {
                          const numericVal = parseFloat(val.replace(',', '.').replace(/\s/g, '')) || 0;
                          const newItems = [...additionalItems];
                          newItems[index] = { ...newItems[index], price: numericVal, priceInput: val };
                          setAdditionalItems(newItems);
                        }
                      }}
                      className="input-elegant"
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="col-span-10 md:col-span-3 space-y-1">
                    <Label>PVM</Label>
                    <Select
                      value={item.vatType}
                      onValueChange={(v) => updateAdditionalItem(index, "vatType", v as VatType)}
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
                      onClick={() => removeAdditionalItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

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
