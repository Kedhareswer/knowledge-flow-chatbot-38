"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  Loader2,
  FileText,
  Brain,
  Clock,
  Target,
  Sparkles,
  MessageSquare,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: string[]
  metadata?: {
    responseTime?: number
    relevanceScore?: number
    retrievedChunks?: number
  }
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isProcessing: boolean
  disabled: boolean
}

const SUGGESTED_QUESTIONS = [
  "What are the main topics covered in the documents?",
  "Can you summarize the key findings?",
  "What are the most important conclusions?",
  "How do the documents relate to each other?",
]

export function ChatInterface({ messages, onSendMessage, isProcessing, disabled }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing && !disabled) {
      onSendMessage(input.trim())
      setInput("")
      setIsExpanded(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    if (!isProcessing && !disabled) {
      onSendMessage(question)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Skip to content link for accessibility */}
      <a href="#chat-messages" className="skip-to-content">
        Skip to chat messages
      </a>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 sm:px-6 lg:px-8" ref={scrollAreaRef}>
        <div id="chat-messages" className="max-w-4xl mx-auto py-6 space-content-lg">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-8 max-w-2xl px-4">
                <div className="w-24 h-24 border-4 border-black mx-auto flex items-center justify-center bg-gray-50 card-enhanced">
                  <Brain className="w-12 h-12" />
                </div>

                <div className="space-y-4">
                  <h1 className="text-hierarchy-1">QUANTUM PDF READY</h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {disabled
                      ? "Upload PDF documents and configure your AI provider to start chatting"
                      : "Ask questions about your uploaded documents"}
                  </p>
                </div>

                {!disabled && (
                  <div className="space-y-6">
                    <h2 className="text-hierarchy-3 text-gray-800">SUGGESTED QUESTIONS:</h2>
                    <div className="grid gap-3 max-w-xl mx-auto">
                      {SUGGESTED_QUESTIONS.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="p-4 text-left border-2 border-gray-300 hover:border-black hover:bg-gray-50 transition-all duration-200 text-sm group btn-enhanced"
                          disabled={isProcessing}
                          aria-label={`Ask: ${question}`}
                        >
                          <div className="flex items-start space-x-3">
                            <Sparkles className="w-4 h-4 mt-0.5 text-gray-500 group-hover:text-black transition-colors" />
                            <span className="leading-relaxed">{question}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-sm text-gray-500">
                  <div className="text-center space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto" />
                    <p className="font-medium">Multi-document chat</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Brain className="w-8 h-8 mx-auto" />
                    <p className="font-medium">AI-powered analysis</p>
                  </div>
                  <div className="text-center space-y-2">
                    <FileText className="w-8 h-8 mx-auto" />
                    <p className="font-medium">Source citations</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message) => (
                <div key={message.id} className="space-y-4" role="article" aria-label={`${message.role} message`}>
                  {/* Message Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="outline"
                        className={`border-2 font-bold px-3 py-1 ${
                          message.role === "user" ? "border-black bg-black text-white" : "border-gray-400 text-gray-700"
                        }`}
                      >
                        {message.role === "user" ? "USER" : "ASSISTANT"}
                      </Badge>
                      <time className="text-sm text-gray-500 font-mono" dateTime={message.timestamp.toISOString()}>
                        {formatTimestamp(message.timestamp)}
                      </time>
                    </div>

                    {message.metadata && (
                      <div className="flex items-center space-x-3">
                        {message.metadata.responseTime && (
                          <Badge variant="outline" className="text-xs border-gray-300">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatResponseTime(message.metadata.responseTime)}
                          </Badge>
                        )}
                        {message.metadata.relevanceScore && (
                          <Badge variant="outline" className="text-xs border-gray-300">
                            <Target className="w-3 h-3 mr-1" />
                            {(message.metadata.relevanceScore * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`message-bubble ${message.role === "user" ? "message-bubble-user" : "message-bubble-assistant"} group`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 whitespace-pre-wrap leading-relaxed text-base">{message.content}</div>

                      {/* Message Actions */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(message.content)}
                          className={`h-8 w-8 p-0 ${message.role === "user" ? "text-white hover:bg-white/20" : "text-gray-600 hover:bg-gray-100"}`}
                          aria-label="Copy message"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {message.role === "assistant" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
                              aria-label="Thumbs up"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
                              aria-label="Thumbs down"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {message.sources && message.sources.length > 0 && (
                      <Card className="mt-6 border border-gray-200 bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-bold text-gray-700">SOURCES ({message.sources.length})</span>
                          </div>
                          <div className="space-y-3">
                            {message.sources.map((source, index) => (
                              <div
                                key={index}
                                className="text-sm bg-white p-3 border border-gray-200 font-mono rounded-sm"
                              >
                                <span className="text-gray-600 font-bold">#{index + 1}</span> {source}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="space-y-4" role="status" aria-live="polite" aria-label="AI is processing your request">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="border-gray-400 text-gray-700 font-bold px-3 py-1">
                      ASSISTANT
                    </Badge>
                    <time className="text-sm text-gray-500 font-mono">{formatTimestamp(new Date())}</time>
                  </div>
                  <div className="message-bubble message-bubble-assistant">
                    <div className="flex items-center space-x-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-base">Analyzing documents and generating response...</span>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <span>Searching relevant content</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <span>Generating embeddings</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                        <span>Processing with AI model</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t-2 border-black bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-4 form-enhanced">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="chat-input" className="sr-only">
                  Ask a question about your documents
                </label>
                <Textarea
                  id="chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    disabled
                      ? "Configure AI provider and upload documents to start chatting..."
                      : "Ask a question about your documents... (Shift+Enter for new line)"
                  }
                  disabled={disabled || isProcessing}
                  className="min-h-[3rem] max-h-[7.5rem] resize-none border-2 border-black focus:ring-0 focus:border-black font-mono text-base leading-relaxed"
                  rows={1}
                />
              </div>
              <Button
                type="submit"
                disabled={disabled || isProcessing || !input.trim()}
                className="border-2 border-black bg-black text-white hover:bg-white hover:text-black px-6 h-12 btn-enhanced self-end"
                aria-label="Send message"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>

            {!disabled && (
              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>
                  <span className="font-bold">TIP:</span> Ask specific questions about your documents for better results
                </p>
                <p className="text-xs">
                  Use <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Shift+Enter</kbd>{" "}
                  for new lines
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
