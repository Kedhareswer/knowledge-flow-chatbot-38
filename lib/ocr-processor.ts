
export interface OCRResult {
  text: string
  confidence: number
  pages: number
}

export class OCRProcessor {
  async processDocument(file: File): Promise<OCRResult> {
    // Fallback OCR implementation
    return {
      text: `OCR processed content from ${file.name}`,
      confidence: 0.5,
      pages: 1
    }
  }
}
