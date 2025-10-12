import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LoanCalculator from "@/components/LoanCalculator";
import FeaturedCars from "@/components/FeaturedCars";
import FinancingSection from "@/components/FinancingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <LoanCalculator />
        <FeaturedCars />
        <FinancingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
