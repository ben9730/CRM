'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2, Send } from 'lucide-react'
import { PortalMessage } from './PortalMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeminiHistory = any[]

const MAX_MESSAGES = 50

export function PortalChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [geminiHistory, setGeminiHistory] = useState<GeminiHistory>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = 20
    const maxHeight = lineHeight * 4
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

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
        body: JSON.stringify({ message: trimmed, history: geminiHistory }),
      })

      const data = await res.json()

      if (data.rateLimited) {
        const friendlyMessage =
          data.friendlyMessage ?? "I'm taking a breather — try again in a minute"
        setMessages(prev => {
          const updated = [...prev, { role: 'assistant' as const, content: friendlyMessage }]
          return updated.slice(-MAX_MESSAGES)
        })
        return
      }

      if (!res.ok) {
        setMessages(prev => {
          const updated = [
            ...prev,
            { role: 'assistant' as const, content: 'Something went wrong. Please try again.' },
          ]
          return updated.slice(-MAX_MESSAGES)
        })
        return
      }

      setMessages(prev => {
        const updated = [...prev, { role: 'assistant' as const, content: data.response }]
        return updated.slice(-MAX_MESSAGES)
      })
      if (data.history) {
        setGeminiHistory(data.history)
      }
    } catch {
      setMessages(prev => {
        const updated = [
          ...prev,
          { role: 'assistant' as const, content: 'Something went wrong. Please try again.' },
        ]
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
    <div className="h-dvh flex flex-col bg-background">
      {/* Back navigation */}
      <Link
        href="/dashboard"
        className="absolute top-4 left-4 z-10 flex items-center justify-center rounded-lg p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
        aria-label="Back to dashboard"
      >
        <ChevronLeft className="size-5" />
      </Link>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl w-full px-4 py-4 pt-14">
          {messages.map((msg, i) => (
            <PortalMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isLoading && (
            <div className="mb-3 flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted/50 px-4 py-2.5 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div
        className="border-t border-border/50 px-3 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="mx-auto max-w-2xl w-full">
          <div className="flex items-end gap-2 rounded-xl bg-muted/30 px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              style={{ maxHeight: '80px', overflowY: 'auto' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
