import CarCard from "./CarCard";
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";

const cars = [
  {
    image: car1,
    title: "BMW X5 M Sport",
    price: "42,990 €",
    year: 2022,
    mileage: "35,000 km",
    fuel: "Dyzelinas",
    featured: true,
  },
  {
    image: car2,
    title: "Mercedes-Benz E-Class",
    price: "38,500 €",
    year: 2021,
    mileage: "42,000 km",
    fuel: "Benzinas",
    featured: false,
  },
  {
    image: car3,
    title: "Tesla Model Y",
    price: "52,900 €",
    year: 2023,
    mileage: "18,000 km",
    fuel: "Elektra",
    featured: true,
  },
];

const FeaturedCars = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Rekomenduojami Automobiliai</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Atrinkti geriausių pasiūlymų automobiliai su lanksčiomis finansavimo sąlygomis
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <CarCard key={index} {...car} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
