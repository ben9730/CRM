'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { createInteraction, updateInteraction } from '@/lib/actions/interactions'
import type { ActionState, InteractionWithRelations } from '@/lib/types/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ContactOption {
  id: string
  first_name: string
  last_name: string
}

interface DealOption {
  id: string
  title: string
}

interface InteractionFormProps {
  interaction?: InteractionWithRelations
  contacts: ContactOption[]
  deals: DealOption[]
  defaultContactId?: string
  defaultDealId?: string
  onSuccess?: () => void
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
      style={{
        background: 'linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.50 0.28 300))',
        border: '1px solid oklch(0.60 0.24 280 / 40%)',
      }}
    >
      {pending ? 'Saving...' : label}
    </Button>
  )
}

// Format datetime-local value from ISO string
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) {
    // Default to now
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function InteractionForm({
  interaction,
  contacts,
  deals,
  defaultContactId,
  defaultDealId,
  onSuccess,
}: InteractionFormProps) {
  const isEdit = Boolean(interaction)
  const action = isEdit ? updateInteraction : createInteraction

  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success)
      onSuccess?.()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, onSuccess])

  const defaultType = interaction?.type ?? 'note'
  const defaultOccurredAt = toDatetimeLocal(interaction?.occurred_at)
  const defaultContactId_ = interaction?.contact_id ?? defaultContactId ?? ''
  const defaultDealId_ = interaction?.deal_id ?? defaultDealId ?? ''

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {isEdit && (
        <input type="hidden" name="id" value={interaction!.id} />
      )}

      {/* Type */}
      <div className="space-y-1.5">
        <Label htmlFor="type" className="text-xs text-muted-foreground/80">
          Type <span className="text-destructive">*</span>
        </Label>
        <Select name="type" defaultValue={defaultType}>
          <SelectTrigger
            id="type"
            className="border-white/10 bg-white/4 focus:border-primary/40"
          >
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject" className="text-xs text-muted-foreground/80">
          Subject
        </Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Brief subject or title"
          defaultValue={interaction?.subject ?? ''}
          className="border-white/10 bg-white/4 focus:border-primary/40"
        />
      </div>

      {/* Body / Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="body" className="text-xs text-muted-foreground/80">
          Notes
        </Label>
        <Textarea
          id="body"
          name="body"
          placeholder="What happened? Key points, outcomes, next steps..."
          defaultValue={interaction?.body ?? ''}
          rows={4}
          className="border-white/10 bg-white/4 focus:border-primary/40 resize-none"
        />
      </div>

      {/* Date/Time */}
      <div className="space-y-1.5">
        <Label htmlFor="occurred_at" className="text-xs text-muted-foreground/80">
          Date &amp; Time <span className="text-destructive">*</span>
        </Label>
        <Input
          id="occurred_at"
          name="occurred_at"
          type="datetime-local"
          defaultValue={defaultOccurredAt}
          required
          className="border-white/10 bg-white/4 focus:border-primary/40"
        />
      </div>

      {/* Duration (for calls and meetings) */}
      <div className="space-y-1.5">
        <Label htmlFor="duration_mins" className="text-xs text-muted-foreground/80">
          Duration (minutes)
          <span className="ml-1 text-[10px] text-muted-foreground/40">calls &amp; meetings</span>
        </Label>
        <Input
          id="duration_mins"
          name="duration_mins"
          type="number"
          min="0"
          step="5"
          placeholder="e.g. 30"
          defaultValue={interaction?.duration_mins?.toString() ?? ''}
          className="border-white/10 bg-white/4 focus:border-primary/40"
        />
      </div>

      {/* Contact */}
      {contacts.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="contact_id" className="text-xs text-muted-foreground/80">
            Linked Contact
          </Label>
          <Select name="contact_id" defaultValue={defaultContactId_}>
            <SelectTrigger
              id="contact_id"
              className="border-white/10 bg-white/4 focus:border-primary/40"
            >
              <SelectValue placeholder="Select contact (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Deal */}
      {deals.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="deal_id" className="text-xs text-muted-foreground/80">
            Linked Deal
          </Label>
          <Select name="deal_id" defaultValue={defaultDealId_}>
            <SelectTrigger
              id="deal_id"
              className="border-white/10 bg-white/4 focus:border-primary/40"
            >
              <SelectValue placeholder="Select deal (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {deals.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Error */}
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <SubmitButton label={isEdit ? 'Update Interaction' : 'Log Interaction'} />
    </form>
  )
}
