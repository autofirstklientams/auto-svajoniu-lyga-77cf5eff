const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB target after compression
const QUALITY = 0.85;

export interface ResizedImage {
  file: File;
  wasResized: boolean;
}

/**
 * Resizes an image if it exceeds maximum dimensions or file size
 * Returns the resized file or original if no resizing was needed
 */
export const resizeImageIfNeeded = (file: File): Promise<ResizedImage> => {
  return new Promise((resolve, reject) => {
    // Skip non-image files
    if (!file.type.startsWith('image/')) {
      resolve({ file, wasResized: false });
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;
      let needsResize = false;

      // Check if resize is needed based on dimensions
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        needsResize = true;
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Also resize if file is too large
      if (file.size > MAX_FILE_SIZE * 2) {
        needsResize = true;
      }

      if (!needsResize && file.size <= MAX_FILE_SIZE * 2) {
        resolve({ file, wasResized: false });
        return;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        resolve({ file, wasResized: false });
        return;
      }

      // Draw image with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, wasResized: false });
            return;
          }

          // Create new file with same name
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({ file: resizedFile, wasResized: true });
        },
        'image/jpeg',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Process multiple images and resize them if needed
 */
export const processImages = async (files: File[]): Promise<ResizedImage[]> => {
  const results = await Promise.all(files.map(resizeImageIfNeeded));
  return results;
};

// ============================================
// Supabase Storage image transformation utilities
// Uses Supabase's render API for optimized thumbnails
// ============================================

/**
 * Transforms a Supabase storage URL to use the render API for resized images.
 * Falls back to original URL if not a Supabase storage URL.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number } = {}
): string {
  if (!url) return "/placeholder.svg";
  
  // Only transform Supabase storage URLs
  if (!url.includes("supabase.co/storage/v1/object/public/")) {
    return url;
  }

  const { width = 400, quality = 75 } = options;

  // Transform: /storage/v1/object/public/bucket/path 
  // To: /storage/v1/render/image/public/bucket/path?width=X&quality=Y
  const transformedUrl = url
    .replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
    + `?width=${width}&quality=${quality}`;

  return transformedUrl;
}

/**
 * Get thumbnail URL (small, fast loading for cards/grids)
 */
export function getThumbnailUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, { width: 400, quality: 70 });
}

/**
 * Get medium-sized URL (for detail page)
 */
export function getMediumUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, { width: 900, quality: 80 });
}

/**
 * Get full-size URL (for lightbox/zoom)
 */
export function getFullUrl(url: string | null | undefined): string {
  return url || "/placeholder.svg";
}
