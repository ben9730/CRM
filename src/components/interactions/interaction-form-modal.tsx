'use client'

import { useRouter } from 'next/navigation'
import type { InteractionWithRelations } from '@/lib/types/app'
import { InteractionForm } from './interaction-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface InteractionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interaction?: InteractionWithRelations
  contacts: { id: string; first_name: string; last_name: string }[]
  deals: { id: string; title: string }[]
  defaultContactId?: string
  defaultDealId?: string
  onSuccess?: () => void
}

export function InteractionFormModal({
  open,
  onOpenChange,
  interaction,
  contacts,
  deals,
  defaultContactId,
  defaultDealId,
  onSuccess,
}: InteractionFormModalProps) {
  const router = useRouter()

  function handleSuccess() {
    onSuccess?.()
    router.refresh()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]"
        style={{
          background: 'oklch(0.10 0.003 280)',
          border: '1px solid oklch(1 0 0 / 8%)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)',
          }}
        />
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gradient-violet">
            {interaction ? 'Edit Interaction' : 'Log Interaction'}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          <InteractionForm
            interaction={interaction}
            contacts={contacts}
            deals={deals}
            defaultContactId={defaultContactId}
            defaultDealId={defaultDealId}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
