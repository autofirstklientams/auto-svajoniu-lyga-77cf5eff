import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import autopliusLogo from "@/assets/autoplius-logo-new.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const ExternalCarPlatforms = () => {
  const { t } = useLanguage();

  return (
    <div className="mt-12 text-center">
      <h3 className="text-2xl font-bold mb-6 text-foreground">
        {t("featured.viewPlatforms")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-4xl mx-auto">
        <a 
          href="https://www.autoplius.lt/autokopers" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group"
        >
          <Card className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary">
            <div className="flex flex-col items-center gap-4">
              <img 
                src={autopliusLogo} 
                alt="Autoplius.lt AutoKopers skelbimai" 
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
              <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                <span>{t("featured.viewListings")}</span>
                <ExternalLink className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </a>
      </div>
    </div>
  );
};

export default ExternalCarPlatforms;
