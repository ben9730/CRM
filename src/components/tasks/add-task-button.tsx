'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskFormSheet } from './task-form-sheet'

interface AddTaskButtonProps {
  contacts: { id: string; first_name: string; last_name: string }[]
  deals: { id: string; title: string }[]
  defaultContactId?: string
  defaultDealId?: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
}

export function AddTaskButton({
  contacts,
  deals,
  defaultContactId,
  defaultDealId,
  label = 'New Task',
  variant = 'default',
  size = 'default',
}: AddTaskButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setOpen(true)}
        className="gap-1.5"
        style={
          variant === 'default'
            ? {
                background:
                  'linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.50 0.28 300))',
                border: '1px solid oklch(0.60 0.24 280 / 40%)',
              }
            : undefined
        }
      >
        <Plus className="h-4 w-4" />
        {size !== 'icon' && label}
      </Button>

      <TaskFormSheet
        open={open}
        onOpenChange={setOpen}
        contacts={contacts}
        deals={deals}
        defaultContactId={defaultContactId}
        defaultDealId={defaultDealId}
      />
    </>
  )
}
