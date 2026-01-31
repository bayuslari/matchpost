// Image compression utility for profile photos
// Compresses images to max dimensions and quality before upload

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number  // 0-1, default 0.8
  maxSizeKB?: number  // Target max file size in KB
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.85,
  maxSizeKB: 200,
}

/**
 * Compress an image file before upload
 * Returns a compressed Blob ready for upload
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<{ blob: Blob; width: number; height: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        const maxWidth = opts.maxWidth!
        const maxHeight = opts.maxHeight!

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Try to compress to target size
        let quality = opts.quality!
        const targetSize = (opts.maxSizeKB || 200) * 1024

        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }

              // If still too large and quality > 0.5, reduce quality and retry
              if (blob.size > targetSize && quality > 0.5) {
                quality -= 0.1
                compress()
                return
              }

              resolve({ blob, width, height })
            },
            'image/jpeg',
            quality
          )
        }

        compress()
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Max allowed file size before compression (5MB)
 */
export const MAX_ORIGINAL_SIZE = 5 * 1024 * 1024
