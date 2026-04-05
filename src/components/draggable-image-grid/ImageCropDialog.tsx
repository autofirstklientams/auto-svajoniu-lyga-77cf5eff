import { type PointerEvent, useCallback, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageMetrics {
  displayWidth: number;
  displayHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createCroppedImage(imageSrc: string, pixelCrop: CropArea): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No canvas context"));
        return;
      }

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
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    };

    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = imageSrc;
  });
}

export function ImageCropDialog({ open, imageUrl, onClose, onCropComplete }: ImageCropDialogProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [imageMetrics, setImageMetrics] = useState<ImageMetrics | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const setImageData = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const nextMetrics: ImageMetrics = {
      displayWidth: img.clientWidth,
      displayHeight: img.clientHeight,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    };

    setImageMetrics(nextMetrics);
    setCropArea({
      x: 0,
      y: 0,
      width: nextMetrics.displayWidth,
      height: nextMetrics.displayHeight,
    });
  }, []);

  const getPointerCoordinates = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(event.clientX - bounds.left, 0, bounds.width),
      y: clamp(event.clientY - bounds.top, 0, bounds.height),
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!imageMetrics) return;

    event.preventDefault();
    const point = getPointerCoordinates(event);
    pointerStartRef.current = point;
    setIsDrawing(true);

    event.currentTarget.setPointerCapture(event.pointerId);
    setCropArea({ x: point.x, y: point.y, width: 0, height: 0 });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !pointerStartRef.current) return;

    const point = getPointerCoordinates(event);
    const start = pointerStartRef.current;

    const x = Math.min(start.x, point.x);
    const y = Math.min(start.y, point.y);
    const width = Math.abs(point.x - start.x);
    const height = Math.abs(point.y - start.y);

    setCropArea({ x, y, width, height });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerStartRef.current = null;
    setIsDrawing(false);

    setCropArea((prev) => {
      if (!prev || prev.width < 10 || prev.height < 10) {
        return null;
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (!cropArea || !imageMetrics) return;

    const scaleX = imageMetrics.naturalWidth / imageMetrics.displayWidth;
    const scaleY = imageMetrics.naturalHeight / imageMetrics.displayHeight;

    const pixelCrop: CropArea = {
      x: Math.round(cropArea.x * scaleX),
      y: Math.round(cropArea.y * scaleY),
      width: Math.max(1, Math.round(cropArea.width * scaleX)),
      height: Math.max(1, Math.round(cropArea.height * scaleY)),
    };

    setIsSaving(true);
    try {
      const blob = await createCroppedImage(imageUrl, pixelCrop);
      onCropComplete(blob);
    } catch (error) {
      console.error("Crop failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-3xl p-0 gap-0 bg-background border overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="px-4 pt-4 pb-2 text-base font-semibold">Apkarpyti nuotrauką</DialogTitle>

        <div className="px-4 pb-3 text-xs text-muted-foreground">Tempkite pele arba pirštu, kad pažymėtumėte apkarpymo sritį.</div>

        <div className="px-4 pb-4 overflow-auto max-h-[65vh]">
          <div className="relative mx-auto w-fit max-w-full">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Apkarpoma nuotrauka"
              className="max-w-full max-h-[60vh] object-contain select-none pointer-events-none"
              onLoad={setImageData}
              draggable={false}
            />

            {imageMetrics && (
              <div
                className="absolute inset-0 cursor-crosshair"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div className="absolute inset-0 bg-background/25" />

                {cropArea && (
                  <div
                    className="absolute border-2 border-primary bg-background/10"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-background">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-1.5" />
            Atšaukti
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving || !cropArea}>
            <Check className="h-4 w-4 mr-1.5" />
            {isSaving ? "Apkarpoma..." : "Pritaikyti"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
