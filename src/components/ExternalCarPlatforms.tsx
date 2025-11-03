import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const ExternalCarPlatforms = () => {
  return (
    <div className="mt-12 text-center">
      <h3 className="text-2xl font-bold mb-6 text-foreground">
        Peržiūrėkite mūsų automobilius
      </h3>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        Daugiau mūsų siūlomų automobilių rasite populiariausiose Lietuvos automobilių platformose
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <a 
            href="https://www.autoplius.lt/autokopers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            Autoplius.lt
            <ExternalLink className="h-5 w-5" />
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold"
        >
          <a 
            href="https://www.autogidas.lt/autokopers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            Autogidas.lt
            <ExternalLink className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ExternalCarPlatforms;
