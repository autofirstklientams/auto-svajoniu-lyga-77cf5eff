import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";

// Critical route – loaded eagerly
import Index from "./pages/Index";

// Lazy-loaded routes
const About = lazy(() => import("./pages/About"));
const CarSearch = lazy(() => import("./pages/CarSearch"));
const CarPurchase = lazy(() => import("./pages/CarPurchase"));
const CarDetail = lazy(() => import("./pages/CarDetail"));
const CarCatalog = lazy(() => import("./pages/CarCatalog"));
const PartnerLogin = lazy(() => import("./pages/PartnerLogin"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SellYourCar = lazy(() => import("./pages/SellYourCar"));
const Leasing = lazy(() => import("./pages/Leasing"));
const Invoice = lazy(() => import("./pages/Invoice"));
const InvoiceAuth = lazy(() => import("./pages/InvoiceAuth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min – data stays fresh, no refetches
      gcTime: 30 * 60 * 1000,   // 30 min – keep unused cache in memory
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/car-search" element={<CarSearch />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/car-purchase" element={<CarPurchase />} />
              <Route path="/sell-your-car" element={<SellYourCar />} />
              <Route path="/leasing" element={<Leasing />} />
              <Route path="/lizingas" element={<Leasing />} />
              <Route path="/automobiliai" element={<CarCatalog />} />
              <Route path="/partner-login" element={<PartnerLogin />} />
              <Route path="/partner-dashboard" element={<PartnerDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/auth" element={<InvoiceAuth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
