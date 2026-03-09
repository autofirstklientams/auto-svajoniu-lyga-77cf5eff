import { useState, useCallback } from "react";
import { X, GripVertical, ChevronLeft, ChevronRight, Sparkles, Loader2, ZoomIn, Undo2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedForAi, setSelectedForAi] = useState<Set<string>>(new Set());
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

  const handleAiBackground = useCallback(async (img: DraggableImage, imageIndex: number) => {
    if (!carId || !onReplaceUrl) return;
    
    setProcessingIds(prev => new Set(prev).add(img.id));
    
    try {
      // Save original URL before replacement
      setOriginalUrls(prev => {
        const next = new Map(prev);
        if (!next.has(img.id)) {
          next.set(img.id, img.url);
        }
        return next;
      });

      // Retry logic for rate limits
      let attempts = 0;
      let data: any = null;
      while (attempts < 3) {
        const result = await supabase.functions.invoke('replace-car-background', {
          body: { imageUrl: img.url, carId, isMainPhoto: imageIndex === 0 },
        });

        if (result.error) {
          // Check if it's a rate limit (429)
          const errorBody = result.data;
          if (errorBody?.error?.includes('Per daug') || result.error.message?.includes('non-2xx')) {
            attempts++;
            if (attempts < 3) {
              await new Promise(r => setTimeout(r, 3000 * attempts)); // wait 3s, 6s
              continue;
            }
          }
          throw new Error(errorBody?.error || result.error.message || 'Nepavyko pakeisti fono');
        }

        data = result.data;
        break;
      }

      if (!data?.success) throw new Error(data?.error || 'Nepavyko pakeisti fono');

      onReplaceUrl(img.id, data.url);
      toast.success('Fonas pakeistas! Galite atsaukti paspaudę ↩ mygtuką.');
    } catch (err: any) {
      console.error('AI background error:', err);
      // Remove saved original on failure
      setOriginalUrls(prev => {
        const next = new Map(prev);
        next.delete(img.id);
        return next;
      });
      toast.error(err.message || 'Klaida keičiant foną');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(img.id);
        return next;
      });
    }
  }, [carId, onReplaceUrl]);

  const handleUndoBackground = useCallback((img: DraggableImage) => {
    if (!onReplaceUrl) return;
    const originalUrl = originalUrls.get(img.id);
    if (!originalUrl) return;
    
    onReplaceUrl(img.id, originalUrl);
    setOriginalUrls(prev => {
      const next = new Map(prev);
      next.delete(img.id);
      return next;
    });
    toast.success('Originalus fonas grąžintas!');
  }, [onReplaceUrl, originalUrls]);

  const toggleSelectForAi = useCallback((id: string) => {
    setSelectedForAi(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllForAi = useCallback(() => {
    const unprocessedIds = images
      .filter(img => !originalUrls.has(img.id) && !processingIds.has(img.id))
      .map(img => img.id);
    setSelectedForAi(new Set(unprocessedIds));
  }, [images, originalUrls, processingIds]);

  const clearSelectionForAi = useCallback(() => {
    setSelectedForAi(new Set());
  }, []);

  const handleBulkAiBackground = useCallback(async () => {
    if (!carId || !onReplaceUrl) return;
    
    // Get selected images that haven't been AI processed yet
    const imagesToProcess = images.filter(img => 
      selectedForAi.has(img.id) && !originalUrls.has(img.id) && !processingIds.has(img.id)
    );
    
    if (imagesToProcess.length === 0) {
      toast.info('Pasirinkite nuotraukas, kurioms norite keisti foną.');
      return;
    }

    if (!window.confirm(`Ar tikrai norite pakeisti ${imagesToProcess.length} nuotraukų fonus? Tai gali užtrukti (po ~10s kiekvienai).`)) {
      return;
    }

    let successCount = 0;
    let failCount = 0;
    
    toast.info(`Pradedamas fono keitimas (${imagesToProcess.length} nuotr.). Prašome palaukti...`);

    for (let i = 0; i < imagesToProcess.length; i++) {
      const img = imagesToProcess[i];
      const imageIndex = images.findIndex(im => im.id === img.id);
      
      setProcessingIds(prev => new Set(prev).add(img.id));
      
      try {
        setOriginalUrls(prev => {
          const next = new Map(prev);
          if (!next.has(img.id)) next.set(img.id, img.url);
          return next;
        });

        let attempts = 0;
        let data: any = null;
        while (attempts < 3) {
          const result = await supabase.functions.invoke('replace-car-background', {
            body: { imageUrl: img.url, carId, isMainPhoto: imageIndex === 0 },
          });

          if (result.error) {
            const errorBody = result.data;
            if (errorBody?.error?.includes('Per daug') || result.error.message?.includes('non-2xx')) {
              attempts++;
              if (attempts < 3) {
                await new Promise(r => setTimeout(r, 4000 * attempts)); // wait 4s, 8s
                continue;
              }
            }
            throw new Error(errorBody?.error || result.error.message || 'Nepavyko pakeisti fono');
          }
          data = result.data;
          break;
        }

        if (!data?.success) throw new Error(data?.error || 'Nepavyko pakeisti fono');

        onReplaceUrl(img.id, data.url);
        successCount++;
        // Remove from selection after success
        setSelectedForAi(prev => {
          const next = new Set(prev);
          next.delete(img.id);
          return next;
        });
      } catch (err: any) {
        console.error('Bulk AI error for image', imageIndex, err);
        setOriginalUrls(prev => {
          const next = new Map(prev);
          next.delete(img.id);
          return next;
        });
        failCount++;
      } finally {
        setProcessingIds(prev => {
          const next = new Set(prev);
          next.delete(img.id);
          return next;
        });
      }
      
      // Delay between images to respect rate limits
      if (i < imagesToProcess.length - 1) {
         await new Promise(r => setTimeout(r, 3000));
      }
    }
    
    if (successCount > 0) {
      toast.success(`Sėkmingai pakeistas ${successCount} nuotraukų fonas!`);
    }
    if (failCount > 0) {
      toast.error(`Nepavyko pakeisti ${failCount} nuotraukų fono.`);
    }
  }, [carId, images, onReplaceUrl, processingIds, originalUrls, selectedForAi]);

  if (images.length === 0) return null;

  const unprocessedCount = images.filter(img => !originalUrls.has(img.id) && !processingIds.has(img.id)).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium flex items-center gap-2">
          {title}
          <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
            (vilkite, kad pakeistumėte tvarką)
          </span>
          <span className="text-xs text-muted-foreground font-normal sm:hidden">
            (naudokite rodykles tvarkai keisti)
          </span>
        </p>
        
        {showAiBackground && carId && onReplaceUrl && images.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedForAi.size > 0 ? (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelectionForAi}
                  className="h-8 text-xs"
                >
                  Atšaukti ({selectedForAi.size})
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleBulkAiBackground}
                  disabled={processingIds.size > 0}
                  className="h-8 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Keisti foną ({selectedForAi.size})
                </Button>
              </>
            ) : (
              <>
                {unprocessedCount > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAllForAi}
                    className="h-8 text-xs"
                  >
                    <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                    Pasirinkti visas ({unprocessedCount})
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  Pažymėkite nuotraukas AI fonui
                </span>
              </>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((img, index) => {
          const isProcessing = processingIds.has(img.id);
          const isSelected = selectedForAi.has(img.id);
          const hasAiProcessed = originalUrls.has(img.id);
          const canSelect = showAiBackground && carId && onReplaceUrl && !isProcessing && !hasAiProcessed;
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

              {/* Selection Checkbox */}
              {canSelect && (
                <div className="absolute top-2 left-2 z-20" onClick={e => e.stopPropagation()}>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectForAi(img.id)}
                    className="h-5 w-5 bg-white/90 border-2 border-white data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 shadow-sm"
                  />
                </div>
              )}
              
              {/* Order badge */}
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
              
              {/* Drag handle - desktop */}
              <div className={cn(
                "absolute bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block",
                canSelect ? "top-1 left-9" : "top-1 left-1"
              )}>
                <GripVertical className="h-3 w-3" />
              </div>

              {/* Zoom button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
                className={cn(
                  "absolute bg-black/50 text-white p-1 rounded sm:opacity-0 sm:group-hover:opacity-100 transition-opacity",
                  canSelect ? "top-8 left-2 sm:left-9" : "top-1 left-1 sm:left-8"
                )}
                title="Padidinti"
              >
                <ZoomIn className="h-3 w-3" />
              </button>

              {/* AI Background button */}
              {showAiBackground && carId && onReplaceUrl && !isProcessing && (
                <div className="absolute top-8 right-1 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20">
                  {originalUrls.has(img.id) && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleUndoBackground(img); }}
                      className="bg-background text-foreground p-1.5 rounded flex items-center justify-center gap-1 text-xs shadow-sm"
                      title="Atsaukti AI foną"
                    >
                      <Undo2 className="h-4 w-4 sm:h-3 sm:w-3" />
                    </button>
                  )}
                  {!originalUrls.has(img.id) && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleAiBackground(img, index); }}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-1.5 rounded flex items-center justify-center gap-1 text-xs shadow-sm"
                      title="AI: pakeisti foną į saloną"
                    >
                      <Sparkles className="h-4 w-4 sm:h-3 sm:w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Mobile move buttons */}
              <div className="flex sm:hidden absolute bottom-1 right-1 gap-0.5 z-20">
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
                className="absolute top-1 right-1 h-6 w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20"
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
