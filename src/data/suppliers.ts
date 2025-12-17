export interface Supplier {
  id: string;
  name: string;
  companyCode: string;
  vatCode?: string;
  address: string;
  isCompany: boolean; // true = juridinis, false = fizinis asmuo
}

export const popularSuppliers: Supplier[] = [
  {
    id: "bigbank",
    name: "Bigbank AS filialas",
    companyCode: "301048563",
    vatCode: "LT100004120611",
    address: "Jogailos g. 4, Vilnius",
    isCompany: true,
  },
  {
    id: "inbank",
    name: "AS Inbank filialas",
    companyCode: "305340173",
    vatCode: "LT100012843518",
    address: "Kareivių g. 11B, Vilnius",
    isCompany: true,
  },
  {
    id: "seb-lizingas",
    name: "SEB lizingas",
    companyCode: "111681846",
    vatCode: "LT116818415",
    address: "Gedimino pr. 12, Vilnius",
    isCompany: true,
  },
  {
    id: "swedbank-lizingas",
    name: "Swedbank lizingas",
    companyCode: "211439080",
    vatCode: "LT114390811",
    address: "Konstitucijos pr. 20A, Vilnius",
    isCompany: true,
  },
  {
    id: "mokilizingas",
    name: "UAB Mokilizingas",
    companyCode: "302831331",
    vatCode: "LT100007174510",
    address: "J. Basanavičiaus g. 26, Vilnius",
    isCompany: true,
  },
  {
    id: "silita",
    name: 'UAB "SILITA"',
    companyCode: "132915039",
    vatCode: "LT329150314",
    address: "Laisvės al. 11-2, Kaunas",
    isCompany: true,
  },
];

export interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
}

export const bankAccounts: BankAccount[] = [
  {
    id: "seb1",
    accountNumber: "LT567044090102112880",
    bankName: 'AB "SEB"',
  },
  {
    id: "seb2",
    accountNumber: "LT257044090109492228",
    bankName: 'AB "SEB"',
  },
];

export const sellerInfo = {
  name: 'MB "Autodealeriai"',
  companyCode: "305825810",
  vatCode: "LT100015779014",
  address: "Apės g. 11, Kaunas",
};

export type VatType = "with_vat" | "no_vat" | "vat_exempt" | "margin_scheme";

export const vatTypeLabels: Record<VatType, string> = {
  with_vat: "Su PVM (21%)",
  no_vat: "Be PVM",
  vat_exempt: "PVM neapmokestinama (28 str.)",
  margin_scheme: "Maržos schema (106 str.)",
};

export const popularNotes = [
  {
    id: "10days",
    text: "Apmokėti per 10 d.d nuo sąskaitos gavimo.",
  },
  {
    id: "14days",
    text: "Apmokėti per 14 d.d nuo sąskaitos gavimo.",
  },
  {
    id: "30days",
    text: "Apmokėti per 30 d.d nuo sąskaitos gavimo.",
  },
  {
    id: "immediate",
    text: "Apmokėti iš karto.",
  },
  {
    id: "prepaid",
    text: "Apmokėta.",
  },
  {
    id: "none",
    text: "",
  },
];
