'use client'

import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        }`}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 text-foreground'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
      </div>
    </div>
  )
}
