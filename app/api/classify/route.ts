import { type NextRequest, NextResponse } from "next/server"
import { loadModel, preprocessImage, classifyImage } from "@/lib/model"
import { CIFAR100_CLASSES, CIFAR100_SUPERCLASSES } from "@/lib/cifar100-classes"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Load model
    const model = await loadModel()

    // Preprocess image
    const tensor = await preprocessImage(buffer)

    // Run inference
    const predictions = await classifyImage(model, tensor)

    // Format results
    const results = predictions.map((pred) => {
      const classIndex = pred.classIndex
      const className = CIFAR100_CLASSES[classIndex]
      const superclassIndex = Math.floor(classIndex / 5)
      const superclass = CIFAR100_SUPERCLASSES[superclassIndex]

      return {
        className,
        superclass,
        probability: pred.probability,
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json({ error: "Failed to classify image" }, { status: 500 })
  }
}
