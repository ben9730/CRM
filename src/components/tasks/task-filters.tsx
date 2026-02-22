'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type TaskStatus = 'all' | 'pending' | 'completed' | 'overdue'

const FILTERS: { label: string; value: TaskStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
]

interface TaskFiltersProps {
  currentStatus?: string
}

export function TaskFilters({ currentStatus = 'all' }: TaskFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = useCallback(
    (status: TaskStatus) => {
      const params = new URLSearchParams(searchParams.toString())
      if (status === 'all') {
        params.delete('status')
      } else {
        params.set('status', status)
      }
      params.delete('page') // reset to page 1 on filter change
      router.push(`/tasks?${params.toString()}`)
    },
    [router, searchParams]
  )

  const active = (FILTERS.find((f) => f.value === currentStatus) ? currentStatus : 'all') as TaskStatus

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'oklch(0.12 0.004 280)' }}>
      {FILTERS.map((filter) => {
        const isActive = active === filter.value
        return (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
            style={{
              background: isActive ? 'oklch(0.55 0.24 280 / 20%)' : 'transparent',
              color: isActive ? 'oklch(0.75 0.20 280)' : 'oklch(0.50 0 0)',
              border: isActive
                ? '1px solid oklch(0.55 0.24 280 / 30%)'
                : '1px solid transparent',
            }}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
