import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectPosition?: string;
  /**
   * - cover: fills frame, may crop
   * - contain: shows full image, may letterbox
   * - contain-fill: shows full image while still filling the frame using a blurred cover background
   */
  fit?: "cover" | "contain" | "contain-fill";
}

function OptimizedImageComponent({
  src,
  alt,
  className,
  priority = false,
  aspectRatio,
  objectPosition = "center",
  fit = "cover",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setShouldLoad(true);
      return;
    }

    // Use native IntersectionObserver with aggressive rootMargin
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "400px", // Load images 400px before they enter viewport
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const objectClass =
    fit === "contain" || fit === "contain-fill" ? "object-contain" : "object-cover";

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted/30 flex items-center justify-center",
        className
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Minimal placeholder */}
      {!isLoaded && <div className="absolute inset-0 bg-muted/50" />}

      {shouldLoad && fit === "contain-fill" && (
        <img
          aria-hidden="true"
          src={src}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-110 blur-md",
            isLoaded ? "opacity-35" : "opacity-0",
            "transition-opacity duration-200"
          )}
          style={{ objectPosition }}
        />
      )}

      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "w-full h-full",
            objectClass,
            isLoaded ? "opacity-100" : "opacity-0",
            "transition-opacity duration-200"
          )}
          style={{ objectPosition }}
        />
      )}
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);
export default OptimizedImage;
