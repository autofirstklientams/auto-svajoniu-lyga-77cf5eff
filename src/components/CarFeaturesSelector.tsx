import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define all feature categories based on Autoplius
export const CAR_FEATURES = {
  salonas: {
    title: "Salonas",
    description: "Pasirinkite vidaus komforto ir apdailos elementus",
    options: [
      "Odinis salonas", "Iš dalies odinis", "Alcantara", "Sportinės sėdynės", "Tamsinti stiklai",
      "Daugiafunkcinis vairas", "Šildomos sėdynės", "Stoglangis", "Elektra valdomos sėdynės",
      "Panoraminis stogas", "Autonominis šildymas", "Ventiliuojamos sėdynės", "Elektra valdomos sėdynės su atmintimi",
      "Bagažinės uždangalas", "Šildomas vairas", "Masažuojančios sėdynės", "Dvi bagažinės", "Dvigubi stiklai"
    ]
  },
  elektronika: {
    title: "Elektronika",
    description: "Pažymėkite įrenginius, palengvinančius vairavimą ir kasdienybę",
    options: [
      "El. reguliuojami veidrodėliai", "Elektra valdomas bagažinės dangtis", "Automatiškai įsijungiantys žibintai",
      "Elektra reguliuojama vairo padėtis", "Kritulių jutiklis", "Šildomi veidrodėliai", "Pritemstantis veidrodėlis",
      "Atstumo jutiklių sistema", "Beraktė sistema", "Autopilotas", "Elektra šildomas priekinis stiklas",
      "Start-Stop funkcija", "Valdymas balsu", "Pavarų perjungimas prie vairo", "LCD ekranas", "Navigacija/GPS",
      "Projekcinis ekranas ant stiklo (HUD)", "Skaitmeninis prietaisų skydelis", "Bevielis telefono krovimas",
      "Liečiamas ekranas", "Nuotolinis programinės įrangos atnaujinimas", "Virtualūs veidrodėliai"
    ]
  },
  apsauga: {
    title: "Apsauga",
    description: "Įveskite apsaugos priemones nuo vagysčių",
    options: [
      "Imobilaizeris", "Signalizacija", "Palydovinė sekimo sistema", "Šarvuotas (apsaugos)"
    ]
  },
  audioVideo: {
    title: "Audio/Video įranga",
    description: "Nurodykite garso ir vaizdo sistemų elementus",
    options: [
      "CD grotuvas", "MP3 grotuvas", "Papildoma audio įranga", "CD keitiklis", "AUX jungtis",
      "Žemų dažnių garsiakalbis", "HiFi audio sistema", "DVD grotuvas", "USB jungtis", "USB-C jungtis",
      "Laisvų rankų įranga", "Apple CarPlay / Android Auto"
    ]
  },
  eksterjeras: {
    title: "Eksterjeras",
    description: "Pažymėkite išorės ypatumus",
    options: [
      "Lengvojo lydinio ratlankiai", "LED dienos žibintai", "LED žibintai", "Žibintai Xenon",
      "Rūko žibintai", "Kablys", "Priekinių žibintų plovimo įtaisas", "Stogo bagažinės laikikliai",
      "Automatiškai užsilenkiantys veidrodėliai", "Žieminių padangų komplektas", "Durelių pritraukimas", "Matriciniai žibintai"
    ]
  },
  kitiYpatumai: {
    title: "Kiti ypatumai",
    description: "Papildoma informacija apie automobilį",
    options: [
      "Neeksploatuota Lietuvoje", "Automobilis iš Amerikos", "Domina keitimas", "Parduodama lizingu",
      "Serviso knygelė", "Katalizatorius", "Keli raktų komplektai", "Pritaikytas neįgaliesiems",
      "Padidinta variklio galia", "Paruoštas autosportui", "Pneumatinė pakaba", "Atsarginis ratas",
      "Nuotolinis užvedimas", "Nuotolinė klimato kontrolė"
    ]
  },
  saugumas: {
    title: "Saugumas",
    description: "Nurodykite saugos įrangą",
    options: [
      "Traukos kontrolės sistema", "ESP", "Įkalnės stabdys", "Automatinio parkavimo sistema",
      "Atstumo palaikymo sistema", "Aklosios zonos stebėjimo sistema", "Juostos palaikymo sistema",
      "Naktinio matymo asistentas", "Kelio ženklų atpažinimo sistema", "ISOFIX tvirtinimo taškai",
      "Susidūrimo prevencijos sistema", "Tolimųjų šviesų asistentas", "Dinaminis posūkių apšvietimas",
      "Galinio vaizdo kamera", "Priekinio vaizdo kamera", "360° vaizdo kamera"
    ]
  },
  elektromobiliuYpatumai: {
    title: "Elektromobilių ypatumai",
    description: "Pažymėkite ypatybes apie elektromobilį",
    options: [
      "Greitasis krovimas", "Trifazis krovimas", "Dvipusis energijos perdavimas", "Šilumos siurblys",
      "Baterijos garantija", "APVA kompensacija nepanaudota"
    ]
  }
};

