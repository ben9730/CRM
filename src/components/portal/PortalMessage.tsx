'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface PortalMessageProps {
  role: 'user' | 'assistant'
  content: string
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  h1: ({ children }) => (
    <h1 className="mb-2 text-base font-bold">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1.5 text-sm font-bold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 text-sm font-semibold">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ className, children }) => {
    const isBlock = !!className
    if (isBlock) {
      return (
        <code className="block rounded-md bg-muted/60 p-3 font-mono text-xs overflow-x-auto">
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-md">{children}</pre>
  ),
}

export function PortalMessage({ role, content }: PortalMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted/50 text-foreground rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p>{content}</p>
        ) : (
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </Markdown>
        )}
      </div>
    </div>
  )
}
