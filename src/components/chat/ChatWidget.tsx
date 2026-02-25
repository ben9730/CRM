'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { ChatMessage } from './ChatMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeminiHistory = any[]

const MAX_MESSAGES = 20

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [geminiHistory, setGeminiHistory] = useState<GeminiHistory>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load session when widget is opened (only once)
  useEffect(() => {
    if (!isOpen || sessionId) return
    async function loadSession() {
      setIsLoadingSession(true)
      try {
        const res = await fetch('/api/chat/session')
        if (!res.ok) { setIsLoadingSession(false); return }
        const data = await res.json()
        setSessionId(data.sessionId)
        if (data.messages?.length > 0) {
          setMessages(
            data.messages.map((m: { role: string; content: string }) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }))
          )
        }
      } catch { /* silently continue */ }
      setIsLoadingSession(false)
    }
    loadSession()
  }, [isOpen, sessionId])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    setMessages(prev => {
      const updated = [...prev, userMessage]
      return updated.slice(-MAX_MESSAGES)
    })
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: geminiHistory, sessionId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages(prev => {
        const updated = [...prev, assistantMessage]
        return updated.slice(-MAX_MESSAGES)
      })
      if (data.history) {
        setGeminiHistory(data.history)
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Something went wrong'
      setMessages(prev => {
        const updated = [...prev, { role: 'assistant' as const, content: `Error: ${errorText}` }]
        return updated.slice(-MAX_MESSAGES)
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Panel — hidden on mobile (below md:768px) */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 hidden md:flex w-[350px] flex-col rounded-2xl border border-border/50 bg-[#0f0f0f] shadow-2xl shadow-primary/5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/20">
                <MessageCircle className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">CRM Assistant</p>
                <p className="text-[11px] text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-[400px] flex-col gap-3 overflow-y-auto px-3 py-3">
            {isLoadingSession ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                      <MessageCircle className="size-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ask me about your tasks, deals, contacts, or pipeline
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                      {['Show urgent tasks', 'Pipeline status', 'Recent activity'].map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setInput(suggestion)
                              inputRef.current?.focus()
                            }}
                            className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {suggestion}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-xs">Thinking...</span>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/50 p-3">
            <div className="flex items-end gap-2 rounded-xl bg-muted/30 px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="max-h-24 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || isLoadingSession || !sessionId}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button — hidden on mobile (below md:768px) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 hidden md:flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
      >
        {isOpen ? (
          <X className="size-5" />
        ) : (
          <MessageCircle className="size-5" />
        )}
      </button>
    </>
  )
}
