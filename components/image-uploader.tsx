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
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedModel, setSelectedModel] = useState("cifar100")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
  }

  const handleFileChange = async (file: File) => {
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Convert file to data URL for preview and processing
      const imageUrl = await readFileAsDataURL(file)
      setImage(imageUrl)

      try {
        // Classify the image
        const result = await classifyImage(imageUrl, selectedModel)

        // Dispatch custom event with classification results
        window.dispatchEvent(
          new CustomEvent("classification-result", {
            detail: {
              ...result,
              originalImage: imageUrl,
            },
          }),
        )
      } catch (error) {
        console.error("Error classifying image:", error)
        toast({
          title: "Classification failed",
          description: "There was an error classifying your image. Using demo mode instead.",
          variant: "destructive",
        })

        // Dispatch a fallback event with mock data
        window.dispatchEvent(
          new CustomEvent("classification-result", {
            detail: {
              results: [
                { className: "dog", superclass: "mammals", probability: 0.85 },
                { className: "wolf", superclass: "mammals", probability: 0.1 },
                { className: "fox", superclass: "mammals", probability: 0.03 },
                { className: "cat", superclass: "mammals", probability: 0.01 },
                { className: "tiger", superclass: "mammals", probability: 0.01 },
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
      setIsUploading(false)
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
            className="flex flex-col items-center justify-center p-6 text-center space-y-4 cursor-pointer"
            onClick={triggerFileInput}
          >
            {image ? (
              <div className="relative w-full aspect-square max-w-xs mx-auto">
                <Image src={image || "/placeholder.svg"} alt="Uploaded image" fill className="object-contain" />
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
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, GIF up to 5MB</p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={triggerFileInput} disabled={isUploading} className="w-full max-w-xs">
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Processing...
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
