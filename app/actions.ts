"use client"

import { loadModel, preprocessImage, classifyImage as runInference } from "@/lib/model"
import { CIFAR100_CLASSES, CIFAR100_SUPERCLASSES } from "@/lib/cifar100-classes"
import { IMAGENET_CLASSES, getImageNetSuperclass } from "@/lib/imagenet-classes"
import { generatePreprocessingSteps } from "@/lib/image-processing"

export async function classifyImage(imageUrl: string, modelId = "cifar100") {
  try {
    if (!imageUrl) {
      return { error: "No image provided" }
    }

    // Generate preprocessing steps visualization
    const preprocessingSteps = await generatePreprocessingSteps(imageUrl, modelId)

    try {
      // Load model
      const model = await loadModel(modelId)

      // Preprocess image
      const tensor = await preprocessImage(imageUrl, modelId)

      // Run inference
      const predictions = await runInference(model, tensor, modelId)

      // Format results based on model
      let results
      if (modelId === "cifar100") {
        results = predictions.map((pred) => {
          const classIndex = pred.classIndex
          const className = CIFAR100_CLASSES[classIndex] || `Unknown (${classIndex})`
          const superclassIndex = Math.floor(classIndex / 5)
          const superclass = CIFAR100_SUPERCLASSES[superclassIndex] || "Unknown"

          return {
            className,
            superclass,
            probability: pred.probability,
          }
        })
      } else {
        // MobileNet or EfficientNet (ImageNet classes)
        results = predictions.map((pred) => {
          const classIndex = pred.classIndex
          const className = IMAGENET_CLASSES[classIndex] || `Class ${classIndex}`
          const superclass = getImageNetSuperclass(classIndex)

          return {
            className,
            superclass,
            probability: pred.probability,
          }
        })
      }

      return { results, preprocessingSteps, modelId }
    } catch (error) {
      console.error("Model error:", error)

      // Return a message about using mock data
      return {
        results: getMockResults(modelId),
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
function getMockResults(modelId: string) {
  if (modelId === "cifar100") {
    return [
      { className: "dog", superclass: "mammals", probability: 0.85 },
      { className: "wolf", superclass: "mammals", probability: 0.1 },
      { className: "fox", superclass: "mammals", probability: 0.03 },
      { className: "cat", superclass: "mammals", probability: 0.01 },
      { className: "tiger", superclass: "mammals", probability: 0.01 },
    ]
  } else {
    // ImageNet classes for MobileNet/EfficientNet
    return [
      { className: "golden retriever", superclass: "mammals", probability: 0.75 },
      { className: "Labrador retriever", superclass: "mammals", probability: 0.15 },
      { className: "German shepherd", superclass: "mammals", probability: 0.05 },
      { className: "beagle", superclass: "mammals", probability: 0.03 },
      { className: "husky", superclass: "mammals", probability: 0.02 },
    ]
  }
}
