'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []

  // Always show first page
  pages.push(1)

  if (currentPage <= 4) {
    // Near the start: 1 2 3 4 5 ... last
    for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
      pages.push(i)
    }
    if (totalPages > 6) pages.push('ellipsis')
    pages.push(totalPages)
  } else if (currentPage >= totalPages - 3) {
    // Near the end: 1 ... last-4 last-3 last-2 last-1 last
    pages.push('ellipsis')
    for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Middle: 1 ... prev current next ... last
    pages.push('ellipsis')
    pages.push(currentPage - 1)
    pages.push(currentPage)
    pages.push(currentPage + 1)
    pages.push('ellipsis')
    pages.push(totalPages)
  }

  return pages
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateTo = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(page))
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {/* Prev button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => navigateTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <div
            key={`ellipsis-${idx}`}
            className="flex h-8 w-8 items-center justify-center"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/40" />
          </div>
        ) : (
          <Button
            key={page}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sm font-medium transition-all duration-150"
            style={
              page === currentPage
                ? {
                    background: 'oklch(0.65 0.24 280 / 15%)',
                    color: 'oklch(0.75 0.18 280)',
                    border: '1px solid oklch(0.65 0.24 280 / 25%)',
                  }
                : {
                    color: 'oklch(0.55 0 0)',
                  }
            }
            onClick={() => navigateTo(page as number)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Button>
        )
      )}

      {/* Next button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={() => navigateTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
