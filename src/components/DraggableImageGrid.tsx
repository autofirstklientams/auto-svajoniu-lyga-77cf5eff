import { useState, useCallback } from "react";
import { X, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  title: string;
}

export function DraggableImageGrid({ images, onReorder, onRemove, title }: DraggableImageGridProps) {
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
        {images.map((img, index) => (
          <div
            key={img.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              "relative aspect-square rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing transition-all duration-200 group",
              draggedIndex === index && "opacity-50 scale-95",
              dragOverIndex === index && "ring-2 ring-primary ring-offset-2 scale-105"
            )}
          >
            <img
              src={img.url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            
            {/* Order badge */}
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {index + 1}
            </div>
            
            {/* Drag handle - desktop */}
            <div className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              <GripVertical className="h-3 w-3" />
            </div>

            {/* Mobile move buttons - always visible */}
            <div className="flex sm:hidden absolute bottom-1 right-1 gap-0.5">
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
            
            {/* Remove button - always visible on mobile, hover on desktop */}
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
        ))}
      </div>
    </div>
  );
}
