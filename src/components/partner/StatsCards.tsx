import { Car, Globe, ExternalLink, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalCars: number;
  webVisible: number;
  autopliusVisible: number;
}

export function StatsCards({ totalCars, webVisible, autopliusVisible }: StatsCardsProps) {
  const stats = [
    {
      title: "Viso skelbimų",
      value: totalCars,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Rodomi Web",
      value: webVisible,
      icon: Globe,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Rodomi Autoplius",
      value: autopliusVisible,
      icon: ExternalLink,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Nepublikuota",
      value: totalCars - Math.max(webVisible, autopliusVisible),
      icon: Eye,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
