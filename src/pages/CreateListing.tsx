import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, Link, Loader2, Globe, ExternalLink, X, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import CarFeaturesSelector, { CarFeatures } from "@/components/CarFeaturesSelector";
import { DraggableImageGrid, DraggableImage } from "@/components/DraggableImageGrid";
import { useAiAccess } from "@/hooks/useAiAccess";
import { processImages } from "@/utils/imageUtils";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { autopliusMakes } from "@/data/autopliusMakes";

const carSchema = z.object({
  make: z.string().trim().min(1, "Markė privaloma"),
  model: z.string().trim().min(1, "Modelis privalomas"),
  year: z.number().min(1900, "Neteisingi metai").max(new Date().getFullYear() + 1),
  price: z.number().min(0, "Kaina negali būti neigiama"),
  mileage: z.number().min(0).optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  description: z.string().optional(),
  body_type: z.string().optional(),
  engine_capacity: z.number().min(0).optional(),
  power_kw: z.number().min(0).optional(),
  doors: z.number().min(2).max(5).optional(),
  seats: z.number().min(1).max(9).optional(),
  color: z.string().optional(),
  steering_wheel: z.string().optional(),
  condition: z.string().optional(),
  vin: z.string().optional(),
  defects: z.string().optional(),
});

interface CreateListingProps {
  car?: any;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  canExportAutoplius?: boolean;
}

