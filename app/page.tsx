
import { ImageUploader } from "../components/image-uploader"
import { ResultsDisplay } from "../components/results-display"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Image Classification App</h1>
          <p className="text-muted-foreground">Upload an image to classify it using different pre-trained models</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Model & Upload</h2>
            <ImageUploader />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <ResultsDisplay />
          </div>
        </div>
      </div>
    </main>
  )
}
