'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

const PREDEFINED_TAGS = [
  'decision-maker',
  'champion',
  'c-suite',
  'clinical',
  'technical',
  'finance',
  'procurement',
  'operations',
  'strategy',
  'influencer',
  'end-user',
  'budget-holder',
  'it',
  'it-decision-maker',
]

// Tag color variants consistent with the rest of the app
const TAG_VARIANTS: Record<string, string> = {
  'decision-maker': 'border-violet-500/30 text-violet-400 bg-violet-500/8',
  champion: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/8',
  'c-suite': 'border-amber-500/30 text-amber-400 bg-amber-500/8',
  clinical: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/8',
  technical: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/8',
  finance: 'border-blue-500/30 text-blue-400 bg-blue-500/8',
  procurement: 'border-orange-500/30 text-orange-400 bg-orange-500/8',
  operations: 'border-teal-500/30 text-teal-400 bg-teal-500/8',
  strategy: 'border-purple-500/30 text-purple-400 bg-purple-500/8',
  influencer: 'border-pink-500/30 text-pink-400 bg-pink-500/8',
  'end-user': 'border-slate-500/30 text-slate-400 bg-slate-500/8',
  'budget-holder': 'border-yellow-500/30 text-yellow-400 bg-yellow-500/8',
  'it-decision-maker': 'border-blue-500/30 text-blue-400 bg-blue-500/8',
  it: 'border-sky-500/30 text-sky-400 bg-sky-500/8',
}

function getTagClass(tag: string): string {
  return TAG_VARIANTS[tag] ?? 'border-white/10 text-muted-foreground bg-white/4'
}

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder = 'Add tags...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = PREDEFINED_TAGS.filter(
    (tag) =>
      !value.includes(tag) &&
      (inputValue === '' || tag.toLowerCase().includes(inputValue.toLowerCase()))
  )

  const showAddOption =
    inputValue.trim() !== '' &&
    !PREDEFINED_TAGS.includes(inputValue.trim().toLowerCase()) &&
    !value.includes(inputValue.trim().toLowerCase())

  const addTag = useCallback(
    (tag: string) => {
      const normalized = tag.trim().toLowerCase()
      if (normalized && !value.includes(normalized)) {
        onChange([...value, normalized])
      }
      setInputValue('')
      setOpen(false)
      inputRef.current?.focus()
    },
    [value, onChange]
  )

  const removeTag = useCallback(
    (tag: string) => {
      onChange(value.filter((t) => t !== tag))
    },
    [value, onChange]
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue.trim())
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const shouldShowDropdown = open && (filteredSuggestions.length > 0 || showAddOption)

  return (
    <div ref={containerRef} className="relative">
      {/* Tags + input container */}
      <div
        className="flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-md border border-white/8 px-2.5 py-1.5 focus-within:border-white/15 cursor-text"
        style={{ background: 'oklch(0.14 0.005 280)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Selected tag chips */}
        {value.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${getTagClass(tag)}`}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-md border border-white/8 shadow-lg"
          style={{ background: 'oklch(0.15 0.005 280)' }}
        >
          {filteredSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              className="flex w-full items-center px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault()
                addTag(tag)
              }}
            >
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getTagClass(tag)}`}
              >
                {tag}
              </span>
            </button>
          ))}

          {showAddOption && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors border-t border-white/6"
              onMouseDown={(e) => {
                e.preventDefault()
                addTag(inputValue.trim())
              }}
            >
              <span className="text-muted-foreground/60">Add</span>
              <span
                className="inline-flex items-center rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {inputValue.trim()}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
