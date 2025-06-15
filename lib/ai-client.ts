import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

export type AIProvider = "openai" | "huggingface" | "anthropic"

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
}

export interface TextGenerationParams {
  model?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export class AIClient {
  private config: AIConfig
  private openai?: OpenAI
  private anthropic?: Anthropic

  constructor(config: AIConfig) {
    this.config = config
    console.log("AI Client initialized with config:", config)
  }

  private handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`AI Client Error (${context}):`, errorMessage)
    throw new Error(`${context}: ${errorMessage}`)
  }

  async initialize(): Promise<void> {
    try {
      if (this.config.provider === "openai") {
        this.openai = new OpenAI({ apiKey: this.config.apiKey })
        console.log("OpenAI client initialized")
      } else if (this.config.provider === "anthropic") {
        this.anthropic = new Anthropic({ apiKey: this.config.apiKey })
        console.log("Anthropic client initialized")
      } else {
        console.log("Using Hugging Face API (no explicit initialization)")
      }
    } catch (error) {
      this.handleError(error, "Failed to initialize AI client")
    }
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("API key is required")
    }

    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt is required")
    }

    try {
      switch (this.config.provider) {
        case "openai":
          return await this.generateTextOpenAI(prompt, context)
        case "huggingface":
          return await this.generateTextHuggingFace(prompt, context)
        case "anthropic":
          return await this.generateTextAnthropic(prompt, context)
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`)
      }
    } catch (error) {
      this.handleError(error, "Text generation failed")
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error("API key is required")
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Text is required")
    }

    try {
      switch (this.config.provider) {
        case "openai":
          return await this.generateEmbeddingOpenAI(text)
        case "huggingface":
          return await this.generateEmbeddingHuggingFace(text)
        case "anthropic":
          throw new Error("Embedding generation is not supported for Anthropic")
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`)
      }
    } catch (error) {
      this.handleError(error, "Embedding generation failed")
    }
  }

  private validateArray(arr: unknown): number[] {
    if (!Array.isArray(arr)) {
      throw new Error("Response is not an array")
    }
    
    const numbers = arr.filter((val: unknown): val is number => typeof val === "number" && !isNaN(val))
    
    if (numbers.length === 0) {
      throw new Error("No valid numbers found in response")
    }
    
    return numbers
  }

  private async generateTextHuggingFace(prompt: string, context?: string): Promise<string> {
    try {
      const textModel = this.config.model || "HuggingFaceH4/zephyr-7b-beta"
      const url = "/api/huggingface/text"

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, context, model: textModel, apiKey: this.config.apiKey }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Hugging Face API error: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to generate text")
      }

      return data.text.trim()
    } catch (error) {
      this.handleError(error, "Hugging Face text generation failed")
    }
  }

  private async generateEmbeddingHuggingFace(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.config.model || "sentence-transformers/all-MiniLM-L6-v2"
      const url = "/api/huggingface/embedding"

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, model: embeddingModel, apiKey: this.config.apiKey }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Hugging Face API error: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to generate embedding")
      }

      return this.validateArray(data.embedding)
    } catch (error) {
      this.handleError(error, "Hugging Face embedding generation failed")
    }
  }

  private async generateTextOpenAI(prompt: string, context?: string): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized")
    }

    try {
      const completion = await this.openai.completions.create({
        model: "text-davinci-003",
        prompt: context ? `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer:` : prompt,
        max_tokens: 200,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      })

      if (!completion.choices || completion.choices.length === 0) {
        throw new Error("No completion choices returned")
      }

      const text = completion.choices[0].text?.trim()
      if (!text) {
        throw new Error("No text generated")
      }

      return text
    } catch (error) {
      this.handleError(error, "OpenAI text generation failed")
    }
  }

  private async generateEmbeddingOpenAI(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized")
    }

    try {
      const embedding = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      })

      if (!embedding.data || embedding.data.length === 0) {
        throw new Error("No embedding data returned")
      }

      const embeddingArray = embedding.data[0].embedding
      if (!embeddingArray || embeddingArray.length === 0) {
        throw new Error("No embedding generated")
      }

      return this.validateArray(embeddingArray)
    } catch (error) {
      this.handleError(error, "OpenAI embedding generation failed")
    }
  }

  private async generateTextAnthropic(prompt: string, context?: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error("Anthropic client not initialized")
    }

    try {
      const anthropicModel = this.config.model || "claude-2"
      const messages = [{ role: "user", content: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt }]

      const claudeResponse = await this.anthropic.messages.create({
        model: anthropicModel,
        max_tokens: 200,
        messages: messages,
      })

      if (!claudeResponse.content || claudeResponse.content.length === 0) {
        throw new Error("No content returned from Anthropic")
      }

      const text = claudeResponse.content[0].text
      if (!text) {
        throw new Error("No text generated")
      }

      return text
    } catch (error) {
      this.handleError(error, "Anthropic text generation failed")
    }
  }
}
