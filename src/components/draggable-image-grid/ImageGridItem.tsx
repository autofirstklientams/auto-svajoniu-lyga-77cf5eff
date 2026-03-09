import { X, GripVertical, ChevronLeft, ChevronRight, Sparkles, Loader2, ZoomIn, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DraggableImage } from "./types";

interface ImageGridItemProps {
  img: DraggableImage;
  index: number;
  totalImages: number;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  isProcessing: boolean;
  isSelected: boolean;
  hasAiProcessed: boolean;
  canSelect: boolean;
  showAiBackground: boolean;
  carId?: string;
  onReplaceUrl?: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onRemove: (id: string) => void;
  onPreview: (index: number) => void;
  onToggleSelect: (id: string) => void;
  onAiBackground: (img: DraggableImage, index: number) => void;
  onUndoBackground: (img: DraggableImage) => void;
  onMakeMain: (index: number) => void;
  onMoveImage: (index: number, direction: -1 | 1) => void;
}

export function ImageGridItem({
  img,
  index,
  totalImages,
  draggedIndex,
  dragOverIndex,
  isProcessing,
  isSelected,
  hasAiProcessed,
  canSelect,
  showAiBackground,
  carId,
  onReplaceUrl,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onPreview,
  onToggleSelect,
  onAiBackground,
  onUndoBackground,
  onMakeMain,
  onMoveImage
}: ImageGridItemProps) {
  return (
    <div
      draggable={!isProcessing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
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
        loading="lazy"
      />

      {isProcessing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
          <Loader2 className="h-6 w-6 text-white animate-spin mb-1" />
          <span className="text-white text-xs font-medium">AI fonas...</span>
        </div>
      )}

      {canSelect && (
        <div className="absolute top-2 left-2 z-20" onClick={e => e.stopPropagation()}>
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(img.id)}
            className="h-5 w-5 bg-white/90 border-2 border-white data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 shadow-sm"
          />
        </div>
      )}
      
      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium z-10 pointer-events-none">
        {index + 1}
      </div>
      
      <div className={cn(
        "absolute bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block",
        canSelect ? "top-1 left-9" : "top-1 left-1"
      )}>
        <GripVertical className="h-4 w-4" />
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPreview(index); }}
        className={cn(
          "absolute bg-black/50 text-white p-2 sm:p-1 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 shadow-sm",
          canSelect ? "top-10 left-2 sm:top-8 sm:left-2" : "top-1 left-1 sm:top-1 sm:left-8"
        )}
        title="Padidinti"
      >
        <ZoomIn className="h-4 w-4 sm:h-3 sm:w-3" />
      </button>

      {showAiBackground && carId && onReplaceUrl && !isProcessing && (
        <div className="absolute top-2 right-10 sm:top-8 sm:right-1 flex flex-col gap-2 sm:gap-1 opacity-100 z-30">
          {hasAiProcessed ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onUndoBackground(img); }}
              className="bg-amber-500 hover:bg-amber-600 text-white p-2 sm:p-1.5 rounded flex items-center justify-center shadow-md transition-colors"
              title="Atšaukti AI foną"
            >
              <Undo2 className="h-4 w-4 sm:h-3 sm:w-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAiBackground(img, index); }}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-2 sm:p-1.5 rounded flex items-center justify-center shadow-md transition-all"
              title="AI: pakeisti foną į saloną"
            >
              <Sparkles className="h-4 w-4 sm:h-3 sm:w-3" />
            </button>
          )}
        </div>
      )}

      <div className="flex sm:hidden absolute bottom-1 right-1 gap-1 z-20">
        {index > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMakeMain(index); }}
            className="bg-primary/90 text-primary-foreground px-2 py-1.5 rounded text-[10px] font-bold shadow-md active:bg-primary"
          >
            PIRMA
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveImage(index, -1); }}
          disabled={index === 0}
          className="bg-black/60 text-white p-1.5 rounded disabled:opacity-30 active:bg-black/80 shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveImage(index, 1); }}
          disabled={index === totalImages - 1}
          className="bg-black/60 text-white p-1.5 rounded disabled:opacity-30 active:bg-black/80 shadow-md"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 sm:top-1 sm:right-1 h-8 w-8 sm:h-6 sm:w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(img.id);
        }}
      >
        <X className="h-4 w-4 sm:h-3 sm:w-3" />
      </Button>
    </div>
  );
}