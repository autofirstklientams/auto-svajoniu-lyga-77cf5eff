import { memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectPosition?: string;
  fit?: "cover" | "contain" | "contain-fill";
  width?: number;
  height?: number;
}

function OptimizedImageComponent({
  src,
  alt,
  className,
  priority = false,
  aspectRatio,
  objectPosition = "center",
  fit = "cover",
  width,
  height,
}: OptimizedImageProps) {
  const objectClass =
    fit === "contain" || fit === "contain-fill" ? "object-contain" : "object-cover";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/30 flex items-center justify-center",
        className
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {fit === "contain-fill" && (
        <img
          aria-hidden="true"
          src={src}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-35"
          style={{ objectPosition }}
        />
      )}

      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn("w-full h-full", objectClass)}
        style={{ objectPosition }}
      />
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);
export default OptimizedImage;
