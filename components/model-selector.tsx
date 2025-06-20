"use client"

import { useState } from "react"
import { Check, Info } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "./ui/badge"

const models = [
  {
    id: "mobilenet",
    name: "MobileNet v1",
    description: "Lightweight model optimized for mobile and web deployment",
    categories: 1000,
    imageSize: "224x224",
    accuracy: "Medium-High",
    speed: "Very Fast",
    size: "Small (~4MB)",
    details:
      "MobileNet v1 uses depthwise separable convolutions to dramatically reduce computation and model size. It's specifically designed for mobile and embedded vision applications with limited computational resources while maintaining reasonable accuracy.",
  },
  {
    id: "efficientnet",
    name: "EfficientNet Lite",
    description: "Balanced model with optimized accuracy and efficiency",
    categories: 1000,
    imageSize: "224x224",
    accuracy: "High",
    speed: "Fast",
    size: "Medium (~10MB)",
    details:
      "EfficientNet uses compound scaling to uniformly scale network width, depth, and resolution. The Lite version is optimized for edge devices while maintaining high accuracy on ImageNet classification tasks.",
  },
  {
    id: "resnet",
    name: "ResNet Mobile",
    description: "Deep residual network adapted for web deployment",
    categories: 1000,
    imageSize: "224x224",
    accuracy: "High",
    speed: "Medium",
    size: "Medium (~9MB)",
    details:
      "ResNet uses residual connections to enable training of very deep networks. This mobile version is optimized for web deployment while retaining the powerful feature extraction capabilities of the ResNet architecture.",
  },
]

export function ModelSelector({ onModelChange }: { onModelChange: (modelId: string) => void }) {
  const [selectedModel, setSelectedModel] = useState("mobilenet")
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogModel, setDialogModel] = useState(models[0])

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    onModelChange(value)
  }

  const handleInfoClick = (model: (typeof models)[0]) => {
    setDialogModel(model)
    setOpenDialog(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select AI Model</CardTitle>
        <CardDescription>Choose a pre-trained model for image classification</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    {model.name}
                    {model.id === selectedModel && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <Card
                key={model.id}
                className={`cursor-pointer transition-all ${
                  model.id === selectedModel ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => handleModelChange(model.id)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInfoClick(model)
                            }}
                          >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Model Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View model details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                  <Badge variant="outline">{model.categories} classes</Badge>
                  <Badge variant="outline">{model.size}</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogModel.name}</DialogTitle>
            <DialogDescription>Model specifications and details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Categories</p>
                <p className="text-sm text-muted-foreground">{dialogModel.categories}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Input Size</p>
                <p className="text-sm text-muted-foreground">{dialogModel.imageSize}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Accuracy</p>
                <p className="text-sm text-muted-foreground">{dialogModel.accuracy}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Speed</p>
                <p className="text-sm text-muted-foreground">{dialogModel.speed}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Details</p>
              <p className="text-sm text-muted-foreground">{dialogModel.details}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
