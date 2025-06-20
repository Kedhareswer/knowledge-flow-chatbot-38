
import { ImageUploader } from "../components/image-uploader"
import { ResultsDisplay } from "../components/results-display"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            AI Image Classifier
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload any image and let our AI models identify what's in it. 
            Supports 1000+ categories including animals, objects, food, and more.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <ImageUploader />
          </div>

          <div className="space-y-6">
            <ResultsDisplay />
          </div>
        </div>

        <footer className="text-center py-8 text-gray-500">
          <p>Powered by TensorFlow.js and pre-trained neural networks</p>
        </footer>
      </div>
    </main>
  )
}