const CreateListing = ({
  car,
  onClose,
  onSuccess,
  isAdmin = false,
  isSuperAdmin = false,
  canExportAutoplius = false,
}: CreateListingProps) => {
  const { hasAiAccess } = useAiAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  const [autopliusUrl, setAutopliusUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: string, url: string, order: number}>>([]);
  const [importedImageUrls, setImportedImageUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<CarFeatures>(
    car?.features || {}
  );
  const [visibleWeb, setVisibleWeb] = useState(car?.visible_web ?? true);
  const [visibleAutoplius, setVisibleAutoplius] = useState(car?.visible_autoplius ?? false);
  const [visibleAutolizingas, setVisibleAutolizingas] = useState(car?.visible_autolizingas ?? false);
  const [isCompanyCar, setIsCompanyCar] = useState(car?.is_company_car ?? false);
  const [isFeatured, setIsFeatured] = useState(car?.is_featured ?? false);
  const [isRecommended, setIsRecommended] = useState(car?.is_recommended ?? false);
  const [modelOptions, setModelOptions] = useState<Array<{ name: string; id: string }>>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year || ("" as any),
    price: car?.price || 0,
    mileage: car?.mileage || 0,
    fuel_type: car?.fuel_type || "",
    transmission: car?.transmission || "",
    description: car?.description || "",
    body_type: car?.body_type || "",
    engine_capacity: car?.engine_capacity || 0,
    power_kw: car?.power_kw || 0,
    doors: car?.doors || 4,
    seats: car?.seats || 5,
    color: car?.color || "",
    steering_wheel: car?.steering_wheel || "",
    condition: car?.condition || "",
    vin: car?.vin || "",
    defects: car?.defects || "",
    // New Autoplius fields
    euro_standard: car?.euro_standard || "",
    fuel_cons_urban: car?.fuel_cons_urban || 0,
    fuel_cons_highway: car?.fuel_cons_highway || 0,
    fuel_cons_combined: car?.fuel_cons_combined || 0,
    origin_country: car?.origin_country || "",
    wheel_drive: car?.wheel_drive || "",
    co2_emission: car?.co2_emission || 0,
    city: car?.city || "Kaunas",
    sdk_code: car?.sdk_code || "",
    first_reg_date: car?.first_reg_date || "",
    mot_date: car?.mot_date || "",
    wheel_size: car?.wheel_size || "",
  });

  // Fetch models when make changes
  const fetchModels = useCallback(async (makeName: string) => {
    const makeEntry = autopliusMakes.find((m) => m.name === makeName);
    if (!makeEntry) {
      setModelOptions([]);
      return;
    }
    setIsLoadingModels(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/get-autoplius-models?make_id=${makeEntry.id}`
      );
      if (resp.ok) {
        const models = await resp.json();
        setModelOptions(models);
      } else {
        console.error("Failed to fetch models");
        setModelOptions([]);
      }
    } catch (e) {
      console.error("Error fetching models:", e);
      setModelOptions([]);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    if (formData.make) {
      fetchModels(formData.make);
    } else {
      setModelOptions([]);
    }
  }, [formData.make, fetchModels]);
  // Auto-save on blur
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [draftCarId, setDraftCarId] = useState<string | null>(car?.id || null);

  const getOrCreateCarId = useCallback(async (): Promise<string | null> => {
    if (draftCarId) return draftCarId;
    
    // Need at least make, model, year, price to create
    if (!formData.make || !formData.model || !formData.year || !formData.price) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: newCar, error } = await supabase
        .from("cars")
        .insert({
          make: formData.make,
          model: formData.model,
          year: formData.year,
          price: formData.price,
          partner_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      setDraftCarId(newCar.id);
      return newCar.id;
    } catch (err) {
      console.error('Failed to create draft car:', err);
      return null;
    }
  }, [draftCarId, formData.make, formData.model, formData.year, formData.price]);

  const autoSaveField = useCallback(async (fieldName: string, value: any) => {
    const carId = await getOrCreateCarId();
    if (!carId) return;
    
    // Convert empty strings to null for DB
    const dbValue = value === "" || value === 0 ? null : value;
    
    setAutoSaveStatus('saving');
    try {
      const { error } = await supabase
        .from("cars")
        .update({ [fieldName]: dbValue })
        .eq("id", carId);
      
      if (error) throw error;
      
      setAutoSaveStatus('saved');
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Auto-save error:', err);
      setAutoSaveStatus('error');
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [getOrCreateCarId]);

  // Map form field IDs to DB column names
  const fieldIdToDbColumn: Record<string, string> = {
    price: 'price', mileage: 'mileage', vin: 'vin', color: 'color',
    description: 'description', defects: 'defects', engine_capacity: 'engine_capacity',
    power_kw: 'power_kw', doors: 'doors', seats: 'seats', co2_emission: 'co2_emission',
    fuel_cons_urban: 'fuel_cons_urban', fuel_cons_highway: 'fuel_cons_highway',
    fuel_cons_combined: 'fuel_cons_combined', origin_country: 'origin_country',
    city: 'city', sdk_code: 'sdk_code', wheel_size: 'wheel_size',
    first_reg_date: 'first_reg_date', mot_date: 'mot_date',
    euro_standard: 'euro_standard',
  };

  const handleFormBlur = useCallback((e: React.FocusEvent) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const fieldId = target.id;
    const dbColumn = fieldIdToDbColumn[fieldId];
    if (!dbColumn) return;
    
    const value = formData[dbColumn as keyof typeof formData];
    autoSaveField(dbColumn, value);
  }, [formData, autoSaveField]);

  const handleSelectChange = useCallback((fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    autoSaveField(fieldName, value);
  }, [autoSaveField]);

  const handleImportFromAutoplius = async () => {
    if (!autopliusUrl.trim()) {
      toast.error("Įveskite Autoplius nuorodą");
      return;
    }

    if (!autopliusUrl.includes('autoplius.lt')) {
      toast.error("Nuoroda turi būti iš autoplius.lt");
      return;
    }

    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-autoplius', {
        body: { url: autopliusUrl.trim() },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Nepavyko importuoti');
      }

      const carData = data.data;
      
      setFormData(prev => ({
        ...prev,
        make: carData.make || prev.make,
        model: carData.model || prev.model,
        year: carData.year || prev.year,
        price: carData.price || prev.price,
        mileage: carData.mileage || prev.mileage,
        fuel_type: carData.fuel_type || prev.fuel_type,
        transmission: carData.transmission || prev.transmission,
        body_type: carData.body_type || prev.body_type,
        engine_capacity: carData.engine_capacity || prev.engine_capacity,
        power_kw: carData.power_kw || prev.power_kw,
        doors: carData.doors || prev.doors,
        color: carData.color || prev.color,
        steering_wheel: carData.steering_wheel || prev.steering_wheel,
        condition: carData.condition || prev.condition,
        vin: carData.vin || prev.vin,
        description: carData.description || prev.description,
      }));

      if (carData.images && carData.images.length > 0) {
        setImportedImageUrls(carData.images);
        toast.success(`Importuota ${carData.images.length} nuotraukų`);
      }

      toast.success("Skelbimas importuotas!");
      setAutopliusUrl("");
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Klaida importuojant skelbimą");
    } finally {
      setIsImporting(false);
    }
  };


  const syncAutopliusFeed = async (
    options?: { includeCarId?: string; expectCarInFeed?: boolean }
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-autoplius-xml", {
        body: {
          action: "push",
          include_car_id: options?.includeCarId,
          expect_car_in_feed: options?.expectCarInFeed === true,
        },
      });

      if (error) {
        throw new Error(error.message || "Nepavyko sinchronizuoti su Autoplius");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Autoplius sinchronizacija nepavyko");
      }

      return {
        success: true,
        message:
          typeof data?.message === "string"
            ? data.message
            : "Autoplius sinchronizacija atlikta",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Autoplius sinchronizacija nepavyko";
      console.error("Autoplius sync error:", error);
      return { success: false, message: errorMessage };
    }
  };

  const fetchExistingImages = useCallback(async (carId: string) => {
    
    const { data, error } = await supabase
      .from("car_images")
      .select("*")
      .eq("car_id", carId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching images:", error);
      return;
    }

    setExistingImages(data?.map(img => ({ id: img.id, url: img.image_url, order: img.display_order })) || []);
  }, []);

  const applyCarToState = useCallback((source: any) => {
    setFormData({
      make: source?.make || "",
      model: source?.model || "",
      year: source?.year || ("" as any),
      price: source?.price || 0,
      mileage: source?.mileage || 0,
      fuel_type: source?.fuel_type || "",
      transmission: source?.transmission || "",
      description: source?.description || "",
      body_type: source?.body_type || "",
      engine_capacity: source?.engine_capacity || 0,
      power_kw: source?.power_kw || 0,
      doors: source?.doors || 4,
      seats: source?.seats || 5,
      color: source?.color || "",
      steering_wheel: source?.steering_wheel || "",
      condition: source?.condition || "",
      vin: source?.vin || "",
      defects: source?.defects || "",
      euro_standard: source?.euro_standard || "",
      fuel_cons_urban: source?.fuel_cons_urban || 0,
      fuel_cons_highway: source?.fuel_cons_highway || 0,
      fuel_cons_combined: source?.fuel_cons_combined || 0,
      origin_country: source?.origin_country || "",
      wheel_drive: source?.wheel_drive || "",
      co2_emission: source?.co2_emission || 0,
      city: source?.city || "Kaunas",
      sdk_code: source?.sdk_code || "",
      first_reg_date: source?.first_reg_date || "",
      mot_date: source?.mot_date || "",
      wheel_size: source?.wheel_size || "",
    });

    setSelectedFeatures(source?.features || {});
    setVisibleWeb(source?.visible_web ?? true);
    setVisibleAutoplius(source?.visible_autoplius ?? false);
    setVisibleAutolizingas(source?.visible_autolizingas ?? false);
    setIsCompanyCar(source?.is_company_car ?? false);
    setIsFeatured(source?.is_featured ?? false);
    setIsRecommended(source?.is_recommended ?? false);
  }, []);

  // Reset/hydrate form when switching between create/edit (keying off ID avoids noisy resets)
  useEffect(() => {
    let cancelled = false;

    const resetToDefaults = () => {
      setFormData({
        make: "",
        model: "",
        year: "" as any,
        price: 0,
        mileage: 0,
        fuel_type: "",
        transmission: "",
        description: "",
        body_type: "",
        engine_capacity: 0,
        power_kw: 0,
        doors: 4,
        seats: 5,
        color: "",
        steering_wheel: "",
        condition: "",
        vin: "",
        defects: "",
        euro_standard: "",
        fuel_cons_urban: 0,
        fuel_cons_highway: 0,
        fuel_cons_combined: 0,
        origin_country: "",
        wheel_drive: "",
        co2_emission: 0,
        city: "Kaunas",
        sdk_code: "",
        first_reg_date: "",
        mot_date: "",
        wheel_size: "",
      });
      setSelectedFeatures({});
      setVisibleWeb(true);
      setVisibleAutoplius(false);
      setIsCompanyCar(false);
      setIsFeatured(false);
      setIsRecommended(false);
      setExistingImages([]);
    };

    // Always clear temp states when switching listing
    setImageFiles([]);
    setImagePreviews([]);
    setImportedImageUrls([]);

    if (!car?.id) {
      resetToDefaults();
      return () => {
        cancelled = true;
      };
    }

    // 1) Apply whatever we already have (fast)
    applyCarToState(car);
    fetchExistingImages(car.id);

    // 2) Then hydrate from DB to guarantee we didn't lose fields in the prop
    (async () => {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select(
            [
              "id",
              "partner_id",
              "make",
              "model",
              "year",
              "price",
              "mileage",
              "fuel_type",
              "transmission",
              "description",
              "body_type",
              "engine_capacity",
              "power_kw",
              "doors",
              "seats",
              "color",
              "steering_wheel",
              "condition",
              "vin",
              "defects",
              "features",
              "visible_web",
              "visible_autoplius",
              "visible_autolizingas",
              "is_company_car",
              "is_featured",
              "is_recommended",
              "euro_standard",
              "fuel_cons_urban",
              "fuel_cons_highway",
              "fuel_cons_combined",
              "origin_country",
              "wheel_drive",
              "co2_emission",
              "city",
              "sdk_code",
              "first_reg_date",
              "mot_date",
              "wheel_size",
            ].join(",")
          )
          .eq("id", car.id)
          .single();

        if (error) throw error;
        if (cancelled) return;
        if (data) applyCarToState(data);
      } catch (e) {
        // Don't block editing if hydrate fails; just log.
        console.error("Failed to hydrate car for editing:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [car?.id, applyCarToState, fetchExistingImages]);

  const processImageFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} nėra nuotrauka`);
        return false;
      }
      // Increased limit since we auto-resize
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} per didelis. Maksimalus dydis: 20MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Process and resize images
    try {
      const processedImages = await processImages(validFiles);
      const resizedCount = processedImages.filter(r => r.wasResized).length;
      
      if (resizedCount > 0) {
        toast.success(`${resizedCount} nuotrauk${resizedCount === 1 ? 'a' : 'os'} automatiškai sumažint${resizedCount === 1 ? 'a' : 'os'}`);
      }

      const newFiles = processedImages.map(r => r.file);
      setImageFiles(prev => [...prev, ...newFiles]);

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Klaida apdorojant nuotraukas");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processImageFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  };

  const handleRemoveNewImage = useCallback((id: string) => {
    const index = parseInt(id.replace('new-', ''));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveExistingImage = useCallback(async (imageId: string) => {
    const { error } = await supabase
      .from("car_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      toast.error("Klaida šalinant nuotrauką");
      return;
    }

    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    toast.success("Nuotrauka pašalinta");
  }, []);

  const handleRemoveImportedImage = useCallback((id: string) => {
    const index = parseInt(id.replace('imported-', ''));
    setImportedImageUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleReorderExistingImages = useCallback((reorderedImages: DraggableImage[]) => {
    setExistingImages(reorderedImages.map((img, index) => ({
      id: img.id,
      url: img.url,
      order: index
    })));
  }, []);

  const handleReorderNewImages = useCallback((reorderedImages: DraggableImage[]) => {
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    reorderedImages.forEach(img => {
      const index = parseInt(img.id.replace('new-', ''));
      if (imageFiles[index]) {
        newFiles.push(imageFiles[index]);
        newPreviews.push(img.url);
      }
    });
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  }, [imageFiles]);

  const handleReorderImportedImages = useCallback((reorderedImages: DraggableImage[]) => {
    setImportedImageUrls(reorderedImages.map(img => img.url));
  }, []);

  const handleReplaceExistingImageUrl = useCallback(async (id: string, newUrl: string) => {
    // Find old image to delete from storage
    const oldImage = existingImages.find(img => img.id === id);
    const oldUrl = oldImage?.url;

    // Update in DB
    await supabase.from("car_images").update({ image_url: newUrl }).eq("id", id);
    setExistingImages(prev => prev.map(img => img.id === id ? { ...img, url: newUrl } : img));

    // Delete old file from storage if it's a supabase storage URL
    if (oldUrl && oldUrl.includes("/storage/v1/object/public/car-images/")) {
      try {
        const filePath = oldUrl.split("/storage/v1/object/public/car-images/")[1];
        if (filePath) {
          await supabase.storage.from("car-images").remove([decodeURIComponent(filePath)]);
        }
      } catch (e) {
        console.warn("Failed to delete old image from storage:", e);
      }
    }
  }, [existingImages]);

  const handleRotateExistingImage = useCallback(async (updatedImg: DraggableImage) => {
    // For existing images, upload the rotated version and update DB
    if (!car?.id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Neprisijungęs");
      const response = await fetch(updatedImg.url);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}-rotated.jpg`;
      const { error: uploadError } = await supabase.storage.from("car-images").upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("car-images").getPublicUrl(fileName);
      await supabase.from("car_images").update({ image_url: publicUrl }).eq("id", updatedImg.id);
      setExistingImages(prev => prev.map(img => img.id === updatedImg.id ? { ...img, url: publicUrl } : img));
      toast.success("Nuotrauka pasukta!");
    } catch (err) {
      console.error("Rotate existing image error:", err);
      toast.error("Nepavyko pasukti nuotraukos");
    }
  }, [car?.id]);

  const handleRotateNewImage = useCallback((updatedImg: DraggableImage) => {
    const index = parseInt(updatedImg.id.replace('new-', ''));
    setImagePreviews(prev => {
      const next = [...prev];
      next[index] = updatedImg.url;
      return next;
    });
    if (updatedImg.file) {
      setImageFiles(prev => {
        const next = [...prev];
        next[index] = updatedImg.file!;
        return next;
      });
    }
  }, []);

  const handleRotateImportedImage = useCallback((updatedImg: DraggableImage) => {
    const index = parseInt(updatedImg.id.replace('imported-', ''));
    setImportedImageUrls(prev => {
      const next = [...prev];
      next[index] = updatedImg.url;
      return next;
    });
  }, []);

  // Crop handlers — same logic as rotate, just replaces the image with the cropped version
  const handleCropExistingImage = useCallback(async (updatedImg: DraggableImage) => {
    if (!car?.id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Neprisijungęs");
      const response = await fetch(updatedImg.url);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}-cropped.jpg`;
      const { error: uploadError } = await supabase.storage.from("car-images").upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("car-images").getPublicUrl(fileName);
      await supabase.from("car_images").update({ image_url: publicUrl }).eq("id", updatedImg.id);
      setExistingImages(prev => prev.map(img => img.id === updatedImg.id ? { ...img, url: publicUrl } : img));
      toast.success("Nuotrauka apkarpyta!");
    } catch (err) {
      console.error("Crop existing image error:", err);
      toast.error("Nepavyko apkarpyti nuotraukos");
    }
  }, [car?.id]);

  const handleCropNewImage = useCallback((updatedImg: DraggableImage) => {
    const index = parseInt(updatedImg.id.replace('new-', ''));
    setImagePreviews(prev => {
      const next = [...prev];
      next[index] = updatedImg.url;
      return next;
    });
    if (updatedImg.file) {
      setImageFiles(prev => {
        const next = [...prev];
        next[index] = updatedImg.file!;
        return next;
      });
    }
  }, []);

  const handleCropImportedImage = useCallback((updatedImg: DraggableImage) => {
    const index = parseInt(updatedImg.id.replace('imported-', ''));
    setImportedImageUrls(prev => {
      const next = [...prev];
      next[index] = updatedImg.url;
      return next;
    });
  }, []);

  const handleGenerateDescription = async () => {
    if (!formData.make || !formData.model) {
      toast.error("Nurodykite markę ir modelį prieš generuojant aprašymą");
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-car-description', {
        body: {
          make: formData.make,
          model: formData.model,
          year: formData.year || undefined,
          mileage: formData.mileage || undefined,
          fuel_type: formData.fuel_type || undefined,
          transmission: formData.transmission || undefined,
          body_type: formData.body_type || undefined,
          color: formData.color || undefined,
          engine_capacity: formData.engine_capacity || undefined,
          power_kw: formData.power_kw || undefined,
          doors: formData.doors || undefined,
          seats: formData.seats || undefined,
          condition: formData.condition || undefined,
          defects: formData.defects || undefined,
          features: selectedFeatures,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
        toast.success("Aprašymas sugeneruotas!");
      }
    } catch (err) {
      console.error('Generate description error:', err);
      toast.error("Nepavyko sugeneruoti aprašymo");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = carSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vartotojas neprisijungęs");

      let carId = draftCarId || car?.id;

      const carData = {
        ...formData,
        partner_id: car?.partner_id || user.id,
        mileage: formData.mileage || null,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        description: formData.description || null,
        body_type: formData.body_type || null,
        engine_capacity: formData.engine_capacity || null,
        power_kw: formData.power_kw || null,
        doors: formData.doors || null,
        seats: formData.seats || null,
        color: formData.color || null,
        steering_wheel: formData.steering_wheel || null,
        condition: formData.condition || null,
        vin: formData.vin || null,
        defects: formData.defects || null,
        euro_standard: formData.euro_standard || null,
        fuel_cons_urban: formData.fuel_cons_urban || null,
        fuel_cons_highway: formData.fuel_cons_highway || null,
        fuel_cons_combined: formData.fuel_cons_combined || null,
        origin_country: formData.origin_country || null,
        wheel_drive: formData.wheel_drive || null,
        co2_emission: formData.co2_emission || null,
        city: formData.city || "Kaunas",
        sdk_code: formData.sdk_code || null,
        first_reg_date: formData.first_reg_date ? (formData.first_reg_date.length === 7 ? `${formData.first_reg_date}-01` : formData.first_reg_date) : null,
        mot_date: formData.mot_date ? (formData.mot_date.length === 7 ? `${formData.mot_date}-01` : formData.mot_date) : null,
        wheel_size: formData.wheel_size || null,
        features: selectedFeatures as any,
        visible_web: visibleWeb,
        visible_autoplius: visibleAutoplius,
        visible_autolizingas: visibleAutolizingas,
        is_company_car: isCompanyCar,
        is_featured: isFeatured,
        is_recommended: isRecommended,
      };

      // Create or update car
      if (carId) {
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", carId);
        if (error) throw error;
        
        // Always update all existing images order
        for (let i = 0; i < existingImages.length; i++) {
          const img = existingImages[i];
          await supabase
            .from("car_images")
            .update({ display_order: i })
            .eq("id", img.id);
        }
      } else {
        const { data: newCar, error } = await supabase
          .from("cars")
          .insert(carData)
          .select()
          .single();
        if (error) throw error;
        carId = newCar.id;
      }

      // Upload new images (parallel for speed)
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0 && carId) {
        const startOrder = existingImages.length;
        
        const uploadPromises = imageFiles.map(async (file, i) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(fileName);

          // Save image reference to database
          const { error: dbError } = await supabase
            .from("car_images")
            .insert({
              car_id: carId,
              image_url: publicUrl,
              display_order: startOrder + i,
            });

          if (dbError) throw dbError;
          return publicUrl;
        });

        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      // Handle imported images from Autoplius using edge function
      let importedUrls: string[] = [];
      if (importedImageUrls.length > 0 && carId) {
        const startOrder = existingImages.length + imageFiles.length;

        for (let i = 0; i < importedImageUrls.length; i++) {
          try {
            const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('add-watermark', {
              body: { 
                imageUrl: importedImageUrls[i],
                carId: carId
              },
            });

            if (uploadError || !uploadResult?.success) {
              console.error('Upload error:', uploadError || uploadResult?.error);
              continue;
            }

            const publicUrl = uploadResult.data.url;
            importedUrls.push(publicUrl);

            await supabase
              .from("car_images")
              .insert({
                car_id: carId,
                image_url: publicUrl,
                display_order: startOrder + i,
              });
          } catch (imgError) {
            console.error('Error processing imported image:', imgError);
          }
        }
      }

      // Always update image_url to the first image in the final order
      if (carId) {
        const firstImageUrl = existingImages.length > 0
          ? existingImages[0].url
          : uploadedImageUrls.length > 0
            ? uploadedImageUrls[0]
            : importedUrls.length > 0
              ? importedUrls[0]
              : null;

        await supabase
          .from("cars")
          .update({ image_url: firstImageUrl })
          .eq("id", carId);
      }

      // Autoplius sync removed – XML feed is pulled by Autoplius automatically

      toast.success(car?.id ? "Skelbimas atnaujintas!" : "Skelbimas sukurtas!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Klaida saugant skelbimą");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{car ? "Redaguoti skelbimą" : "Naujas skelbimas"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} onBlur={handleFormBlur} className="space-y-8">
          
          {/* ═══════════════ 1. PAGRINDINĖ INFORMACIJA ═══════════════ */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              Pagrindinė informacija
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Markė *</Label>
                <SearchableCombobox
                  options={autopliusMakes.map((m) => ({ value: m.name, label: m.name }))}
                  value={formData.make}
                  onValueChange={(val) => {
                    setFormData({ ...formData, make: val, model: "" });
                  }}
                  placeholder="Pasirinkite markę"
                  searchPlaceholder="Ieškoti markės..."
                  emptyMessage="Markė nerasta"
                />
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Modelis *</Label>
                <SearchableCombobox
                  options={modelOptions.map((m) => ({ value: m.name, label: m.name }))}
                  value={formData.model}
                  onValueChange={(val) => setFormData({ ...formData, model: val })}
                  placeholder="Pasirinkite modelį"
                  searchPlaceholder="Ieškoti modelio..."
                  emptyMessage="Modelis nerastas"
                  allowCustomValue={true}
                  isLoading={isLoadingModels}
                  disabled={!formData.make}
                />
              </div>

              <div className="space-y-2">
                <Label>Pirma registracija *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={formData.first_reg_date ? formData.first_reg_date.substring(0, 4) : formData.year ? String(formData.year) : ""}
                    onValueChange={(year) => {
                      const currentMonth = formData.first_reg_date ? formData.first_reg_date.substring(5, 7) : "01";
                      setFormData({ ...formData, year: parseInt(year), first_reg_date: `${year}-${currentMonth}` });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Metai" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.first_reg_date ? formData.first_reg_date.substring(5, 7) : ""}
                    onValueChange={(month) => {
                      const currentYear = formData.first_reg_date ? formData.first_reg_date.substring(0, 4) : formData.year ? String(formData.year) : String(new Date().getFullYear());
                      setFormData({ ...formData, year: parseInt(currentYear), first_reg_date: `${currentYear}-${month}` });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Mėn." /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthNum = String(i + 1).padStart(2, '0');
                        return <SelectItem key={monthNum} value={monthNum}>{monthNum}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Kaina (€) *</Label>
                <Input id="price" type="number" step="1" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Rida (km)</Label>
                <Input id="mileage" type="number" value={formData.mileage || ""} onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })} placeholder="Pvz.: 150000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN kodas</Label>
                <Input id="vin" value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} placeholder="WVWZZZ3CZWE123456" />
              </div>

              <div className="space-y-2">
                <Label>Būklė</Label>
                <Select value={formData.condition} onValueChange={(value) => handleSelectChange('condition', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Naujas">Naujas</SelectItem>
                    <SelectItem value="Naudotas">Naudotas</SelectItem>
                    <SelectItem value="Daužtas">Daužtas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sdk_code">SDK kodas</Label>
                <Input id="sdk_code" value={formData.sdk_code} onChange={(e) => setFormData({ ...formData, sdk_code: e.target.value })} placeholder="ABC123" maxLength={10} />
              </div>
            </div>
          </section>

          {/* ═══════════════ 2. TECHNINIAI DUOMENYS ═══════════════ */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Techniniai duomenys
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Kėbulo tipas</Label>
                <Select value={formData.body_type} onValueChange={(value) => handleSelectChange('body_type', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedanas">Sedanas</SelectItem>
                    <SelectItem value="Hečbekas">Hečbekas</SelectItem>
                    <SelectItem value="Universalas">Universalas</SelectItem>
                    <SelectItem value="Visureigis">Visureigis</SelectItem>
                    <SelectItem value="Kupė">Kupė</SelectItem>
                    <SelectItem value="Kabrioletas">Kabrioletas</SelectItem>
                    <SelectItem value="Vienatūris">Vienatūris</SelectItem>
                    <SelectItem value="Pikapas">Pikapas</SelectItem>
                    <SelectItem value="Komercinis">Komercinis</SelectItem>
                    <SelectItem value="Limuzinas">Limuzinas</SelectItem>
                    <SelectItem value="Keleivinis mikroautobusas">Keleivinis mikroautobusas</SelectItem>
                    <SelectItem value="Krovininis mikroautobusas">Krovininis mikroautobusas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kuro tipas</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => handleSelectChange('fuel_type', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Benzinas">Benzinas</SelectItem>
                    <SelectItem value="Dyzelinas">Dyzelinas</SelectItem>
                    <SelectItem value="Elektra">Elektra</SelectItem>
                    <SelectItem value="Benzinas/Elektra">Benzinas/Elektra</SelectItem>
                    <SelectItem value="Dyzelinas/Elektra">Dyzelinas/Elektra</SelectItem>
                    <SelectItem value="Benzinas/Dujos">Benzinas/Dujos</SelectItem>
                    <SelectItem value="Vandenilis">Vandenilis</SelectItem>
                    <SelectItem value="Bioetanolis (E85)">Bioetanolis (E85)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pavarų dėžė</Label>
                <Select value={formData.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mechaninė">Mechaninė</SelectItem>
                    <SelectItem value="Automatinė">Automatinė</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Variklio tūris (cm³)</Label>
                <Input type="number" value={formData.engine_capacity || ""} onChange={(e) => setFormData({ ...formData, engine_capacity: parseInt(e.target.value) || 0 })} placeholder="2000" />
              </div>

              <div className="space-y-2">
                <Label>Galia (kW)</Label>
                <Input type="number" value={formData.power_kw || ""} onChange={(e) => setFormData({ ...formData, power_kw: parseInt(e.target.value) || 0 })} placeholder="150" />
              </div>

              <div className="space-y-2">
                <Label>Varantieji ratai</Label>
                <Select value={formData.wheel_drive} onValueChange={(value) => handleSelectChange('wheel_drive', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Priekiniai">Priekiniai</SelectItem>
                    <SelectItem value="Galiniai">Galiniai</SelectItem>
                    <SelectItem value="Visi">Visi (4x4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vairas</Label>
                <Select value={formData.steering_wheel} onValueChange={(value) => handleSelectChange('steering_wheel', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kairė">Kairė</SelectItem>
                    <SelectItem value="Dešinė">Dešinė</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Spalva</Label>
                <Select value={formData.color} onValueChange={(value) => handleSelectChange('color', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Balta">Balta</SelectItem>
                    <SelectItem value="Juoda">Juoda</SelectItem>
                    <SelectItem value="Pilka">Pilka</SelectItem>
                    <SelectItem value="Sidabrinė">Sidabrinė</SelectItem>
                    <SelectItem value="Mėlyna">Mėlyna</SelectItem>
                    <SelectItem value="Raudona">Raudona</SelectItem>
                    <SelectItem value="Žalia">Žalia</SelectItem>
                    <SelectItem value="Geltona">Geltona</SelectItem>
                    <SelectItem value="Oranžinė">Oranžinė</SelectItem>
                    <SelectItem value="Ruda">Ruda</SelectItem>
                    <SelectItem value="Violetinė">Violetinė</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durų skaičius</Label>
                <Select value={formData.doors?.toString()} onValueChange={(value) => { setFormData({ ...formData, doors: parseInt(value) }); autoSaveField('doors', parseInt(value)); }}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2/3</SelectItem>
                    <SelectItem value="4">4/5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vietų skaičius</Label>
                <Select value={formData.seats?.toString()} onValueChange={(value) => { setFormData({ ...formData, seats: parseInt(value) }); autoSaveField('seats', parseInt(value)); }}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Euro standartas</Label>
                <Select value={formData.euro_standard} onValueChange={(value) => handleSelectChange('euro_standard', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Euro 1">Euro 1</SelectItem>
                    <SelectItem value="Euro 2">Euro 2</SelectItem>
                    <SelectItem value="Euro 3">Euro 3</SelectItem>
                    <SelectItem value="Euro 4">Euro 4</SelectItem>
                    <SelectItem value="Euro 5">Euro 5</SelectItem>
                    <SelectItem value="Euro 6">Euro 6</SelectItem>
                    <SelectItem value="Euro 6d">Euro 6d</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ratų dydis</Label>
                <Select value={formData.wheel_size} onValueChange={(value) => handleSelectChange('wheel_size', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R12">R12</SelectItem>
                    <SelectItem value="R13">R13</SelectItem>
                    <SelectItem value="R14">R14</SelectItem>
                    <SelectItem value="R15">R15</SelectItem>
                    <SelectItem value="R16">R16</SelectItem>
                    <SelectItem value="R17">R17</SelectItem>
                    <SelectItem value="R18">R18</SelectItem>
                    <SelectItem value="R19">R19</SelectItem>
                    <SelectItem value="R20">R20</SelectItem>
                    <SelectItem value="R21">R21</SelectItem>
                    <SelectItem value="R22">R22</SelectItem>
                    <SelectItem value="R23">R23</SelectItem>
                    <SelectItem value="R24">R24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* ═══════════════ 3. PAPILDOMI DUOMENYS ═══════════════ */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              Papildomi duomenys
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Miestas</Label>
                <Select value={formData.city} onValueChange={(value) => handleSelectChange('city', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kaunas">Kaunas</SelectItem>
                    <SelectItem value="Vilnius">Vilnius</SelectItem>
                    <SelectItem value="Klaipėda">Klaipėda</SelectItem>
                    <SelectItem value="Šiauliai">Šiauliai</SelectItem>
                    <SelectItem value="Panevėžys">Panevėžys</SelectItem>
                    <SelectItem value="Alytus">Alytus</SelectItem>
                    <SelectItem value="Marijampolė">Marijampolė</SelectItem>
                    <SelectItem value="Utena">Utena</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kilmės šalis</Label>
                <Select value={formData.origin_country} onValueChange={(value) => handleSelectChange('origin_country', value)}>
                  <SelectTrigger><SelectValue placeholder="Pasirinkite" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lietuva">Lietuva</SelectItem>
                    <SelectItem value="Vokietija">Vokietija</SelectItem>
                    <SelectItem value="Lenkija">Lenkija</SelectItem>
                    <SelectItem value="Prancūzija">Prancūzija</SelectItem>
                    <SelectItem value="Italija">Italija</SelectItem>
                    <SelectItem value="Nyderlandai">Nyderlandai</SelectItem>
                    <SelectItem value="Belgija">Belgija</SelectItem>
                    <SelectItem value="Suomija">Suomija</SelectItem>
                    <SelectItem value="Švedija">Švedija</SelectItem>
                    <SelectItem value="Danija">Danija</SelectItem>
                    <SelectItem value="Norvegija">Norvegija</SelectItem>
                    <SelectItem value="Latvija">Latvija</SelectItem>
                    <SelectItem value="Estija">Estija</SelectItem>
                    <SelectItem value="Anglija">Anglija</SelectItem>
                    <SelectItem value="Airija">Airija</SelectItem>
                    <SelectItem value="Ispanija">Ispanija</SelectItem>
                    <SelectItem value="Austrija">Austrija</SelectItem>
                    <SelectItem value="Šveicarija">Šveicarija</SelectItem>
                    <SelectItem value="Čekija">Čekija</SelectItem>
                    <SelectItem value="Slovakija">Slovakija</SelectItem>
                    <SelectItem value="Vengrija">Vengrija</SelectItem>
                    <SelectItem value="Rumunija">Rumunija</SelectItem>
                    <SelectItem value="JAV">JAV</SelectItem>
                    <SelectItem value="Kanada">Kanada</SelectItem>
                    <SelectItem value="Japonija">Japonija</SelectItem>
                    <SelectItem value="Rusija">Rusija</SelectItem>
                    <SelectItem value="Baltarusija">Baltarusija</SelectItem>
                    <SelectItem value="Ukraina">Ukraina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>CO₂ emisija (g/km)</Label>
                <Input type="number" value={formData.co2_emission || ""} onChange={(e) => setFormData({ ...formData, co2_emission: parseInt(e.target.value) || 0 })} placeholder="120" />
              </div>

              <div className="space-y-2">
                <Label>TA galiojimas iki</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={formData.mot_date ? formData.mot_date.substring(0, 4) : ""}
                    onValueChange={(year) => {
                      const currentMonth = formData.mot_date && formData.mot_date.length >= 7 ? formData.mot_date.substring(5, 7) : "01";
                      setFormData({ ...formData, mot_date: `${year}-${currentMonth}` });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Metai" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.mot_date && formData.mot_date.length >= 7 ? formData.mot_date.substring(5, 7) : ""}
                    onValueChange={(month) => {
                      const currentYear = formData.mot_date && formData.mot_date.length >= 4 ? formData.mot_date.substring(0, 4) : String(new Date().getFullYear());
                      setFormData({ ...formData, mot_date: `${currentYear}-${month}` });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Mėn." /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthNum = String(i + 1).padStart(2, '0');
                        return <SelectItem key={monthNum} value={monthNum}>{monthNum}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kuro sąnaudos mieste (l/100km)</Label>
                <Input type="number" step="0.1" value={formData.fuel_cons_urban || ""} onChange={(e) => setFormData({ ...formData, fuel_cons_urban: parseFloat(e.target.value) || 0 })} placeholder="8.5" />
              </div>

              <div className="space-y-2">
                <Label>Kuro sąnaudos užmiestyje (l/100km)</Label>
                <Input type="number" step="0.1" value={formData.fuel_cons_highway || ""} onChange={(e) => setFormData({ ...formData, fuel_cons_highway: parseFloat(e.target.value) || 0 })} placeholder="5.5" />
              </div>

              <div className="space-y-2">
                <Label>Kuro sąnaudos vidutinės (l/100km)</Label>
                <Input type="number" step="0.1" value={formData.fuel_cons_combined || ""} onChange={(e) => setFormData({ ...formData, fuel_cons_combined: parseFloat(e.target.value) || 0 })} placeholder="6.5" />
              </div>
            </div>
          </section>

          {/* ═══════════════ 4. NUOTRAUKOS ═══════════════ */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
              Nuotraukos
            </h3>
            <div className="space-y-4">
              <label 
                htmlFor="image" 
                className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-border hover:bg-accent/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`h-6 w-6 mb-1 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm transition-colors ${isDragging ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {isDragging ? 'Paleiskite nuotraukas čia' : 'Įkelkite arba užvilkite nuotraukas'}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">Max 20MB (automatiškai sumažinama)</span>
              </label>
              <Input id="image" type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />

              <DraggableImageGrid
                images={existingImages.map(img => ({ id: img.id, url: img.url }))}
                onReorder={handleReorderExistingImages}
                onRemove={handleRemoveExistingImage}
                onReplaceUrl={handleReplaceExistingImageUrl}
                onRotateImage={handleRotateExistingImage}
                onCropImage={handleCropExistingImage}
                title="Esamos nuotraukos:"
                carId={car?.id}
                showAiBackground={hasAiAccess && !!car?.id}
              />

              <DraggableImageGrid
                images={imagePreviews.map((preview, index) => ({ id: `new-${index}`, url: preview, isNew: true }))}
                onReorder={handleReorderNewImages}
                onRemove={handleRemoveNewImage}
                onRotateImage={handleRotateNewImage}
                onCropImage={handleCropNewImage}
                title="Naujos nuotraukos:"
              />

              <DraggableImageGrid
                images={importedImageUrls.map((url, index) => ({ id: `imported-${index}`, url }))}
                onReorder={handleReorderImportedImages}
                onRemove={handleRemoveImportedImage}
                onRotateImage={handleRotateImportedImage}
                onCropImage={handleCropImportedImage}
                title={`Importuotos nuotraukos (${importedImageUrls.length}):`}
              />
            </div>
          </section>

          {/* ═══════════════ 5. APRAŠYMAS ═══════════════ */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">5</span>
              Aprašymas
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Aprašymas</Label>
                </div>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Automobilio aprašymas..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defects">Defektai / Trūkumai</Label>
                <Textarea id="defects" value={formData.defects} onChange={(e) => setFormData({ ...formData, defects: e.target.value })} rows={4} placeholder="Jei yra defektų, nurodykite čia..." />
              </div>
            </div>
          </section>

          {/* ═══════════════ 6. YPATYBĖS ═══════════════ */}
          <section>
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">6</span>
              Įranga ir ypatybės
            </h3>
            <CarFeaturesSelector selectedFeatures={selectedFeatures} onChange={setSelectedFeatures} />
          </section>

          {/* ═══════════════ 7. PUBLIKAVIMAS ═══════════════ */}
          <section className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-base font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">7</span>
              Publikavimo nustatymai
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={visibleWeb} onCheckedChange={(checked) => { setVisibleWeb(checked === true); autoSaveField('visible_web', checked === true); }} />
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-medium">AutoKOPERS svetainė</span>
                </div>
              </label>
              
              {canExportAutoplius && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={visibleAutoplius} onCheckedChange={(checked) => { setVisibleAutoplius(checked === true); if (car?.id) autoSaveField('visible_autoplius', checked === true); }} />
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <span className="font-medium">Autoplius.lt</span>
                  </div>
                </label>
              )}

              {canExportAutoplius && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={visibleAutolizingas} onCheckedChange={(checked) => { setVisibleAutolizingas(checked === true); if (car?.id) autoSaveField('visible_autolizingas', checked === true); }} />
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <span className="font-medium">Autolizingas.lt</span>
                  </div>
                </label>
              )}
            </div>
            
            {isAdmin && (
              <>
                <div className="mt-4 pt-4 border-t">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox checked={isCompanyCar} onCheckedChange={(checked) => { setIsCompanyCar(checked === true); if (car?.id) autoSaveField('is_company_car', checked === true); }} />
                    <div>
                      <span className="font-medium">AutoKOPERS įmonės automobilis</span>
                      <p className="text-sm text-muted-foreground">Pažymėkite, jei šis automobilis priklauso AutoKOPERS įmonei</p>
                    </div>
                  </label>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">Išskirtiniai nustatymai</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={isFeatured} onCheckedChange={(checked) => { setIsFeatured(checked === true); if (car?.id) autoSaveField('is_featured', checked === true); }} />
                      <div>
                        <span className="font-medium">Rodyti pagrindiniame puslapyje</span>
                        <p className="text-sm text-muted-foreground">Automobilis bus matomas pagrindiniame puslapyje</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={isRecommended} onCheckedChange={(checked) => { setIsRecommended(checked === true); if (car?.id) autoSaveField('is_recommended', checked === true); }} />
                      <div>
                        <span className="font-medium text-primary">✓ AUTOKOPERS rekomenduoja</span>
                        <p className="text-sm text-muted-foreground">Ant nuotraukos bus rodomas "AUTOKOPERS rekomenduoja" ženkliukas</p>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </section>

          <div className="flex gap-2 items-center sticky bottom-4 bg-background/95 backdrop-blur-sm py-3 px-1 -mx-1 rounded-lg border shadow-sm">
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
              {isLoading ? "Saugoma..." : car ? "Atnaujinti" : "Sukurti skelbimą"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Atšaukti
            </Button>
            {car?.id && autoSaveStatus !== 'idle' && (
              <span className={`text-xs ml-auto ${
                autoSaveStatus === 'saving' ? 'text-muted-foreground' :
                autoSaveStatus === 'saved' ? 'text-green-600' :
                'text-destructive'
              }`}>
                {autoSaveStatus === 'saving' ? '💾 Saugoma...' :
                 autoSaveStatus === 'saved' ? '✅ Išsaugota' :
                 '❌ Klaida saugant'}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateListing;
