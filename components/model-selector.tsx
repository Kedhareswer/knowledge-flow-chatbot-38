"use client"

import { useState } from "react"
import { Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const models = [
  {
    id: "cifar100",
    name: "CIFAR-100",
    description: "Trained on the CIFAR-100 dataset with 100 fine-grained classes",
    categories: 100,
    imageSize: "32x32",
    accuracy: "Medium",
    speed: "Fast",
    size: "Small",
    details:
      "The CIFAR-100 model is trained on a dataset of 60,000 32x32 color images in 100 classes. Each class has 600 images with 500 training and 100 testing images. The 100 classes are grouped into 20 superclasses.",
  },
  {
    id: "mobilenet",
    name: "MobileNet v2",
    description: "Lightweight model designed for mobile and edge devices",
    categories: 1000,
    imageSize: "224x224",
    accuracy: "Medium-High",
    speed: "Very Fast",
    size: "Small",
    details:
      "MobileNet is a lightweight model designed for mobile and edge devices. It uses depthwise separable convolutions to reduce the model size and computation. MobileNet v2 improves upon the original with an inverted residual structure and linear bottlenecks.",
  },
  {
    id: "efficientnet",
    name: "EfficientNet-B0",
    description: "Optimized model with balanced accuracy and efficiency",
    categories: 1000,
    imageSize: "224x224",
    accuracy: "High",
    speed: "Medium",
    size: "Medium",
    details:
      "EfficientNet uses a compound scaling method that uniformly scales network width, depth, and resolution. This results in better accuracy and efficiency compared to other models. EfficientNet-B0 is the baseline model in the EfficientNet family.",
  },
]

export function ModelSelector({ onModelChange }: { onModelChange: (modelId: string) => void }) {
  const [selectedModel, setSelectedModel] = useState("cifar100")
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
        <CardTitle className="text-lg">Select Classification Model</CardTitle>
        <CardDescription>Choose a model for image classification</CardDescription>
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

          <div className="grid grid-cols-2 gap-4">
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
                  <Badge variant="outline">{model.imageSize}</Badge>
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
