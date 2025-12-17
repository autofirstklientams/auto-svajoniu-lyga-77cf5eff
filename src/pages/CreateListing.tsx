import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, X, Link, Loader2, Globe, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import CarFeaturesSelector, { CarFeatures } from "@/components/CarFeaturesSelector";

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
}

const CreateListing = ({ car, onClose, onSuccess }: CreateListingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
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
  });

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

  const handleRemoveImportedImage = (index: number) => {
    setImportedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (car?.id) {
      fetchExistingImages();
    }
  }, [car?.id]);

  const fetchExistingImages = async () => {
    if (!car?.id) return;
    
    const { data, error } = await supabase
      .from("car_images")
      .select("*")
      .eq("car_id", car.id)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching images:", error);
      return;
    }

    setExistingImages(data?.map(img => ({ id: img.id, url: img.image_url, order: img.display_order })) || []);
  };

  const processImageFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} nėra nuotrauka`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} per didelis. Maksimalus dydis: 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImageFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
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

  const handleRemoveNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageId: string) => {
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

      let carId = car?.id;

      const carData = {
        ...formData,
        partner_id: user.id,
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
        features: selectedFeatures as any,
        visible_web: visibleWeb,
        visible_autoplius: visibleAutoplius,
      };

      // Create or update car
      if (car) {
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", car.id);
        if (error) throw error;
      } else {
        const { data: newCar, error } = await supabase
          .from("cars")
          .insert(carData)
          .select()
          .single();
        if (error) throw error;
        carId = newCar.id;
      }

      // Upload new images
      if (imageFiles.length > 0 && carId) {
        const startOrder = existingImages.length;
        let firstImageUrl: string | null = null;
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(fileName);

          if (i === 0) firstImageUrl = publicUrl;

          // Save image reference to database
          const { error: dbError } = await supabase
            .from("car_images")
            .insert({
              car_id: carId,
              image_url: publicUrl,
              display_order: startOrder + i,
            });

          if (dbError) throw dbError;
        }

        // Update main car image_url if this is the first image
        if (!car?.image_url && firstImageUrl) {
          await supabase
            .from("cars")
            .update({ image_url: firstImageUrl })
            .eq("id", carId);
        }
      }

      // Handle imported images from Autoplius using edge function
      if (importedImageUrls.length > 0 && carId) {
        const startOrder = existingImages.length + imageFiles.length;
        let firstImageUrl: string | null = null;

        for (let i = 0; i < importedImageUrls.length; i++) {
          try {
            // Use edge function to fetch and upload image (avoids CORS issues)
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

            if (i === 0 && !firstImageUrl) firstImageUrl = publicUrl;

            // Save image reference to database
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

        // Update main car image_url if no images existed before
        if (!car?.image_url && imageFiles.length === 0 && firstImageUrl) {
          await supabase
            .from("cars")
            .update({ image_url: firstImageUrl })
            .eq("id", carId);
        }
      }

      toast.success(car ? "Skelbimas atnaujintas!" : "Skelbimas sukurtas!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Klaida saugant skelbimą");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{car ? "Redaguoti skelbimą" : "Naujas skelbimas"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Autoplius Import Section */}
        {!car && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <Link className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Importuoti iš Autoplius</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Įklijuokite skelbimo nuorodą iš autoplius.lt ir automatiškai užpildysime formą
            </p>
            <div className="flex gap-2">
              <Input
                value={autopliusUrl}
                onChange={(e) => setAutopliusUrl(e.target.value)}
                placeholder="https://autoplius.lt/skelbimai/..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleImportFromAutoplius}
                disabled={isImporting}
                variant="secondary"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importuojama...
                  </>
                ) : (
                  "Importuoti"
                )}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Pagrindinė informacija</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Markė *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelis *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Metai *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Kaina (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN kodas</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="Pvz.: WVWZZZ3CZWE123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Būklė</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Naujas">Naujas</SelectItem>
                    <SelectItem value="Naudotas">Naudotas</SelectItem>
                    <SelectItem value="Daužtas">Daužtas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Techniniai duomenys</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="body_type">Kėbulo tipas</Label>
                <Select
                  value={formData.body_type}
                  onValueChange={(value) => setFormData({ ...formData, body_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Kuro tipas</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Benzinas">Benzinas</SelectItem>
                    <SelectItem value="Dyzelinas">Dyzelinas</SelectItem>
                    <SelectItem value="Elektra">Elektra</SelectItem>
                    <SelectItem value="Hibridinis">Hibridinis</SelectItem>
                    <SelectItem value="Dujos">Dujos</SelectItem>
                    <SelectItem value="Benzinas/Dujos">Benzinas/Dujos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Pavarų dėžė</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mechaninė">Mechaninė</SelectItem>
                    <SelectItem value="Automatinė">Automatinė</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="steering_wheel">Vairas</Label>
                <Select
                  value={formData.steering_wheel}
                  onValueChange={(value) => setFormData({ ...formData, steering_wheel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kairė">Kairė</SelectItem>
                    <SelectItem value="Dešinė">Dešinė</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="engine_capacity">Variklio tūris (cm³)</Label>
                <Input
                  id="engine_capacity"
                  type="number"
                  value={formData.engine_capacity || ""}
                  onChange={(e) => setFormData({ ...formData, engine_capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Pvz.: 2000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="power_kw">Galia (kW)</Label>
                <Input
                  id="power_kw"
                  type="number"
                  value={formData.power_kw || ""}
                  onChange={(e) => setFormData({ ...formData, power_kw: parseInt(e.target.value) || 0 })}
                  placeholder="Pvz.: 150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Rida (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage || ""}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                  placeholder="Pvz.: 150000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Spalva</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
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
                <Label htmlFor="doors">Durų skaičius</Label>
                <Select
                  value={formData.doors?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, doors: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Vietų skaičius</Label>
                <Select
                  value={formData.seats?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, seats: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Nuotraukos</h3>
            <div className="space-y-4">
              <label 
                htmlFor="image" 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-border hover:bg-accent/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`h-8 w-8 mb-2 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm transition-colors ${isDragging ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {isDragging ? 'Paleiskite nuotraukas čia' : 'Įkelkite arba užvilkite nuotraukas'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">Max 5MB kiekviena</span>
              </label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Esamos nuotraukos:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={img.url}
                          alt={`Existing ${img.order}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveExistingImage(img.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New images preview */}
              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Naujos nuotraukos:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imported images preview */}
              {importedImageUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Importuotos nuotraukos ({importedImageUrls.length}):</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {importedImageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={`Imported ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImportedImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & Defects */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Aprašymas</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Automobilio aprašymas..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defects">Defektai / Trūkumai</Label>
              <Textarea
                id="defects"
                value={formData.defects}
                onChange={(e) => setFormData({ ...formData, defects: e.target.value })}
                rows={4}
                placeholder="Jei yra defektų, nurodykite čia..."
              />
            </div>
          </div>

          {/* Car Features */}
          <CarFeaturesSelector
            selectedFeatures={selectedFeatures}
            onChange={setSelectedFeatures}
          />

          {/* Visibility Options */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Publikavimo nustatymai</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pasirinkite kur norite publikuoti skelbimą
            </p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={visibleWeb}
                  onCheckedChange={(checked) => setVisibleWeb(checked === true)}
                />
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-medium">AutoKOPERS svetainė</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={visibleAutoplius}
                  onCheckedChange={(checked) => setVisibleAutoplius(checked === true)}
                />
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Autoplius.lt</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saugoma..." : car ? "Atnaujinti" : "Sukurti"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Atšaukti
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateListing;
