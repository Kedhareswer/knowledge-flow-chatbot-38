import * as tf from "@tensorflow/tfjs"

// Model metadata
export const modelMetadata = {
  cifar100: {
    inputSize: 32,
    classes: 100,
  },
  mobilenet: {
    inputSize: 224,
    classes: 1000,
  },
  efficientnet: {
    inputSize: 224,
    classes: 1000,
  },
}

// Mock model implementation
class MockModel {
  modelId: string

  constructor(modelId: string) {
    this.modelId = modelId
  }

  predict(input: tf.Tensor): tf.Tensor {
    // Get the number of classes for this model
    const numClasses = modelMetadata[this.modelId as keyof typeof modelMetadata]?.classes || 100

    // Create a mock prediction tensor with random values
    // We'll make it deterministic based on the input to simulate consistent predictions
    const inputSum = tf.sum(input).dataSync()[0]
    const seed = Math.floor(inputSum * 1000) % 1000 // Use input data to seed the random predictions

    // Create a deterministic but seemingly random distribution
    const mockPredictions = Array(numClasses)
      .fill(0)
      .map((_, i) => {
        // Generate a value between 0 and 1 that's deterministic for the same input
        const val = Math.sin(i * seed) * 0.5 + 0.5
        return val * val // Square to make distribution more peaked
      })

    // Normalize to sum to 1
    const sum = mockPredictions.reduce((a, b) => a + b, 0)
    const normalized = mockPredictions.map((v) => v / sum)

    return tf.tensor(normalized)
  }
}

// Load the model (returns a real model if available, otherwise falls back to mock model)
export async function loadModel(modelId = "cifar100") {
  // Initialize TensorFlow.js
  await tf.ready()

  try {
    // Attempt to load a real model
    console.log(`Attempting to load real model for ${modelId}...`)
    
    // Define model URLs based on modelId
    const modelUrls = {
      cifar100: "./models/cifar100/model.json",
      mobilenet: "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json",
      efficientnet: "./models/efficientnet/model.json"
    }
    
    // Get the appropriate URL for the requested model
    const modelUrl = modelUrls[modelId as keyof typeof modelUrls]
    
    if (!modelUrl) {
      throw new Error(`No model URL defined for ${modelId}`)
    }
    
    // Load the model from the specified URL
    const model = await tf.loadLayersModel(modelUrl)
    console.log(`Successfully loaded real ${modelId} model`)
    return model
  } catch (error) {
    // If loading the real model fails, fall back to the mock model
    console.warn(`Failed to load real model: ${error}. Using mock model instead.`)
    console.log(`Loading mock model for ${modelId}`)
    return new MockModel(modelId)
  }
}

// Preprocess image for model inference
export async function preprocessImage(imageUrl: string, modelId = "cifar100"): Promise<tf.Tensor> {
  const metadata = modelMetadata[modelId as keyof typeof modelMetadata] || modelMetadata.cifar100
  const inputSize = metadata.inputSize

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        // Create a tensor from the image
        const imageTensor = tf.browser.fromPixels(img).resizeNearestNeighbor([inputSize, inputSize]).toFloat()

        // Apply appropriate normalization based on model
        let normalized
        if (modelId === "mobilenet") {
          // MobileNet normalization: [-1, 1]
          normalized = imageTensor.div(tf.scalar(127.5)).sub(tf.scalar(1))
        } else {
          // Default normalization: [0, 1]
          normalized = imageTensor.div(tf.scalar(255))
        }

        // Add batch dimension [1, height, width, channels]
        const batched = normalized.expandDims(0)

        resolve(batched)
      } catch (error) {
        console.error("Error preprocessing image:", error)
        reject(error)
      }
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageUrl
  })
}

// Run inference
export async function classifyImage(model: any, imageTensor: tf.Tensor, modelId = "cifar100") {
  try {
    // Run prediction
    const predictions = model.predict(imageTensor)

    // Get top 5 predictions
    const topPredictions = await getTopKPredictions(predictions, 5)

    // Clean up tensors
    tf.dispose([imageTensor, predictions])

    return topPredictions
  } catch (error) {
    console.error("Error during classification:", error)
    throw error
  }
}

// Get top K predictions
async function getTopKPredictions(predictions: tf.Tensor, k: number) {
  const values = await predictions.data() as Float32Array
  const valuesAndIndices = Array.from(values).map((value, index) => ({
    value: value as number,
    index,
  }))

  // Sort by probability (descending)
  const sorted = valuesAndIndices.sort((a, b) => b.value - a.value)

  // Get top K
  const topK = sorted.slice(0, k)

  return topK.map((item) => ({
    classIndex: item.index,
    probability: item.value,
  }))
}
