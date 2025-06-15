
import { AIClient } from "./ai-client"
import type { AIConfig, Document, SearchResult } from "./store"

export interface RAGResult {
  answer: string
  sources: string[]
  relevanceScore: number
  retrievedChunks: any[]
}

export class RAGEngine {
  private aiClient: AIClient | null = null
  private documents: Document[] = []
  private initialized = false

  constructor() {
    console.log("RAG Engine initialized")
  }

  async initialize(config: AIConfig): Promise<void> {
    try {
      this.aiClient = new AIClient(config)
      await this.aiClient.initialize()
      this.initialized = true
      console.log("RAG Engine successfully initialized")
    } catch (error) {
      console.error("Failed to initialize RAG Engine:", error)
      this.initialized = false
      throw error
    }
  }

  async updateConfig(config: AIConfig): Promise<void> {
    await this.initialize(config)
  }

  async addDocument(document: Document): Promise<void> {
    this.documents.push(document)
    console.log(`Added document: ${document.name}`)
  }

  removeDocument(documentId: string): void {
    this.documents = this.documents.filter(doc => doc.id !== documentId)
    console.log(`Removed document: ${documentId}`)
  }

  clearDocuments(): void {
    this.documents = []
    console.log("Cleared all documents")
  }

  async query(question: string): Promise<RAGResult> {
    if (!this.initialized || !this.aiClient) {
      throw new Error("RAG Engine not initialized")
    }

    if (this.documents.length === 0) {
      throw new Error("No documents available for querying")
    }

    try {
      // Simple implementation - use first document's content
      const context = this.documents[0].content.substring(0, 2000)
      
      const response = await this.aiClient.generateText(question, context)
      
      return {
        answer: response,
        sources: [this.documents[0].name],
        relevanceScore: 0.8,
        retrievedChunks: []
      }
    } catch (error) {
      console.error("Query failed:", error)
      throw error
    }
  }

  getStatus() {
    return {
      initialized: this.initialized,
      documentsCount: this.documents.length,
      hasAIClient: !!this.aiClient,
      isHealthy: () => this.initialized && !!this.aiClient
    }
  }

  // Make aiClient accessible for embedding generation
  get client() {
    return this.aiClient
  }
}
