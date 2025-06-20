"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { PreprocessingSteps as PreprocessingStepsComponent } from "./preprocessing-steps"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

type ClassificationResult = {
  className: string
  probability: number
  superclass: string
}

type PreprocessingSteps = {
  original: string
  resized: string
  normalized: string
}

const modelNames = {
  cifar100: "CIFAR-100",
  mobilenet: "MobileNet v2",
  efficientnet: "EfficientNet-B0",
}

export function ResultsDisplay() {
  const [results, setResults] = useState<ClassificationResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [preprocessingSteps, setPreprocessingSteps] = useState<PreprocessingSteps | null>(null)
  const [modelId, setModelId] = useState<string>("cifar100")
  const [isMock, setIsMock] = useState<boolean>(false)

  useEffect(() => {
    const handleClassificationResult = (event: Event) => {
      const customEvent = event as CustomEvent

      if (customEvent.detail.error) {
        setError(customEvent.detail.error)
        setResults(null)
        setPreprocessingSteps(null)
        setIsMock(false)
        if (customEvent.detail.modelId) {
          setModelId(customEvent.detail.modelId)
        }
      } else {
        setResults(customEvent.detail.results)
        setOriginalImage(customEvent.detail.originalImage)
        setPreprocessingSteps(customEvent.detail.preprocessingSteps)
        setModelId(customEvent.detail.modelId || "cifar100")
        setIsMock(customEvent.detail.isMock || false)
        setError(null)
      }
    }

    window.addEventListener("classification-result", handleClassificationResult)

    return () => {
      window.removeEventListener("classification-result", handleClassificationResult)
    }
  }, [])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Upload an image to see classification results</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Classification Results</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{modelNames[modelId as keyof typeof modelNames] || modelId}</Badge>

              {isMock && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Demo Mode
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Using simulated results. In a production environment, this would use actual model predictions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Top Prediction</h3>
                <span className="text-sm text-muted-foreground">Confidence</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold">{results[0].className}</p>
                  <p className="text-sm text-muted-foreground">Superclass: {results[0].superclass}</p>
                </div>
                <span className="text-lg font-semibold">{Math.round(results[0].probability * 100)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Other Possibilities</h3>
          <div className="space-y-3">
            {results.slice(1, 5).map((result, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{result.className}</span>
                  <span>{Math.round(result.probability * 100)}%</span>
                </div>
                <Progress value={result.probability * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preprocessing Steps Visualization */}
      <PreprocessingStepsComponent originalImage={originalImage} preprocessingSteps={preprocessingSteps} />

      {isMock && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Mode Active</AlertTitle>
          <AlertDescription>
            This is running in demonstration mode with simulated results. In a production environment, this application
            would load actual TensorFlow.js models and provide real predictions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
