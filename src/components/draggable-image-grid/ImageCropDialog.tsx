import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Check, X } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

function createCroppedImage(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Failed to create blob")); return; }
          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    };
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = imageSrc;
  });
}

export function ImageCropDialog({ open, imageUrl, onClose, onCropComplete }: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const blob = await createCroppedImage(imageUrl, croppedAreaPixels);
      onCropComplete(blob);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-2xl p-0 gap-0 bg-background border overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="px-4 pt-4 pb-2 text-base font-semibold">Apkarpyti nuotrauką</DialogTitle>
        
        <div className="relative w-full" style={{ height: "min(60vh, 500px)" }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropDone}
            showGrid
          />
        </div>

        <div className="px-4 py-3 space-y-3 border-t bg-background">
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              <X className="h-4 w-4 mr-1.5" />
              Atšaukti
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || !croppedAreaPixels}>
              <Check className="h-4 w-4 mr-1.5" />
              {isSaving ? "Apkarpoma..." : "Pritaikyti"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
