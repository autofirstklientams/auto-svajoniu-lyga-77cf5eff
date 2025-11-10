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
import { Upload, X } from "lucide-react";

const carSchema = z.object({
  make: z.string().trim().min(1, "Markė privaloma"),
  model: z.string().trim().min(1, "Modelis privalomas"),
  year: z.number().min(1900, "Neteisingi metai").max(new Date().getFullYear() + 1),
  price: z.number().min(0, "Kaina negali būti neigiama"),
  mileage: z.number().min(0).optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  description: z.string().optional(),
});

interface CreateListingProps {
  car?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateListing = ({ car, onClose, onSuccess }: CreateListingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: string, url: string, order: number}>>([]);
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
    price: car?.price || 0,
    mileage: car?.mileage || 0,
    fuel_type: car?.fuel_type || "",
    transmission: car?.transmission || "",
    description: car?.description || "",
  });

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
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
      let imageUrl = car?.image_url || null;

      const carData = {
        ...formData,
        partner_id: user.id,
        mileage: formData.mileage || null,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        description: formData.description || null,
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
              <Label htmlFor="mileage">Rida (km)</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
              />
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
                  <SelectItem value="Dyzelis">Dyzelis</SelectItem>
                  <SelectItem value="Elektra">Elektra</SelectItem>
                  <SelectItem value="Hibridinis">Hibridinis</SelectItem>
                  <SelectItem value="Dujos">Dujos</SelectItem>
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

            <div className="md:col-span-2 space-y-2">
              <Label>Nuotraukos</Label>
              <div className="space-y-4">
                <label 
                  htmlFor="image" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Įkelkite nuotraukas (galima kelias)</span>
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
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Aprašymas</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
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
