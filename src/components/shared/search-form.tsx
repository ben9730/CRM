'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface SearchFormProps {
  defaultValue?: string
  placeholder?: string
  paramName?: string
}

export function SearchForm({
  defaultValue = '',
  placeholder = 'Search...',
  paramName = 'search',
}: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value ?? ''
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }

    // Reset to page 1 when searching
    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    const params = new URLSearchParams(searchParams.toString())
    params.delete(paramName)
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const hasValue = !!defaultValue

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="pl-9 pr-8 h-9 bg-white/3 border-white/8 focus:border-white/15 placeholder:text-muted-foreground/40 text-sm"
          style={{ background: 'oklch(0.14 0.005 280)' }}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="h-9 px-4 border-white/8 bg-white/3 hover:bg-white/6 text-muted-foreground hover:text-foreground shrink-0"
      >
        Search
      </Button>
    </form>
  )
}
