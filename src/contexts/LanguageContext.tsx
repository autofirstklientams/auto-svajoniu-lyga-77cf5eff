import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "lt" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Lithuanian translations
const lt: Record<string, string> = {
  // Navigation
  "nav.home": "Pagrindinis",
  "nav.cars": "Automobiliai",
  "nav.leasing": "Lizingas",
  "nav.carPurchase": "Auto supirkimas",
  "nav.about": "Apie mus",
  "nav.partnerZone": "Partnerio zona",
  "nav.dashboard": "Valdymo skydelis",
  "nav.logout": "Atsijungti",

  // Hero section
  "hero.badge": "Paskolos nuo 6.9% metinių palūkanų",
  "hero.title": "Greitas",
  "hero.titleHighlight": "Finansavimas",
  "hero.titleEnd": "be Streso",
  "hero.description": "Platus naudotų automobilių pasirinkimas su finansavimu. Taip pat teikiame paskolas kitoms reikmėms – technikai, remontui ir kt.",
  "hero.viewCars": "Peržiūrėti Automobilius",
  "hero.satisfiedClients": "Patenkintų klientų",
  "hero.decision": "Sprendimas",
  "hero.interestFrom": "Palūkanos nuo",
  "hero.calculator": "Paskolos skaičiuoklė",
  "hero.loanAmount": "Paskolos suma",
  "hero.term": "Terminas",
  "hero.months": "mėn.",
  "hero.monthlyPaymentFrom": "Mėnesio įmoka nuo",
  "hero.calculatorTooltip": "Skaičiuojama su 6.9% metinėmis palūkanomis + 9.50 € mėn. mokestis.",
  "hero.perMonth": "€/mėn.",
  "hero.totalAmount": "Bendra suma",
  "hero.loanConditions": "Kredito sąlygos",
  "hero.annualRate": "Metinė palūkanų norma",
  "hero.loanSum": "Paskolos suma",
  "hero.monthlyFee": "Mėn. mokestis",
  "hero.contractFee": "Sutarties mokestis",
  "hero.bvkmnFrom": "BVKMNN nuo",
  "hero.bvkmnTooltip": "Bendrosios vidutinės kredito kainos metinė norma.",
  "hero.getOffer": "Gauti pasiūlymą",

  // Trust section
  "trust.reliable": "Patikima",
  "trust.reliableDesc": "Visi automobiliai su garantija ir draudimu",
  "trust.experience": "10+ Metų Patirtis",
  "trust.experienceDesc": "Ilgametė patirtis automobilių rinkoje",
  "trust.lowRates": "Žemos Palūkanos",
  "trust.lowRatesDesc": "Konkurencingos palūkanų normos nuo 3.9% metinių",
  "trust.fastProcess": "Greitas Procesas",
  "trust.fastProcessDesc": "Finansavimas per 30 min",

  // Featured cars
  "featured.title": "Siūlomi Automobiliai",
  "featured.description": "Peržiūrėkite mūsų rekomenduojamus automobilius su patraukliu finansavimu",
  "featured.viewAll": "Visi automobiliai",
  "featured.viewPlatforms": "Peržiūrėkite mūsų automobilius",
  "featured.viewListings": "Peržiūrėti skelbimus",
  "featured.recommended": "AUTOKOPERS rekomenduoja",

  // Car card
  "car.year": "Metai",
  "car.mileage": "Rida",
  "car.fuel": "Kuras",
  "car.view": "Peržiūrėti",
  "car.monthlyFrom": "Nuo",
  "car.perMonthShort": "/mėn.",

  // Financing section
  "financing.title": "Finansavimo Sprendimai",
  "financing.description": "Individualūs finansavimo planai, pritaikyti jūsų poreikiams",
  "financing.flexiblePlans": "Lankstūs Planai",
  "financing.flexiblePlansDesc": "Pritaikyta finansavimo tvarka pagal jūsų galimybes",
  "financing.lowRates": "Žemos Palūkanos",
  "financing.lowRatesDesc": "Konkurencingos palūkanų normos nuo 3.9% metinių",
  "financing.quickApproval": "Patvirtinimas per 1 val",
  "financing.quickApprovalDesc": "Greitas paraiškos nagrinėjimas ir atsakymas",
  "financing.calculate": "Apskaičiuoti mėnesinę įmoką",

  // Testimonials
  "testimonials.title": "Mūsų klientai sako",
  "testimonials.description": "Tūkstančiai patenkintų klientų jau rado savo automobilį",

  // Footer
  "footer.companyDesc": "Patikimas automobilių finansavimo partneris su ilgamete patirtimi rinkoje.",
  "footer.navigation": "Navigacija",
  "footer.contact": "Kontaktai",
  "footer.workingHours": "Darbo laikas",
  "footer.weekdays": "I-V: 9:00 - 18:00",
  "footer.saturday": "VI: 10:00 - 15:00",
  "footer.sunday": "VII: Nedirbame",
  "footer.rights": "Visos teisės saugomos.",

  // Contact section
  "contact.title": "Susisiekite",
  "contact.description": "Turite klausimų? Susisiekite su mumis!",
  "contact.email": "El. paštas",
  "contact.phone": "Telefonas",
  "contact.address": "Adresas",

  // Auth
  "auth.partnerLogin": "Partnerio prisijungimas",
  "auth.login": "Prisijungti",
  "auth.signup": "Registruotis",
  "auth.email": "El. paštas",
  "auth.password": "Slaptažodis",
  "auth.fullName": "Vardas Pavardė",
  "auth.forgotPassword": "Pamiršote slaptažodį?",
  "auth.resetPassword": "Atkurti slaptažodį",
  "auth.backToLogin": "Grįžti prie prisijungimo",
  "auth.sendResetLink": "Siųsti atkūrimo nuorodą",
  "auth.noAccount": "Neturite paskyros?",
  "auth.hasAccount": "Jau turite paskyrą?",
  "auth.signupSuccess": "Registracija sėkminga!",
  "auth.loginSuccess": "Sėkmingai prisijungėte!",
  "auth.resetEmailSent": "Atkūrimo nuoroda išsiųsta į el. paštą",

  // Partner Dashboard
  "dashboard.title": "Valdymo skydelis",
  "dashboard.myListings": "Mano skelbimai",
  "dashboard.newListing": "Naujas skelbimas",
  "dashboard.totalListings": "Viso skelbimų",
  "dashboard.webVisible": "Rodomi Web",
  "dashboard.autopliusVisible": "Rodomi Autoplius",
  "dashboard.unpublished": "Nepublikuota",
  "dashboard.search": "Ieškoti pagal markę ar modelį...",
  "dashboard.noListings": "Skelbimų nerasta",
  "dashboard.createFirst": "Sukurkite pirmą skelbimą",

  // Create listing
  "listing.edit": "Redaguoti skelbimą",
  "listing.new": "Naujas skelbimas",
  "listing.importFromAutoplius": "Importuoti iš Autoplius",
  "listing.importDesc": "Įklijuokite skelbimo nuorodą iš autoplius.lt ir automatiškai užpildysime formą",
  "listing.import": "Importuoti",
  "listing.importing": "Importuojama...",
  "listing.basicInfo": "Pagrindinė informacija",
  "listing.make": "Markė",
  "listing.model": "Modelis",
  "listing.year": "Metai",
  "listing.price": "Kaina (€)",
  "listing.mileage": "Rida (km)",
  "listing.fuelType": "Kuro tipas",
  "listing.transmission": "Pavarų dėžė",
  "listing.bodyType": "Kėbulo tipas",
  "listing.engineCapacity": "Variklio tūris (l)",
  "listing.power": "Galia (kW)",
  "listing.doors": "Durų skaičius",
  "listing.seats": "Sėdimų vietų",
  "listing.color": "Spalva",
  "listing.steeringWheel": "Vairas",
  "listing.condition": "Būklė",
  "listing.vin": "VIN kodas",
  "listing.defects": "Defektai",
  "listing.description": "Aprašymas",
  "listing.photos": "Nuotraukos",
  "listing.dropPhotos": "Nutempkite nuotraukas čia arba",
  "listing.selectPhotos": "pasirinkite failus",
  "listing.visibility": "Matomumas",
  "listing.visibleOnWeb": "Rodyti svetainėje",
  "listing.visibleOnAutoplius": "Rodyti Autoplius",
  "listing.featured": "Rekomenduojamas",
  "listing.recommended": "Išskirtinis",
  "listing.companyCar": "Įmonės automobilis",
  "listing.save": "Išsaugoti",
  "listing.saving": "Saugoma...",
  "listing.cancel": "Atšaukti",
  "listing.created": "Skelbimas sukurtas!",
  "listing.updated": "Skelbimas atnaujintas!",
  "listing.deleted": "Skelbimas ištrintas!",
  "listing.deleteConfirm": "Ar tikrai norite ištrinti šį skelbimą?",

  // Car detail
  "carDetail.backToList": "Grįžti į sąrašą",
  "carDetail.specifications": "Specifikacijos",
  "carDetail.features": "Įranga",
  "carDetail.description": "Aprašymas",
  "carDetail.financing": "Finansavimas",
  "carDetail.monthlyPayment": "Mėnesio įmoka",
  "carDetail.applyNow": "Pateikti paraišką",
  "carDetail.contactUs": "Susisiekite",

  // Leasing page
  "leasing.title": "Lizingas",
  "leasing.description": "Automobilių lizingas su palankiausiomis sąlygomis",

  // Car purchase page
  "carPurchase.title": "Auto supirkimas",
  "carPurchase.description": "Superkame automobilius greitai ir brangiai",
  "carPurchase.instantEval": "Momentinė įvertinimas",
  "carPurchase.instantEvalDesc": "Gausite automobilio vertinimą per kelias minutes",
  "carPurchase.bestPrice": "Geriausia kaina",
  "carPurchase.bestPriceDesc": "Siūlome konkurencingas kainas už jūsų automobilį",
  "carPurchase.quickDeal": "Greitas sandoris",
  "carPurchase.quickDealDesc": "Visas procesas užtrunka vos kelias valandas",
  "carPurchase.safeDeal": "Saugus sandoris",
  "carPurchase.safeDealDesc": "Oficialus sandoris su visais dokumentais",
  "carPurchase.howItWorks": "Kaip tai veikia",
  "carPurchase.step1": "Pateikite užklausą",
  "carPurchase.step1Desc": "Užpildykite formą su automobilio duomenimis",
  "carPurchase.step2": "Gausite vertinimą",
  "carPurchase.step2Desc": "Mūsų specialistai įvertins automobilį",
  "carPurchase.step3": "Susitarkime",
  "carPurchase.step3Desc": "Suderinę kainą, sudarome sandorį",
  "carPurchase.step4": "Gaukite pinigus",
  "carPurchase.step4Desc": "Pinigai pervedami iš karto",
  "carPurchase.submitRequest": "Pateikti užklausą",
  "carPurchase.orCall": "arba skambinkite",

  // About page
  "about.title": "Apie mus",
  "about.description": "Patikimas automobilių finansavimo partneris",

  // Car catalog
  "catalog.title": "Automobilių katalogas",
  "catalog.filter": "Filtruoti",
  "catalog.clearFilters": "Išvalyti filtrus",
  "catalog.noResults": "Automobilių nerasta",
  "catalog.adjustFilters": "Pakeiskite filtrus arba",
  "catalog.viewAll": "peržiūrėkite visus",

  // Loan form
  "loan.title": "Paskolos paraiška",
  "loan.name": "Vardas Pavardė",
  "loan.email": "El. paštas",
  "loan.phone": "Telefonas",
  "loan.amount": "Paskolos suma",
  "loan.term": "Terminas",
  "loan.monthlyPayment": "Mėnesio įmoka",
  "loan.submit": "Pateikti paraišką",
  "loan.submitting": "Siunčiama...",
  "loan.success": "Paraiška išsiųsta sėkmingai!",

  // Cookie consent
  "cookie.message": "Ši svetainė naudoja slapukus, kad pagerintų jūsų patirtį.",
  "cookie.accept": "Sutinku",
  "cookie.decline": "Nesutinku",

  // Common
  "common.loading": "Kraunama...",
  "common.error": "Klaida",
  "common.success": "Sėkmingai!",
  "common.save": "Išsaugoti",
  "common.cancel": "Atšaukti",
  "common.delete": "Ištrinti",
  "common.edit": "Redaguoti",
  "common.back": "Grįžti",
  "common.next": "Toliau",
  "common.previous": "Atgal",
  "common.search": "Ieškoti",
  "common.filter": "Filtruoti",
  "common.all": "Visi",
  "common.yes": "Taip",
  "common.no": "Ne",
};

