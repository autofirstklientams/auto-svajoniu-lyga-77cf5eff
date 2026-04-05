import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DraggableImage } from "./types";

export function useDragAndDrop(
  images: DraggableImage[], 
  onReorder: (images: DraggableImage[]) => void
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const makeMainPhoto = useCallback((index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [image] = newImages.splice(index, 1);
    newImages.unshift(image);
    onReorder(newImages);
  }, [images, onReorder]);

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    moveImage,
    makeMainPhoto
  };
}

export function useAiBackground(
  images: DraggableImage[],
  carId?: string,
  onReplaceUrl?: (id: string, newUrl: string) => void
) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedForAi, setSelectedForAi] = useState<Set<string>>(new Set());
  const [originalUrls, setOriginalUrls] = useState<Map<string, string>>(new Map());
  
  // AbortController ref for cancellation
  const abortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount — cancel any in-flight AI work
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  const handleAiBackground = useCallback(async (img: DraggableImage, imageIndex: number) => {
    if (!carId || !onReplaceUrl) return;
    
    // Create abort controller for this operation
    const controller = new AbortController();
    abortRef.current = controller;
    
    setProcessingIds(prev => new Set(prev).add(img.id));
    
    try {
      setOriginalUrls(prev => {
        const next = new Map(prev);
        if (!next.has(img.id)) {
          next.set(img.id, img.url);
        }
        return next;
      });

      // Check if cancelled before starting
      if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

      let attempts = 0;
      let data: any = null;
      while (attempts < 3) {
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        
        const result = await supabase.functions.invoke('replace-car-background', {
          body: { imageUrl: img.url, carId, isMainPhoto: images.length > 0 && images[0].id === img.id },
        });

        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

        if (result.error) {
          const errorBody = result.data;
          if (errorBody?.error?.includes('Per daug') || result.error.message?.includes('non-2xx')) {
            attempts++;
            if (attempts < 3) {
              await new Promise(r => setTimeout(r, 3000 * attempts));
              continue;
            }
          }
          throw new Error(errorBody?.error || result.error.message || 'Nepavyko pakeisti fono');
        }

        data = result.data;
        break;
      }

      if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      if (!data?.success) throw new Error(data?.error || 'Nepavyko pakeisti fono');

      // Only apply if still mounted
      if (isMountedRef.current) {
        onReplaceUrl(img.id, data.url);
        toast.success('Fonas pakeistas! Galite atsaukti paspaudę ↩ mygtuką.');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('AI background replacement cancelled by user');
        // Restore original URL if we saved it
        if (isMountedRef.current) {
          setOriginalUrls(prev => {
            const next = new Map(prev);
            next.delete(img.id);
            return next;
          });
        }
        return;
      }
      console.error('AI background error:', err);
      if (isMountedRef.current) {
        setOriginalUrls(prev => {
          const next = new Map(prev);
          next.delete(img.id);
          return next;
        });
        toast.error(err.message || 'Klaida keičiant foną');
      }
    } finally {
      if (isMountedRef.current) {
        setProcessingIds(prev => {
          const next = new Set(prev);
          next.delete(img.id);
          return next;
        });
      }
    }
  }, [carId, onReplaceUrl, images]);

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
    setSelectedForAi(prev => {
      const next = new Set(prev);
      next.delete(img.id);
      return next;
    });
    toast.success('Originalus fonas grąžintas! Galite bandyti dar kartą.');
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
    
    const controller = new AbortController();
    abortRef.current = controller;
    
    const imagesToProcess = images.filter(img => 
      selectedForAi.has(img.id) && !originalUrls.has(img.id) && !processingIds.has(img.id)
    );
    
    if (imagesToProcess.length === 0) {
      toast.info('Pasirinkite nuotraukas, kurioms norite keisti foną.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < imagesToProcess.length; i++) {
      // Check abort before each image
      if (controller.signal.aborted || !isMountedRef.current) {
        console.log('Bulk AI background cancelled by user');
        toast.info(`AI fono keitimas atšauktas. Pakeista ${successCount}/${imagesToProcess.length}.`);
        break;
      }

      const img = imagesToProcess[i];
      const isFirstImage = images.length > 0 && images[0].id === img.id;
      
      toast.info(`Keičiamas fonas ${i + 1}/${imagesToProcess.length}...`);
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
          if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
          
          const result = await supabase.functions.invoke('replace-car-background', {
            body: { imageUrl: img.url, carId, isMainPhoto: isFirstImage },
          });

          if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

          if (result.error) {
            const errorBody = result.data;
            if (errorBody?.error?.includes('Per daug') || result.error.message?.includes('non-2xx')) {
              attempts++;
              if (attempts < 3) {
                await new Promise(r => setTimeout(r, 4000 * attempts));
                continue;
              }
            }
            throw new Error(errorBody?.error || result.error.message || 'Nepavyko pakeisti fono');
          }
          data = result.data;
          break;
        }

        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (!data?.success) throw new Error(data?.error || 'Nepavyko pakeisti fono');

        if (isMountedRef.current) {
          onReplaceUrl(img.id, data.url);
          successCount++;
          toast.success(`Nuotrauka ${i + 1}/${imagesToProcess.length} – fonas pakeistas! Spauskite ↩ grąžinti.`);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // Restore this image's original
          if (isMountedRef.current) {
            setOriginalUrls(prev => {
              const next = new Map(prev);
              next.delete(img.id);
              return next;
            });
          }
          toast.info(`AI fono keitimas atšauktas. Pakeista ${successCount}/${imagesToProcess.length}.`);
          break;
        }
        console.error('Bulk AI error for image', i, err);
        if (isMountedRef.current) {
          setOriginalUrls(prev => {
            const next = new Map(prev);
            next.delete(img.id);
            return next;
          });
        }
        failCount++;
        toast.error(`Nuotrauka ${i + 1} – nepavyko: ${err.message}`);
      } finally {
        if (isMountedRef.current) {
          setProcessingIds(prev => {
            const next = new Set(prev);
            next.delete(img.id);
            return next;
          });
          setSelectedForAi(prev => {
            const next = new Set(prev);
            next.delete(img.id);
            return next;
          });
        }
      }
      
      if (i < imagesToProcess.length - 1 && !controller.signal.aborted) {
         await new Promise(r => setTimeout(r, 3000));
      }
    }
    
    if (isMountedRef.current && imagesToProcess.length > 1 && !controller.signal.aborted) {
      if (successCount > 0) toast.success(`Baigta! Pakeista ${successCount}/${imagesToProcess.length}. Kiekvieną galite atsaukti ↩ mygtuku.`);
      if (failCount > 0) toast.error(`Nepavyko pakeisti ${failCount} nuotraukų fono.`);
    }
  }, [carId, images, onReplaceUrl, processingIds, originalUrls, selectedForAi]);

  return {
    processingIds,
    selectedForAi,
    originalUrls,
    handleAiBackground,
    handleUndoBackground,
    toggleSelectForAi,
    selectAllForAi,
    clearSelectionForAi,
    handleBulkAiBackground
  };
}
