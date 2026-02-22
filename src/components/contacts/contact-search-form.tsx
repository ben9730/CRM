'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

interface ContactSearchFormProps {
  defaultSearch?: string
  defaultTag?: string
  defaultOrg?: string
  availableTags: string[]
  availableOrgs: { id: string; name: string }[]
}

export function ContactSearchForm({
  defaultSearch = '',
  defaultTag = '',
  defaultOrg = '',
  availableTags,
  availableOrgs,
}: ContactSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = (formData.get('search') as string) ?? ''
    const tag = (formData.get('tag') as string) ?? ''
    const org = (formData.get('org') as string) ?? ''

    const params = new URLSearchParams(searchParams.toString())

    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }

    if (tag && tag !== '__all__') {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }

    if (org && org !== '__all__') {
      params.set('org', org)
    } else {
      params.delete('org')
    }

    // Reset to page 1 on any search/filter change
    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  function handleClearAll() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('tag')
    params.delete('org')
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const hasFilters = !!(defaultSearch || defaultTag || defaultOrg)

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          ref={inputRef}
          type="text"
          name="search"
          defaultValue={defaultSearch}
          placeholder="Search contacts by name or email..."
          className="pl-9 h-9 border-white/8 focus:border-white/15 placeholder:text-muted-foreground/40 text-sm"
          style={{ background: 'oklch(0.14 0.005 280)' }}
        />
      </div>

      {/* Tag filter */}
      {availableTags.length > 0 && (
        <Select name="tag" defaultValue={defaultTag || '__all__'}>
          <SelectTrigger
            className="h-9 w-[160px] border-white/8 text-sm text-muted-foreground"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          >
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Organization filter */}
      {availableOrgs.length > 0 && (
        <Select name="org" defaultValue={defaultOrg || '__all__'}>
          <SelectTrigger
            className="h-9 w-[180px] border-white/8 text-sm text-muted-foreground"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          >
            <SelectValue placeholder="All organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All organizations</SelectItem>
            {availableOrgs.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="h-9 px-4 border-white/8 bg-white/3 hover:bg-white/6 text-muted-foreground hover:text-foreground shrink-0"
      >
        Search
      </Button>

      {/* Clear all filters */}
      {hasFilters && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-9 px-3 text-muted-foreground/60 hover:text-foreground gap-1"
          onClick={handleClearAll}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </form>
  )
}
