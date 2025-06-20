// Browser-compatible image processing utilities
import { modelMetadata } from "./model"

export async function resizeImage(imageUrl: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Draw image with resizing
        ctx.drawImage(img, 0, 0, width, height)

        // Get data URL
        resolve(canvas.toDataURL("image/png"))
      } catch (error) {
        console.error("Error resizing image:", error)
        reject(error)
      }
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageUrl
  })
}

export async function normalizeImage(imageUrl: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height)

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        // Simple normalization (this is visual only, not the actual model preprocessing)
        for (let i = 0; i < data.length; i += 4) {
          // Normalize RGB values
          data[i] = (data[i] / 255) * 255 // R
          data[i + 1] = (data[i + 1] / 255) * 255 // G
          data[i + 2] = (data[i + 2] / 255) * 255 // B
          // Alpha remains unchanged
        }

        // Put the processed data back
        ctx.putImageData(imageData, 0, 0)

        // Get data URL
        resolve(canvas.toDataURL("image/png"))
      } catch (error) {
        console.error("Error normalizing image:", error)
        reject(error)
      }
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageUrl
  })
}

export async function generatePreprocessingSteps(
  imageUrl: string,
  modelId = "cifar100",
): Promise<{
  original: string
  resized: string
  normalized: string
}> {
  try {
    const metadata = modelMetadata[modelId as keyof typeof modelMetadata] || modelMetadata.cifar100
    const inputSize = metadata.inputSize

    // Original image (just use the original)
    const original = imageUrl

    // For display purposes, we'll use larger images
    const displaySize = 300

    // Resized image (to model input size, but scaled up for display)
    const resizedSmall = await resizeImage(imageUrl, inputSize, inputSize)
    const resized = await resizeImage(resizedSmall, displaySize, displaySize)

    // Normalized image (visual representation)
    const normalized = await normalizeImage(resized, displaySize, displaySize)

    return {
      original,
      resized,
      normalized,
    }
  } catch (error) {
    console.error("Error generating preprocessing steps:", error)
    // Return the original image for all steps as fallback
    return {
      original: imageUrl,
      resized: imageUrl,
      normalized: imageUrl,
    }
  }
}
