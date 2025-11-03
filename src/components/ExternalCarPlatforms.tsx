import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import autopliusLogo from "@/assets/autoplius-logo-new.jpg";
import autogidasLogo from "@/assets/autogidas-logo-new.png";

const ExternalCarPlatforms = () => {
  return (
    <div className="mt-12 text-center">
      <h3 className="text-2xl font-bold mb-6 text-foreground">
        Peržiūrėkite mūsų automobilius
      </h3>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        Daugiau mūsų siūlomų automobilių rasite populiariausiose Lietuvos automobilių platformose
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
                alt="Autoplius.lt" 
                className="h-12 w-auto object-contain"
              />
              <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                <span>Peržiūrėti skelbimus</span>
                <ExternalLink className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </a>

        <a 
          href="https://www.autogidas.lt/autokopers" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group"
        >
          <Card className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary">
            <div className="flex flex-col items-center gap-4">
              <img 
                src={autogidasLogo} 
                alt="Autogidas.lt" 
                className="h-12 w-auto object-contain"
              />
              <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                <span>Peržiūrėti skelbimus</span>
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
