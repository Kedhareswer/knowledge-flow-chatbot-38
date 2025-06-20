
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { classifyImage } from "@/app/actions"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { ModelSelector } from "./model-selector"

export function ImageUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedModel, setSelectedModel] = useState("mobilenet")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    console.log(`Model changed to: ${modelId}`)
  }

  const handleFileChange = async (file: File) => {
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    try {
      setIsClassifying(true)

      // Convert file to data URL for preview and processing
      const imageUrl = await readFileAsDataURL(file)
      setImage(imageUrl)

      toast({
        title: "Image uploaded",
        description: `Classifying with ${selectedModel}...`,
      })

      try {
        // Classify the image
        console.log(`Classifying image with ${selectedModel}...`)
        const result = await classifyImage(imageUrl, selectedModel)

        if (result.error) {
          throw new Error(result.error)
        }

        // Dispatch custom event with classification results
        window.dispatchEvent(
          new CustomEvent("classification-result", {
            detail: {
              ...result,
              originalImage: imageUrl,
            },
          }),
        )

        toast({
          title: "Classification complete!",
          description: `Top result: ${result.results?.[0]?.className || 'Unknown'} (${Math.round((result.results?.[0]?.probability || 0) * 100)}%)`,
        })
      } catch (error) {
        console.error("Error classifying image:", error)
        toast({
          title: "Classification failed",
          description: "Using demo results instead. Check console for details.",
          variant: "destructive",
        })

        // Dispatch fallback event with mock data
        window.dispatchEvent(
          new CustomEvent("classification-result", {
            detail: {
              results: [
                { className: "golden retriever", superclass: "mammals", probability: 0.85 },
                { className: "dog", superclass: "mammals", probability: 0.10 },
                { className: "puppy", superclass: "mammals", probability: 0.03 },
                { className: "animal", superclass: "mammals", probability: 0.01 },
                { className: "pet", superclass: "mammals", probability: 0.01 },
              ],
              preprocessingSteps: {
                original: imageUrl,
                resized: imageUrl,
                normalized: imageUrl,
              },
              originalImage: imageUrl,
              modelId: selectedModel,
              isMock: true,
            },
          }),
        )
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      })
    } finally {
      setIsClassifying(false)
    }
  }

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <ModelSelector onModelChange={handleModelChange} />

      <div className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
        />

        <Card
          className={`border-2 border-dashed ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          } transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent
            className="flex flex-col items-center justify-center p-6 text-center space-y-4 cursor-pointer min-h-[300px]"
            onClick={triggerFileInput}
          >
            {image ? (
              <div className="relative w-full aspect-square max-w-xs mx-auto">
                <Image src={image || "/placeholder.svg"} alt="Uploaded image" fill className="object-contain rounded-lg" />
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Drag and drop your image here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, GIF, WebP up to 10MB</p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={triggerFileInput} disabled={isClassifying} className="w-full max-w-xs">
            {isClassifying ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Classifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {image ? "Upload another image" : "Upload image"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
