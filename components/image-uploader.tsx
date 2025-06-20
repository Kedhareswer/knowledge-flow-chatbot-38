
"use client"

import { useState, useRef } from "react"
import { Upload, ImageIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { classifyImage } from "../app/actions"
import Image from "next/image"
import { useToast } from "../hooks/use-toast"
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
  }

  const handleFileChange = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      })
      return
    }

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
      const imageUrl = await readFileAsDataURL(file)
      setImage(imageUrl)

      const result = await classifyImage(imageUrl, selectedModel)

      if (result.error) {
        throw new Error(result.error)
      }

      window.dispatchEvent(
        new CustomEvent("classification-result", {
          detail: {
            ...result,
            originalImage: imageUrl,
          },
        })
      )

      toast({
        title: "Classification complete!",
        description: `Top result: ${result.results?.[0]?.className || 'Unknown'}`,
      })
    } catch (error) {
      console.error("Classification error:", error)
      
      // Fallback mock data
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
              original: image,
              resized: image,
              normalized: image,
            },
            originalImage: image,
            modelId: selectedModel,
            isMock: true,
          },
        })
      )

      toast({
        title: "Using demo mode",
        description: "Real model failed, showing example results",
        variant: "destructive",
      })
    } finally {
      setIsClassifying(false)
    }
  }

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
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <ModelSelector onModelChange={handleModelChange} />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
      />

      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[300px]">
          {image ? (
            <div className="relative w-full aspect-square max-w-xs mx-auto">
              <Image 
                src={image} 
                alt="Uploaded image" 
                fill 
                className="object-contain rounded-lg" 
              />
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Drop your image here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP up to 10MB</p>
            </>
          )}
        </CardContent>
      </Card>

      <Button 
        onClick={triggerFileInput} 
        disabled={isClassifying} 
        className="w-full"
        size="lg"
      >
        {isClassifying ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Classifying with {selectedModel}...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {image ? "Upload another image" : "Upload image"}
          </span>
        )}
      </Button>
    </div>
  )
}
