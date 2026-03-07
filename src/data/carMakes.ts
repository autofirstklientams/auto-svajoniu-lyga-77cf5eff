// List of car makes matching Autoplius datacollector, sorted alphabetically
export const CAR_MAKES = [
  "Abarth", "Acura", "Alfa Romeo", "Audi",
  "Bentley", "BMW", "Buick", "BYD",
  "Cadillac", "Chevrolet", "Chrysler", "Citroen", "Cupra",
  "Dacia", "Daewoo", "Daihatsu", "Dodge", "DS Automobiles",
  "Ferrari", "Fiat", "Ford",
  "Genesis", "GMC",
  "Honda", "Hummer", "Hyundai",
  "Infiniti", "Isuzu",
  "Jaguar", "Jeep",
  "Kia",
  "Lada", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lincoln", "Lotus",
  "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MG", "Mini", "Mitsubishi",
  "Nissan",
  "Oldsmobile", "Opel",
  "Peugeot", "Plymouth", "Polestar", "Pontiac", "Porsche",
  "Renault", "Rolls-Royce", "Rover",
  "Saab", "Seat", "Skoda", "Smart", "SsangYong", "Subaru", "Suzuki",
  "Tesla", "Toyota",
  "Volkswagen", "Volvo",
] as const;

export type CarMake = typeof CAR_MAKES[number];
