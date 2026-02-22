'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { createDeal, updateDeal } from '@/lib/actions/deals'
import type { DealWithRelations, PipelineStageRow, ActionState } from '@/lib/types/app'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface OrgOption {
  id: string
  name: string
}

interface ContactOption {
  id: string
  first_name: string
  last_name: string
}

interface DealFormProps {
  deal?: DealWithRelations
  stages: PipelineStageRow[]
  organizations: OrgOption[]
  contacts?: ContactOption[]
  onSuccess?: () => void
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full gap-2 font-semibold"
      style={{
        background: 'linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.50 0.25 300))',
        boxShadow: '0 0 16px -4px oklch(0.65 0.24 280 / 25%)',
      }}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Deal'}
    </Button>
  )
}

export function DealForm({ deal, stages, organizations, contacts = [], onSuccess }: DealFormProps) {
  const isEdit = !!deal
  const action = isEdit ? updateDeal : createDeal

  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined)
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    deal?.contacts?.map((c) => c.id) ?? []
  )

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success)
      onSuccess?.()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, onSuccess])

  function toggleContact(contactId: string) {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    )
  }

  const inputClass = 'h-9 border-white/8 focus:border-white/15 text-sm'
  const inputStyle = { background: 'oklch(0.14 0.005 280)' }
  const labelClass = 'text-xs font-medium text-muted-foreground/80 uppercase tracking-wider'

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden ID for edit mode */}
      {isEdit && <input type="hidden" name="id" value={deal.id} />}

      {/* Hidden contact_ids as JSON */}
      <input type="hidden" name="contact_ids" value={JSON.stringify(selectedContacts)} />

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className={labelClass}>
          Deal Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={deal?.title ?? ''}
          placeholder="e.g. Meridian EHR Integration"
          required
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Stage */}
      <div className="space-y-1.5">
        <Label className={labelClass}>
          Stage <span className="text-destructive">*</span>
        </Label>
        <Select name="stage_id" defaultValue={deal?.stage_id ?? stages[0]?.id ?? ''}>
          <SelectTrigger className="h-9 border-white/8 text-sm" style={inputStyle}>
            <SelectValue placeholder="Select stage..." />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Value + Expected Close row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="value" className={labelClass}>
            Value ($)
          </Label>
          <Input
            id="value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            defaultValue={deal?.value ?? ''}
            placeholder="0"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expected_close" className={labelClass}>
            Expected Close
          </Label>
          <Input
            id="expected_close"
            name="expected_close"
            type="date"
            defaultValue={deal?.expected_close ?? ''}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Organization */}
      {organizations.length > 0 && (
        <div className="space-y-1.5">
          <Label className={labelClass}>Organization</Label>
          <Select name="organization_id" defaultValue={deal?.organization_id ?? ''}>
            <SelectTrigger className="h-9 border-white/8 text-sm" style={inputStyle}>
              <SelectValue placeholder="Link to organization..." />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Contacts multi-select */}
      {contacts.length > 0 && (
        <div className="space-y-1.5">
          <Label className={labelClass}>Linked Contacts</Label>
          <div
            className="rounded-md border border-white/8 divide-y divide-white/5 max-h-36 overflow-y-auto"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          >
            {contacts.map((contact) => {
              const isSelected = selectedContacts.includes(contact.id)
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => toggleContact(contact.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/4 transition-colors"
                >
                  <div
                    className="h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: isSelected ? 'oklch(0.55 0.22 280)' : 'transparent',
                      borderColor: isSelected
                        ? 'oklch(0.55 0.22 280)'
                        : 'oklch(1 0 0 / 20%)',
                    }}
                  >
                    {isSelected && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground/80">
                    {contact.first_name} {contact.last_name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className={labelClass}>
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={deal?.notes ?? ''}
          placeholder="Additional notes..."
          rows={3}
          className="resize-none border-white/8 focus:border-white/15 text-sm"
          style={inputStyle}
        />
      </div>

      {/* Error message */}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <SubmitButton isEdit={isEdit} />
    </form>
  )
}
