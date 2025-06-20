"use client"

import { loadModel, preprocessImage, classifyImage as runInference } from "../lib/model"
import { IMAGENET_CLASSES, getImageNetSuperclass } from "../lib/imagenet-classes"
import { generatePreprocessingSteps } from "../lib/image-processing"

export async function classifyImage(imageUrl: string, modelId = "mobilenet") {
  try {
    if (!imageUrl) {
      return { error: "No image provided" }
    }

    console.log(`Starting classification with ${modelId}...`)

    // Generate preprocessing steps visualization
    const preprocessingSteps = await generatePreprocessingSteps(imageUrl, modelId)

    try {
      // Load model
      const model = await loadModel(modelId)

      // Preprocess image
      const tensor = await preprocessImage(imageUrl, modelId)

      // Run inference
      const predictions = await runInference(model, tensor, modelId)

      // Format results - all models use ImageNet classes
      const results = predictions.map((pred) => {
        const classIndex = pred.classIndex
        const className = IMAGENET_CLASSES[classIndex] || `Class ${classIndex}`
        const superclass = getImageNetSuperclass(classIndex)

        return {
          className,
          superclass,
          probability: pred.probability,
        }
      })

      console.log(`Classification complete for ${modelId}:`, results[0])

      return { results, preprocessingSteps, modelId }
    } catch (error) {
      console.error("Model error:", error)

      // Return mock data if model fails
      return {
        results: getMockResults(),
        preprocessingSteps,
        modelId,
        isMock: true,
      }
    }
  } catch (error) {
    console.error("Classification error:", error)
    return { error: "Failed to classify image", modelId }
  }
}

// Generate mock results when model loading fails
function getMockResults() {
  return [
    { className: "golden retriever", superclass: "mammals", probability: 0.75 },
    { className: "Labrador retriever", superclass: "mammals", probability: 0.15 },
    { className: "German shepherd", superclass: "mammals", probability: 0.05 },
    { className: "beagle", superclass: "mammals", probability: 0.03 },
    { className: "husky", superclass: "mammals", probability: 0.02 },
  ]
}