export type CarFeatures = {
  [category: string]: string[];
};

interface CarFeaturesSelectorProps {
  selectedFeatures: CarFeatures;
  onChange: (features: CarFeatures) => void;
  showSaveButton?: boolean;
}

const CarFeaturesSelector = ({ selectedFeatures, onChange, showSaveButton = true }: CarFeaturesSelectorProps) => {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  // Load saved default features on mount
  useEffect(() => {
    loadSavedFeatures();
  }, []);

  const loadSavedFeatures = async () => {
    setIsLoadingDefaults(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_car_features")
        .select("features")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading saved features:", error);
        return;
      }

      if (data?.features && Object.keys(selectedFeatures).length === 0) {
        onChange(data.features as CarFeatures);
      }
    } catch (error) {
      console.error("Error loading saved features:", error);
    } finally {
      setIsLoadingDefaults(false);
    }
  };

  const handleSaveDefaults = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vartotojas neprisijungęs");
        return;
      }

      // Check if record exists
      const { data: existing } = await supabase
        .from("saved_car_features")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("saved_car_features")
          .update({ features: selectedFeatures as any })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("saved_car_features")
          .insert({ user_id: user.id, features: selectedFeatures as any });
        if (error) throw error;
      }

      toast.success("Numatytosios ypatybės išsaugotos!");
    } catch (error: any) {
      console.error("Error saving features:", error);
      toast.error("Klaida saugant ypatybes");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(c => c !== categoryKey) 
        : [...prev, categoryKey]
    );
  };

  const toggleFeature = (categoryKey: string, feature: string) => {
    const currentCategoryFeatures = selectedFeatures[categoryKey] || [];
    const newCategoryFeatures = currentCategoryFeatures.includes(feature)
      ? currentCategoryFeatures.filter(f => f !== feature)
      : [...currentCategoryFeatures, feature];
    
    onChange({
      ...selectedFeatures,
      [categoryKey]: newCategoryFeatures
    });
  };

  const getCategoryCount = (categoryKey: string) => {
    return selectedFeatures[categoryKey]?.length || 0;
  };

  const getTotalOptions = (categoryKey: string) => {
    return CAR_FEATURES[categoryKey as keyof typeof CAR_FEATURES].options.length;
  };

  if (isLoadingDefaults) {
    return <div className="text-muted-foreground text-sm">Kraunamos ypatybės...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Automobilio ypatybės</h3>
        {showSaveButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDefaults}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saugoma..." : "Išsaugoti kaip numatytuosius"}
          </Button>
        )}
      </div>
      
      {Object.entries(CAR_FEATURES).map(([categoryKey, category]) => {
        const isOpen = openCategories.includes(categoryKey);
        const count = getCategoryCount(categoryKey);
        const total = getTotalOptions(categoryKey);

        return (
          <Collapsible key={categoryKey} open={isOpen} onOpenChange={() => toggleCategory(categoryKey)}>
            <div className="border rounded-lg">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  <div className="text-left">
                    <span className="font-medium text-primary">{category.title}</span>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${count > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {count} / {total}
                </span>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-2 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {category.options.map((option) => {
                      const isChecked = selectedFeatures[categoryKey]?.includes(option) || false;
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors ${isChecked ? 'text-primary font-medium' : 'text-foreground'}`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleFeature(categoryKey, option)}
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default CarFeaturesSelector;
