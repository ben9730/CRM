'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2, Send } from 'lucide-react'
import { PortalMessage } from './PortalMessage'
import type { PendingAction } from './ConfirmationCard'

interface Message {
  role: 'user' | 'assistant'
  content: string
  pendingAction?: PendingAction
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeminiHistory = any[]

const MAX_MESSAGES = 50

export function PortalChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [geminiHistory, setGeminiHistory] = useState<GeminiHistory>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
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

  // Load or create session on mount
  useEffect(() => {
    async function loadOrCreateSession() {
      try {
        const res = await fetch('/api/chat/session')
        if (!res.ok) {
          setIsLoadingSession(false)
          return
        }
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
      } catch {
        // silently continue with empty session
      }
      setIsLoadingSession(false)
    }
    loadOrCreateSession()
  }, [])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || !sessionId || pendingAction) return

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

      if (data.rateLimited) {
        const friendlyMessage =
          data.friendlyMessage ?? "I'm taking a breather — try again in a minute"
        setMessages(prev => {
          const updated = [...prev, { role: 'assistant' as const, content: friendlyMessage }]
          return updated.slice(-MAX_MESSAGES)
        })
        return
      }

      if (data.pendingAction) {
        if (data.history) {
          setGeminiHistory(data.history)
        }
        setPendingAction(data.pendingAction)
        // Add a pending message that will render as ConfirmationCard
        setMessages(prev => {
          const updated = [
            ...prev,
            {
              role: 'assistant' as const,
              content: '__pending__',
              pendingAction: data.pendingAction,
            },
          ]
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

  const handleConfirm = async () => {
    if (!pendingAction) return
    setIsConfirming(true)

    try {
      const res = await fetch('/api/chat/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: pendingAction.tool,
          args: pendingAction.args,
          sessionId: pendingAction.sessionId ?? sessionId,
          history: geminiHistory,
        }),
      })

      const data = await res.json()

      if (data.rateLimited) {
        // Replace pending message with rate limit message
        setMessages(prev => {
          const withoutPending = prev.filter(m => m.content !== '__pending__')
          return [
            ...withoutPending,
            {
              role: 'assistant' as const,
              content: data.friendlyMessage ?? "I'm taking a breather — try again in a minute",
            },
          ]
        })
      } else if (data.response) {
        // Replace pending message with confirmation response
        setMessages(prev => {
          const withoutPending = prev.filter(m => m.content !== '__pending__')
          return [...withoutPending, { role: 'assistant' as const, content: data.response }].slice(
            -MAX_MESSAGES
          )
        })
        if (data.history) {
          setGeminiHistory(data.history)
        }
      } else {
        // Error — replace with error message
        setMessages(prev => {
          const withoutPending = prev.filter(m => m.content !== '__pending__')
          return [
            ...withoutPending,
            { role: 'assistant' as const, content: 'Something went wrong confirming the action.' },
          ]
        })
      }
    } catch {
      setMessages(prev => {
        const withoutPending = prev.filter(m => m.content !== '__pending__')
        return [
          ...withoutPending,
          { role: 'assistant' as const, content: 'Something went wrong. Please try again.' },
        ]
      })
    } finally {
      setPendingAction(null)
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    // Replace pending message with cancelled text
    setMessages(prev => {
      const withoutPending = prev.filter(m => m.content !== '__pending__')
      return [...withoutPending, { role: 'assistant' as const, content: 'Action cancelled.' }]
    })
    setPendingAction(null)
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
          {isLoadingSession ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            messages.map((msg, i) => (
              <PortalMessage
                key={i}
                role={msg.role}
                content={msg.content}
                pendingAction={msg.pendingAction}
                onConfirm={msg.content === '__pending__' ? handleConfirm : undefined}
                onCancel={msg.content === '__pending__' ? handleCancel : undefined}
                isConfirming={isConfirming}
              />
            ))
          )}
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
        className={`border-t border-border/50 px-3 py-3 transition-opacity ${pendingAction ? 'opacity-50' : ''}`}
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
              disabled={!!pendingAction}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
              style={{ maxHeight: '80px', overflowY: 'auto' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isLoadingSession || !sessionId || !!pendingAction}
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
