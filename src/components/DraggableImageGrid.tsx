import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDragAndDrop, useAiBackground } from "./draggable-image-grid/hooks";
import { ImageGridItem } from "./draggable-image-grid/ImageGridItem";
import { DraggableImage } from "./draggable-image-grid/types";

export type { DraggableImage };

interface DraggableImageGridProps {
  images: DraggableImage[];
  onReorder: (images: DraggableImage[]) => void;
  onRemove: (id: string) => void;
  onReplaceUrl?: (id: string, newUrl: string) => void;
  onRotateImage?: (updatedImg: DraggableImage) => void;
  title: string;
  carId?: string;
  showAiBackground?: boolean;
}

export function DraggableImageGrid({ images, onReorder, onRemove, onReplaceUrl, onRotateImage, title, carId, showAiBackground = false }: DraggableImageGridProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    moveImage,
    makeMainPhoto
  } = useDragAndDrop(images, onReorder);

  const {
    processingIds,
    selectedForAi,
    originalUrls,
    handleAiBackground,
    handleUndoBackground,
    toggleSelectForAi,
    selectAllForAi,
    clearSelectionForAi,
    handleBulkAiBackground
  } = useAiBackground(images, carId, onReplaceUrl);

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
          const canSelect = showAiBackground && !!carId && !!onReplaceUrl && !isProcessing && !hasAiProcessed;
          
          return (
            <ImageGridItem
              key={img.id}
              img={img}
              index={index}
              totalImages={images.length}
              draggedIndex={draggedIndex}
              dragOverIndex={dragOverIndex}
              isProcessing={isProcessing}
              isSelected={isSelected}
              hasAiProcessed={hasAiProcessed}
              canSelect={canSelect}
              showAiBackground={!!showAiBackground}
              carId={carId}
              onReplaceUrl={!!onReplaceUrl}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemove={onRemove}
              onPreview={setPreviewIndex}
              onToggleSelect={toggleSelectForAi}
              onAiBackground={handleAiBackground}
              onUndoBackground={handleUndoBackground}
              onMakeMain={makeMainPhoto}
              onMoveImage={moveImage}
              onRotateImage={onRotateImage}
            />
          );
        })}
      </div>

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