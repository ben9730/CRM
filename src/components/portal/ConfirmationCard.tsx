'use client'

import { Briefcase, CheckCircle2, Loader2, UserPlus } from 'lucide-react'

export interface PendingAction {
  tool: 'create_contact' | 'create_deal' | 'complete_task'
  args: Record<string, unknown>
  preview: {
    title: string
    details: string[]
  }
  sessionId: string | null
}

interface ConfirmationCardProps {
  pendingAction: PendingAction
  onConfirm: () => void
  onCancel: () => void
  isConfirming: boolean
}

const toolIcons = {
  create_contact: UserPlus,
  create_deal: Briefcase,
  complete_task: CheckCircle2,
}

export function ConfirmationCard({
  pendingAction,
  onConfirm,
  onCancel,
  isConfirming,
}: ConfirmationCardProps) {
  const Icon = toolIcons[pendingAction.tool]

  return (
    <div className="rounded-2xl rounded-bl-sm bg-muted/50 px-4 py-3 text-sm">
      {/* Icon + Title */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="mt-0.5 shrink-0 text-primary">
          <Icon className="size-4" />
        </div>
        <p className="font-semibold text-foreground leading-snug">
          {pendingAction.preview.title}
        </p>
      </div>

      {/* Details list */}
      {pendingAction.preview.details.length > 0 && (
        <ul className="mb-3 ml-6.5 space-y-0.5">
          {pendingAction.preview.details.map((detail, i) => (
            <li key={i} className="text-muted-foreground leading-relaxed">
              {detail}
            </li>
          ))}
        </ul>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 ml-6.5">
        <button
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isConfirming && <Loader2 className="size-3 animate-spin" />}
          Confirm
        </button>
        <button
          onClick={onCancel}
          disabled={isConfirming}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