// English translations
const en: Record<string, string> = {
  // Navigation
  "nav.home": "Home",
  "nav.cars": "Cars",
  "nav.leasing": "Leasing",
  "nav.carPurchase": "Car Purchase",
  "nav.about": "About",
  "nav.partnerZone": "Partner Zone",
  "nav.dashboard": "Dashboard",
  "nav.logout": "Logout",

  // Hero section
  "hero.badge": "Loans from 6.9% annual interest",
  "hero.title": "Fast",
  "hero.titleHighlight": "Financing",
  "hero.titleEnd": "Without Stress",
  "hero.description": "Wide selection of used cars with financing. We also provide loans for other needs – equipment, repairs, etc.",
  "hero.viewCars": "View Cars",
  "hero.satisfiedClients": "Satisfied clients",
  "hero.decision": "Decision",
  "hero.interestFrom": "Interest from",
  "hero.calculator": "Loan Calculator",
  "hero.loanAmount": "Loan amount",
  "hero.term": "Term",
  "hero.months": "mo.",
  "hero.monthlyPaymentFrom": "Monthly payment from",
  "hero.calculatorTooltip": "Calculated with 6.9% annual interest + €9.50 monthly fee.",
  "hero.perMonth": "€/mo.",
  "hero.totalAmount": "Total amount",
  "hero.loanConditions": "Loan Conditions",
  "hero.annualRate": "Annual interest rate",
  "hero.loanSum": "Loan amount",
  "hero.monthlyFee": "Monthly fee",
  "hero.contractFee": "Contract fee",
  "hero.bvkmnFrom": "APR from",
  "hero.bvkmnTooltip": "Annual Percentage Rate of Charge.",
  "hero.getOffer": "Get an offer",

  // Trust section
  "trust.reliable": "Reliable",
  "trust.reliableDesc": "All cars with warranty and insurance",
  "trust.experience": "10+ Years Experience",
  "trust.experienceDesc": "Long-term experience in the car market",
  "trust.lowRates": "Low Rates",
  "trust.lowRatesDesc": "Competitive interest rates from 3.9% annually",
  "trust.fastProcess": "Fast Process",
  "trust.fastProcessDesc": "Financing in 30 min",

  // Featured cars
  "featured.title": "Featured Cars",
  "featured.description": "Browse our recommended cars with attractive financing",
  "featured.viewAll": "All cars",
  "featured.viewPlatforms": "View our cars",
  "featured.viewListings": "View listings",
  "featured.recommended": "AUTOKOPERS recommends",

  // Car card
  "car.year": "Year",
  "car.mileage": "Mileage",
  "car.fuel": "Fuel",
  "car.view": "View",
  "car.monthlyFrom": "From",
  "car.perMonthShort": "/mo.",

  // Financing section
  "financing.title": "Financing Solutions",
  "financing.description": "Individual financing plans tailored to your needs",
  "financing.flexiblePlans": "Flexible Plans",
  "financing.flexiblePlansDesc": "Financing terms adjusted to your capabilities",
  "financing.lowRates": "Low Rates",
  "financing.lowRatesDesc": "Competitive interest rates from 3.9% annually",
  "financing.quickApproval": "Approval in 1 hour",
  "financing.quickApprovalDesc": "Quick application review and response",
  "financing.calculate": "Calculate monthly payment",

  // Testimonials
  "testimonials.title": "What our clients say",
  "testimonials.description": "Thousands of satisfied clients have found their car",

  // Footer
  "footer.companyDesc": "Reliable car financing partner with long-term market experience.",
  "footer.navigation": "Navigation",
  "footer.contact": "Contact",
  "footer.workingHours": "Working Hours",
  "footer.weekdays": "Mon-Fri: 9:00 - 18:00",
  "footer.saturday": "Sat: 10:00 - 15:00",
  "footer.sunday": "Sun: Closed",
  "footer.rights": "All rights reserved.",

  // Contact section
  "contact.title": "Contact Us",
  "contact.description": "Have questions? Get in touch with us!",
  "contact.email": "Email",
  "contact.phone": "Phone",
  "contact.address": "Address",

  // Auth
  "auth.partnerLogin": "Partner Login",
  "auth.login": "Login",
  "auth.signup": "Sign Up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.fullName": "Full Name",
  "auth.forgotPassword": "Forgot password?",
  "auth.resetPassword": "Reset Password",
  "auth.backToLogin": "Back to login",
  "auth.sendResetLink": "Send reset link",
  "auth.noAccount": "Don't have an account?",
  "auth.hasAccount": "Already have an account?",
  "auth.signupSuccess": "Registration successful!",
  "auth.loginSuccess": "Successfully logged in!",
  "auth.resetEmailSent": "Reset link sent to your email",

  // Partner Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.myListings": "My Listings",
  "dashboard.newListing": "New Listing",
  "dashboard.totalListings": "Total listings",
  "dashboard.webVisible": "Visible on Web",
  "dashboard.autopliusVisible": "Visible on Autoplius",
  "dashboard.unpublished": "Unpublished",
  "dashboard.search": "Search by make or model...",
  "dashboard.noListings": "No listings found",
  "dashboard.createFirst": "Create your first listing",

  // Create listing
  "listing.edit": "Edit Listing",
  "listing.new": "New Listing",
  "listing.importFromAutoplius": "Import from Autoplius",
  "listing.importDesc": "Paste the listing URL from autoplius.lt to auto-fill the form",
  "listing.import": "Import",
  "listing.importing": "Importing...",
  "listing.basicInfo": "Basic Information",
  "listing.make": "Make",
  "listing.model": "Model",
  "listing.year": "Year",
  "listing.price": "Price (€)",
  "listing.mileage": "Mileage (km)",
  "listing.fuelType": "Fuel Type",
  "listing.transmission": "Transmission",
  "listing.bodyType": "Body Type",
  "listing.engineCapacity": "Engine Capacity (l)",
  "listing.power": "Power (kW)",
  "listing.doors": "Doors",
  "listing.seats": "Seats",
  "listing.color": "Color",
  "listing.steeringWheel": "Steering Wheel",
  "listing.condition": "Condition",
  "listing.vin": "VIN Code",
  "listing.defects": "Defects",
  "listing.description": "Description",
  "listing.photos": "Photos",
  "listing.dropPhotos": "Drop photos here or",
  "listing.selectPhotos": "select files",
  "listing.visibility": "Visibility",
  "listing.visibleOnWeb": "Show on website",
  "listing.visibleOnAutoplius": "Show on Autoplius",
  "listing.featured": "Recommended",
  "listing.recommended": "Featured",
  "listing.companyCar": "Company car",
  "listing.save": "Save",
  "listing.saving": "Saving...",
  "listing.cancel": "Cancel",
  "listing.created": "Listing created!",
  "listing.updated": "Listing updated!",
  "listing.deleted": "Listing deleted!",
  "listing.deleteConfirm": "Are you sure you want to delete this listing?",

  // Car detail
  "carDetail.backToList": "Back to list",
  "carDetail.specifications": "Specifications",
  "carDetail.features": "Features",
  "carDetail.description": "Description",
  "carDetail.financing": "Financing",
  "carDetail.monthlyPayment": "Monthly payment",
  "carDetail.applyNow": "Apply now",
  "carDetail.contactUs": "Contact us",

  // Leasing page
  "leasing.title": "Leasing",
  "leasing.description": "Car leasing with the best conditions",

  // Car purchase page
  "carPurchase.title": "Car Purchase",
  "carPurchase.description": "We buy cars quickly and at the best price",
  "carPurchase.instantEval": "Instant Evaluation",
  "carPurchase.instantEvalDesc": "Get your car evaluation in minutes",
  "carPurchase.bestPrice": "Best Price",
  "carPurchase.bestPriceDesc": "We offer competitive prices for your car",
  "carPurchase.quickDeal": "Quick Deal",
  "carPurchase.quickDealDesc": "The whole process takes just a few hours",
  "carPurchase.safeDeal": "Safe Deal",
  "carPurchase.safeDealDesc": "Official transaction with all documents",
  "carPurchase.howItWorks": "How It Works",
  "carPurchase.step1": "Submit a request",
  "carPurchase.step1Desc": "Fill out the form with car details",
  "carPurchase.step2": "Get evaluation",
  "carPurchase.step2Desc": "Our specialists will evaluate your car",
  "carPurchase.step3": "Make a deal",
  "carPurchase.step3Desc": "Once price is agreed, we close the deal",
  "carPurchase.step4": "Get paid",
  "carPurchase.step4Desc": "Money is transferred immediately",
  "carPurchase.submitRequest": "Submit request",
  "carPurchase.orCall": "or call",

  // About page
  "about.title": "About Us",
  "about.description": "Reliable car financing partner",

  // Car catalog
  "catalog.title": "Car Catalog",
  "catalog.filter": "Filter",
  "catalog.clearFilters": "Clear filters",
  "catalog.noResults": "No cars found",
  "catalog.adjustFilters": "Adjust filters or",
  "catalog.viewAll": "view all",

  // Loan form
  "loan.title": "Loan Application",
  "loan.name": "Full Name",
  "loan.email": "Email",
  "loan.phone": "Phone",
  "loan.amount": "Loan amount",
  "loan.term": "Term",
  "loan.monthlyPayment": "Monthly payment",
  "loan.submit": "Submit application",
  "loan.submitting": "Submitting...",
  "loan.success": "Application submitted successfully!",

  // Cookie consent
  "cookie.message": "This website uses cookies to improve your experience.",
  "cookie.accept": "Accept",
  "cookie.decline": "Decline",

  // Common
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success!",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.back": "Back",
  "common.next": "Next",
  "common.previous": "Previous",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.all": "All",
  "common.yes": "Yes",
  "common.no": "No",
};

const translations: Record<Language, Record<string, string>> = { lt, en };

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      if (saved === "lt" || saved === "en") return saved;
    }
    return "lt";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
