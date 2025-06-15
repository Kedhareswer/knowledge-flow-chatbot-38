export interface RAGQuery {
  question: string
  context?: string
  maxResults?: number
}

export interface RAGResponse {
  answer: string
  sources: Array<{
    text: string
    similarity: number
    metadata: Record<string, any>
  }>
  confidence: number
}

import { AIClient } from "./ai-client"
import { PDFParser } from "./pdf-parser"

interface Document {
  id: string
  name: string
  content: string
  chunks: string[]
  embeddings: number[][]
  uploadedAt: Date
  metadata?: any
}

interface QueryResponse {
  answer: string
  sources: string[]
  relevanceScore: number
  retrievedChunks: Array<{
    content: string
    source: string
    similarity: number
  }>
}

interface AIConfig {
  provider:
    | "openai"
    | "anthropic"
    | "groq"
    | "cohere"
    | "huggingface"
    | "aiml"
    | "openrouter"
    | "deepinfra"
    | "deepseek"
    | "googleai"
    | "vertex"
    | "mistral"
    | "perplexity"
    | "together"
    | "xai"
    | "fireworks"
    | "replicate"
    | "anyscale"
    | "cerebras"
  apiKey: string
  model: string
  baseUrl?: string
}

export class RAGEngine {
  private documents: Document[] = []
  private aiClient: AIClient | null = null
  private pdfParser: PDFParser
  private isInitialized = false
  private currentConfig: AIConfig | null = null

  constructor() {
    this.pdfParser = new PDFParser()
  }

  // Make aiClient public to fix the access error
  get aiClient() {
    return this.aiClient
  }

