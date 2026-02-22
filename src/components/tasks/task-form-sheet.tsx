'use client'

import { useRouter } from 'next/navigation'
import type { TaskWithRelations } from '@/lib/types/app'
import { TaskForm } from './task-form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface TaskFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskWithRelations
  contacts: { id: string; first_name: string; last_name: string }[]
  deals: { id: string; title: string }[]
  defaultContactId?: string
  defaultDealId?: string
  onSuccess?: () => void
}

export function TaskFormSheet({
  open,
  onOpenChange,
  task,
  contacts,
  deals,
  defaultContactId,
  defaultDealId,
  onSuccess,
}: TaskFormSheetProps) {
  const router = useRouter()

  function handleSuccess() {
    onSuccess?.()
    router.refresh()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] overflow-y-auto border-l border-white/6"
        style={{ background: 'oklch(0.10 0.003 280)' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, oklch(0.65 0.18 150 / 50%), transparent)',
          }}
        />
        <SheetHeader className="px-6 pt-8 pb-6">
          <SheetTitle className="text-lg font-bold text-gradient-violet">
            {task ? 'Edit Task' : 'New Task'}
          </SheetTitle>
        </SheetHeader>
        <div className="px-6 pb-6">
          <TaskForm
            task={task}
            contacts={contacts}
            deals={deals}
            defaultContactId={defaultContactId}
            defaultDealId={defaultDealId}
            onSuccess={handleSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
