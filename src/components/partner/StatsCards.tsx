import { Car, Globe, ExternalLink, Eye, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalCars: number;
  webVisible: number;
  autopliusVisible: number;
  soldCount?: number;
  reservedCount?: number;
}

export function StatsCards({ totalCars, webVisible, autopliusVisible, soldCount = 0, reservedCount = 0 }: StatsCardsProps) {
  const stats = [
    {
      title: "Viso skelbimų",
      value: totalCars,
      icon: Car,
      gradient: "from-primary/15 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Rodomi Web",
      value: webVisible,
      icon: Globe,
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconColor: "text-emerald-600",
    },
    {
      title: "Autoplius",
      value: autopliusVisible,
      icon: ExternalLink,
      gradient: "from-blue-500/15 to-blue-500/5",
      iconColor: "text-blue-600",
    },
    {
      title: "Rezervuoti",
      value: reservedCount,
      icon: ShieldCheck,
      gradient: "from-amber-500/15 to-amber-500/5",
      iconColor: "text-amber-600",
    },
    {
      title: "Parduoti",
      value: soldCount,
      icon: CheckCircle2,
      gradient: "from-muted-foreground/15 to-muted-foreground/5",
      iconColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <CardContent className={`p-3 sm:p-4 bg-gradient-to-br ${stat.gradient}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor} flex-shrink-0`} />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