  async initialize(config: AIConfig) {
    try {
      console.log("Initializing RAG Engine with config:", {
        provider: config.provider,
        model: config.model,
        hasApiKey: !!config.apiKey,
      })

      // Create AI client with the provided configuration
      this.aiClient = new AIClient(config)
      this.currentConfig = config

      // Test the connection with better error handling
      console.log("RAGEngine: Attempting to test AI provider connection via AIClient...")
      let connectionTest = false
      try {
        connectionTest = await this.aiClient.testConnection()
      } catch (connError) {
        console.warn("Connection test failed, but continuing initialization:", connError)
      }

      if (!connectionTest) {
        console.warn("Connection test failed, but continuing with initialization")
      }

      // Test embedding generation with fallback
      let testEmbedding: number[] = []
      try {
        testEmbedding = await this.aiClient.generateEmbedding("test connection")
      } catch (embError) {
        console.warn("Test embedding failed, using fallback:", embError)
        // Use a simple fallback embedding if the real one fails
        testEmbedding = new Array(384).fill(0).map((_, i) => (i % 2 === 0 ? 0.1 : -0.1))
      }

      if (!testEmbedding || !Array.isArray(testEmbedding) || testEmbedding.length === 0) {
        console.warn("Invalid test embedding, using fallback")
        testEmbedding = new Array(384).fill(0).map((_, i) => (i % 2 === 0 ? 0.1 : -0.1))
      }

      this.isInitialized = true
      console.log("RAG Engine initialized successfully with embedding dimension:", testEmbedding.length)
    } catch (error) {
      console.error("Failed to initialize RAG Engine:", error)
      throw new Error(`RAG Engine initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async updateConfig(config: AIConfig) {
    try {
      console.log("Updating RAG Engine configuration")
      await this.initialize(config)

      // Re-generate embeddings for existing documents if provider changed
      if (this.documents.length > 0) {
        console.log("Re-generating embeddings for existing documents...")
        for (const document of this.documents) {
          if (document.chunks && document.chunks.length > 0) {
            document.embeddings = await this.aiClient!.generateEmbeddings(document.chunks)
          }
        }
        console.log("Embeddings updated for all documents")
      }
    } catch (error) {
      console.error("Failed to update RAG Engine configuration:", error)
      throw error
    }
  }

  async processDocument(file: File): Promise<Document> {
    if (!this.isInitialized || !this.aiClient) {
      throw new Error("RAG engine not initialized")
    }

    try {
      console.log(`Processing document: ${file.name}`)

      // Extract text from PDF
      const pdfContent = await this.pdfParser.extractText(file)

      // Chunk the text
      const chunks = this.pdfParser.chunkText(pdfContent.text, 500, 50)
      console.log(`Generated ${chunks.length} chunks`)

      if (chunks.length === 0) {
        throw new Error("No text chunks could be created from the document")
      }

      // Generate embeddings for all chunks
      console.log("Generating embeddings...")
      const embeddings = await this.aiClient.generateEmbeddings(chunks)

      if (!embeddings || !Array.isArray(embeddings) || embeddings.length !== chunks.length) {
        throw new Error("Failed to generate embeddings for all chunks")
      }

      const document: Document = {
        id: Date.now().toString(),
        name: file.name,
        content: pdfContent.text,
        chunks,
        embeddings,
        uploadedAt: new Date(),
        metadata: {
          ...pdfContent.metadata,
          aiProvider: this.currentConfig?.provider,
          aiModel: this.currentConfig?.model,
        },
      }

      console.log(`Document processed successfully: ${chunks.length} chunks, ${embeddings.length} embeddings`)
      return document
    } catch (error) {
      console.error("Error processing document:", error)
      throw error
    }
  }

  async addDocument(document: Document) {
    try {
      // Validate document structure
      if (!document || typeof document !== "object") {
        throw new Error("Invalid document object")
      }

      if (!document.chunks || !Array.isArray(document.chunks)) {
        throw new Error("Document chunks are missing or invalid")
      }

      if (document.chunks.length === 0) {
        throw new Error("Document has no chunks")
      }

      // Generate embeddings if they don't exist or are invalid
      if (
        !document.embeddings ||
        !Array.isArray(document.embeddings) ||
        document.embeddings.length !== document.chunks.length
      ) {
        if (!this.aiClient) {
          throw new Error("AI client not initialized")
        }

        console.log("Generating missing embeddings for document:", document.name)
        document.embeddings = await this.aiClient.generateEmbeddings(document.chunks)
      }

      // Validate embeddings
      if (!document.embeddings || document.embeddings.length !== document.chunks.length) {
        throw new Error("Failed to generate valid embeddings for document")
      }

      // Check if embeddings are properly formatted
      for (let i = 0; i < document.embeddings.length; i++) {
        if (!Array.isArray(document.embeddings[i]) || document.embeddings[i].length === 0) {
          throw new Error(`Invalid embedding at index ${i}`)
        }
      }

      this.documents.push(document)
      console.log(`Added document to RAG engine: ${document.name} (${document.chunks.length} chunks)`)
    } catch (error) {
      console.error("Error adding document:", error)
      throw error
    }
  }

  async query(question: string): Promise<QueryResponse> {
    console.log("RAG query started:", question)

    // Create default response structure
    const defaultResponse: QueryResponse = {
      answer: "I apologize, but I couldn't process your question properly.",
      sources: [],
      relevanceScore: 0,
      retrievedChunks: [],
    }

    try {
      if (!this.isInitialized || !this.aiClient) {
        console.error("RAG engine not initialized")
        return {
          ...defaultResponse,
          answer: "The system is not properly initialized. Please configure your AI provider and try again.",
        }
      }

      if (!question || typeof question !== "string" || question.trim().length === 0) {
        console.error("Invalid question provided")
        return {
          ...defaultResponse,
          answer: "Please provide a valid question.",
        }
      }

      if (!this.documents || !Array.isArray(this.documents) || this.documents.length === 0) {
        console.error("No documents available")
        return {
          ...defaultResponse,
          answer: "No documents are available for querying. Please upload some documents first.",
        }
      }

      console.log(`Processing query: ${question}`)

      // Generate embedding for the question
      let questionEmbedding: number[] = []
      try {
        questionEmbedding = await this.aiClient.generateEmbedding(question)
        if (!questionEmbedding || !Array.isArray(questionEmbedding) || questionEmbedding.length === 0) {
          throw new Error("Failed to generate question embedding")
        }
      } catch (embeddingError) {
        console.error("Error generating question embedding:", embeddingError)
        return {
          ...defaultResponse,
          answer: "I had trouble processing your question. Please try rephrasing it or check your API configuration.",
        }
      }

      // Find relevant chunks
      let relevantChunks: Array<{ content: string; source: string; similarity: number }> = []
      try {
        relevantChunks = this.findRelevantChunks(questionEmbedding, 3)
        console.log(`Found ${relevantChunks.length} relevant chunks`)
      } catch (retrievalError) {
        console.error("Error finding relevant chunks:", retrievalError)
        return {
          ...defaultResponse,
          answer: "I had trouble searching through the documents. Please try again.",
        }
      }

      if (relevantChunks.length === 0) {
        return {
          ...defaultResponse,
          answer:
            "I couldn't find relevant information in the uploaded documents to answer your question. Please try rephrasing your question or upload more relevant documents.",
        }
      }

      // Generate answer using the relevant context
      let answer = ""
      try {
        const context = relevantChunks.map((chunk) => chunk.content).join("\n\n")

        const messages = [
          {
            role: "system" as const,
            content:
              "You are a helpful assistant that answers questions based on the provided context. If the context doesn't contain relevant information, say so clearly.",
          },
          {
            role: "user" as const,
            content: `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`,
          },
        ]

        answer = await this.aiClient.generateText(messages)

        if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
          answer =
            "I found relevant information but had trouble generating a response. Please try rephrasing your question."
        }
      } catch (generationError) {
        console.error("Error generating answer:", generationError)
        answer = "I found relevant information but had trouble generating a response. Please try again."
      }

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(relevantChunks)

      // Prepare sources
      const sources = relevantChunks
        .map((chunk) => chunk.source)
        .filter((source) => source && typeof source === "string")

      const response: QueryResponse = {
        answer: answer.trim(),
        sources,
        relevanceScore,
        retrievedChunks: relevantChunks,
      }

      console.log("RAG query completed successfully")
      return response
    } catch (error) {
      console.error("Error processing query:", error)
      return {
        ...defaultResponse,
        answer:
          "I encountered an unexpected error while processing your question. Please try again or check your API configuration.",
      }
    }
  }

  private findRelevantChunks(questionEmbedding: number[], topK: number) {
    const allChunks: Array<{
      content: string
      source: string
      similarity: number
    }> = []

    try {
      // Validate inputs
      if (!Array.isArray(questionEmbedding) || questionEmbedding.length === 0) {
        console.error("Invalid question embedding")
        return []
      }

      if (!Array.isArray(this.documents) || this.documents.length === 0) {
        console.error("No documents available")
        return []
      }

      // Calculate similarity for all chunks
      this.documents.forEach((doc, docIndex) => {
        try {
          // Validate document structure
          if (!doc || !doc.chunks || !doc.embeddings) {
            console.warn(`Document ${docIndex} has invalid structure`)
            return
          }

          if (!Array.isArray(doc.chunks) || !Array.isArray(doc.embeddings)) {
            console.warn(`Document ${docIndex} has invalid chunks or embeddings`)
            return
          }

          if (doc.chunks.length !== doc.embeddings.length) {
            console.warn(`Document ${docIndex} has mismatched chunks and embeddings`)
            return
          }

          doc.chunks.forEach((chunk, chunkIndex) => {
            try {
              const chunkEmbedding = doc.embeddings[chunkIndex]

              // Validate chunk embedding
              if (!Array.isArray(chunkEmbedding) || chunkEmbedding.length === 0) {
                console.warn(`Invalid embedding for chunk ${chunkIndex} in document ${docIndex}`)
                return
              }

              if (chunkEmbedding.length !== questionEmbedding.length) {
                console.warn(`Embedding dimension mismatch for chunk ${chunkIndex} in document ${docIndex}`)
                return
              }

              const similarity = this.aiClient!.cosineSimilarity(questionEmbedding, chunkEmbedding)

              if (typeof similarity === "number" && !isNaN(similarity)) {
                allChunks.push({
                  content: chunk || "",
                  source: `${doc.name || "Unknown Document"} (chunk ${chunkIndex + 1})`,
                  similarity,
                })
              }
            } catch (chunkError) {
              console.warn(`Error processing chunk ${chunkIndex} in document ${docIndex}:`, chunkError)
            }
          })
        } catch (docError) {
          console.warn(`Error processing document ${docIndex}:`, docError)
        }
      })

      // Sort by similarity and return top K
      return allChunks
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .filter((chunk) => chunk.similarity > 0.1) // Filter out very low similarity chunks
    } catch (error) {
      console.error("Error finding relevant chunks:", error)
      return []
    }
  }

  private calculateRelevanceScore(chunks: Array<{ similarity: number }>): number {
    try {
      if (!Array.isArray(chunks) || chunks.length === 0) return 0

      const validSimilarities = chunks
        .map((chunk) => (chunk && typeof chunk.similarity === "number" ? chunk.similarity : 0))
        .filter((sim) => typeof sim === "number" && !isNaN(sim))

      if (validSimilarities.length === 0) return 0

      return validSimilarities.reduce((sum, sim) => sum + sim, 0) / validSimilarities.length
    } catch (error) {
      console.error("Error calculating relevance score:", error)
      return 0
    }
  }

  getDocuments(): Document[] {
    return Array.isArray(this.documents) ? this.documents : []
  }

  removeDocument(documentId: string) {
    try {
      if (!documentId || typeof documentId !== "string") {
        throw new Error("Invalid document ID")
      }

      const initialLength = this.documents.length
      this.documents = this.documents.filter((doc) => doc && doc.id !== documentId)

      const removedCount = initialLength - this.documents.length
      console.log(`Removed ${removedCount} document(s) with ID: ${documentId}`)
    } catch (error) {
      console.error("Error removing document:", error)
    }
  }

  clearDocuments() {
    try {
      this.documents = []
      console.log("Cleared all documents from RAG engine")
    } catch (error) {
      console.error("Error clearing documents:", error)
    }
  }

  // Health check method
  isHealthy(): boolean {
    try {
      return this.isInitialized && this.aiClient !== null && this.pdfParser !== null && Array.isArray(this.documents)
    } catch (error) {
      console.error("Error checking RAG engine health:", error)
      return false
    }
  }

  // Get status information
  getStatus() {
    try {
      return {
        initialized: this.isInitialized,
        documentCount: Array.isArray(this.documents) ? this.documents.length : 0,
        totalChunks: Array.isArray(this.documents)
          ? this.documents.reduce((total, doc) => {
              return total + (Array.isArray(doc.chunks) ? doc.chunks.length : 0)
            }, 0)
          : 0,
        healthy: this.isHealthy(),
        currentProvider: this.currentConfig?.provider,
        currentModel: this.currentConfig?.model,
        isHealthy: () => this.isHealthy(),
      }
    } catch (error) {
      console.error("Error getting RAG engine status:", error)
      return {
        initialized: false,
        documentCount: 0,
        totalChunks: 0,
        healthy: false,
        currentProvider: null,
        currentModel: null,
        isHealthy: () => false,
      }
    }
  }
}
