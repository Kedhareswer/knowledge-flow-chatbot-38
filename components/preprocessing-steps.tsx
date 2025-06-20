"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

type PreprocessingStepsProps = {
  originalImage: string | null
  preprocessingSteps: {
    original: string
    resized: string
    normalized: string
  } | null
}

export function PreprocessingSteps({ originalImage, preprocessingSteps }: PreprocessingStepsProps) {
  const [activeTab, setActiveTab] = useState("visual")
  const [modelId, setModelId] = useState<string>("cifar100")

  useEffect(() => {
    const handleClassificationResult = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail.modelId) {
        setModelId(customEvent.detail.modelId)
      }
    }

    window.addEventListener("classification-result", handleClassificationResult)

    return () => {
      window.removeEventListener("classification-result", handleClassificationResult)
    }
  }, [])

  if (!originalImage || !preprocessingSteps) {
    return null
  }

  const getModelSpecificDetails = () => {
    switch (modelId) {
      case "mobilenet":
        return {
          size: "224x224",
          normalization: "[-1, 1]",
          details:
            "MobileNet uses a different normalization range (-1 to 1) to improve training stability and model performance.",
        }
      case "efficientnet":
        return {
          size: "224x224",
          normalization: "[0, 1]",
          details:
            "EfficientNet uses standard normalization (0 to 1) but with a larger input size for better feature extraction.",
        }
      case "cifar100":
      default:
        return {
          size: "32x32",
          normalization: "[0, 1]",
          details:
            "CIFAR-100 uses a small input size because the dataset consists of small images, and standard normalization.",
        }
    }
  }

  const modelDetails = getModelSpecificDetails()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Image Preprocessing Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visual" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Visual Steps</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 overflow-x-auto pb-2">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 border rounded overflow-hidden">
                  <Image
                    src={preprocessingSteps.original || "/placeholder.svg"}
                    alt="Original"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm mt-1">Original</span>
              </div>

              <ArrowRight className="rotate-90 md:rotate-0 my-2 md:my-0 text-muted-foreground" />

              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 border rounded overflow-hidden">
                  <Image
                    src={preprocessingSteps.resized || "/placeholder.svg"}
                    alt={`Resized (${modelDetails.size})`}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm mt-1">Resized ({modelDetails.size})</span>
              </div>

              <ArrowRight className="rotate-90 md:rotate-0 my-2 md:my-0 text-muted-foreground" />

              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 border rounded overflow-hidden">
                  <Image
                    src={preprocessingSteps.normalized || "/placeholder.svg"}
                    alt="Normalized"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm mt-1">Normalized</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="pt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Original Image</h3>
              <p className="text-sm text-muted-foreground">
                The uploaded image is first converted to a format that can be processed by the model.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">2. Resize to {modelDetails.size}</h3>
              <p className="text-sm text-muted-foreground">
                {modelId === "cifar100"
                  ? "CIFAR-100 models expect 32x32 pixel images."
                  : `${modelId === "mobilenet" ? "MobileNet" : "EfficientNet"} models expect ${
                      modelDetails.size
                    } pixel images.`}{" "}
                We resize your image to match this dimension while preserving as much information as possible.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">3. Normalization {modelDetails.normalization}</h3>
              <p className="text-sm text-muted-foreground">
                Pixel values are normalized to the range {modelDetails.normalization}. {modelDetails.details}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">4. Tensor Conversion</h3>
              <p className="text-sm text-muted-foreground">
                The image is converted to a tensor with shape [1, {modelDetails.size.split("x")[0]},{" "}
                {modelDetails.size.split("x")[1]}, 3] where:
                <br />- 1 is the batch size
                <br />- {modelDetails.size} is the image dimensions
                <br />- 3 is the number of color channels (RGB)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
