import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCars from "@/components/FeaturedCars";
import FinancingSection from "@/components/FinancingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturedCars />
        <FinancingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
