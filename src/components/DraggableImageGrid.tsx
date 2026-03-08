import { useState, useCallback } from "react";
import { X, GripVertical, ChevronLeft, ChevronRight, Sparkles, Loader2, ZoomIn, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface DraggableImage {
  id: string;
  url: string;
  isNew?: boolean;
  file?: File;
}

interface DraggableImageGridProps {
  images: DraggableImage[];
  onReorder: (images: DraggableImage[]) => void;
  onRemove: (id: string) => void;
  onReplaceUrl?: (id: string, newUrl: string) => void;
  title: string;
  carId?: string;
  showAiBackground?: boolean;
}

export function DraggableImageGrid({ images, onReorder, onRemove, onReplaceUrl, title, carId, showAiBackground = false }: DraggableImageGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  // Store original URLs before AI replacement for undo
  const [originalUrls, setOriginalUrls] = useState<Map<string, string>>(new Map());
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    onReorder(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, images, onReorder]);

  const moveImage = useCallback((index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onReorder(newImages);
  }, [images, onReorder]);

  const handleAiBackground = useCallback(async (img: DraggableImage) => {
    if (!carId || !onReplaceUrl) return;
    
    setProcessingIds(prev => new Set(prev).add(img.id));
    
    try {
      const { data, error } = await supabase.functions.invoke('replace-car-background', {
        body: { imageUrl: img.url, carId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Nepavyko pakeisti fono');

      onReplaceUrl(img.id, data.url);
      toast.success('Fonas pakeistas į salono stilių!');
    } catch (err: any) {
      console.error('AI background error:', err);
      toast.error(err.message || 'Klaida keičiant foną');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(img.id);
        return next;
      });
    }
  }, [carId, onReplaceUrl]);

  if (images.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium mb-2 flex items-center gap-2">
        {title}
        <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
          (vilkite, kad pakeistumėte tvarką)
        </span>
        <span className="text-xs text-muted-foreground font-normal sm:hidden">
          (naudokite rodykles tvarkai keisti)
        </span>
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((img, index) => {
          const isProcessing = processingIds.has(img.id);
          return (
            <div
              key={img.id}
              draggable={!isProcessing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing transition-all duration-200 group",
                draggedIndex === index && "opacity-50 scale-95",
                dragOverIndex === index && "ring-2 ring-primary ring-offset-2 scale-105",
                isProcessing && "cursor-wait"
              )}
            >
              <img
                src={img.url}
                alt={`Image ${index + 1}`}
                className={cn("w-full h-full object-cover pointer-events-none", isProcessing && "opacity-50")}
                draggable={false}
              />

              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
                  <Loader2 className="h-6 w-6 text-white animate-spin mb-1" />
                  <span className="text-white text-xs font-medium">AI fonas...</span>
                </div>
              )}
              
              {/* Order badge */}
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
              
              {/* Drag handle - desktop */}
              <div className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <GripVertical className="h-3 w-3" />
              </div>

              {/* Zoom button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
                className="absolute top-1 left-1 sm:left-8 bg-black/50 text-white p-1 rounded sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                title="Padidinti"
              >
                <ZoomIn className="h-3 w-3" />
              </button>

              {/* AI Background button */}
              {showAiBackground && carId && onReplaceUrl && !isProcessing && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleAiBackground(img); }}
                  className="absolute bottom-1 right-1 sm:bottom-auto sm:top-8 sm:right-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-1 sm:p-1.5 rounded sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs"
                  title="AI: pakeisti foną į saloną"
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="hidden sm:inline">Salonas</span>
                </button>
              )}

              {/* Mobile move buttons */}
              <div className="flex sm:hidden absolute bottom-1 right-8 gap-0.5">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveImage(index, -1); }}
                  disabled={index === 0}
                  className="bg-black/60 text-white p-1 rounded disabled:opacity-30 active:bg-black/80"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveImage(index, 1); }}
                  disabled={index === images.length - 1}
                  className="bg-black/60 text-white p-1 rounded disabled:opacity-30 active:bg-black/80"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              
              {/* Remove button */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(img.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={previewIndex !== null} onOpenChange={(open) => { if (!open) setPreviewIndex(null); }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 flex flex-col items-center justify-center bg-black/95 border-none" aria-describedby={undefined}>
          <VisuallyHidden><DialogTitle>Nuotraukos peržiūra</DialogTitle></VisuallyHidden>
          {previewIndex !== null && images[previewIndex] && (
            <>
              <img
                src={images[previewIndex].url}
                alt={`Image ${previewIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
              <div className="flex items-center gap-4 mt-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex(prev => prev !== null ? prev - 1 : null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-white text-sm">
                  {previewIndex + 1} / {images.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  disabled={previewIndex === images.length - 1}
                  onClick={() => setPreviewIndex(prev => prev !== null ? prev + 1 : null)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
