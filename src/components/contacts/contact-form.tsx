'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { createContact, updateContact } from '@/lib/actions/contacts'
import type { ContactWithOrgs, ActionState } from '@/lib/types/app'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/shared/tag-input'
import { Loader2, Building2, Check } from 'lucide-react'

interface OrgOption {
  id: string
  name: string
}

interface ContactFormProps {
  contact?: ContactWithOrgs
  organizations: OrgOption[]
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
      {pending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Contact'}
    </Button>
  )
}

export function ContactForm({ contact, organizations, onSuccess }: ContactFormProps) {
  const isEdit = !!contact
  const action = isEdit ? updateContact : createContact

  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined)

  // Tags state (managed by TagInput, submitted as JSON)
  const [tags, setTags] = useState<string[]>(contact?.tags ?? [])

  // Multi-org selection state
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>(
    contact?.organizations.map((o) => o.id) ?? []
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

  function toggleOrg(orgId: string) {
    setSelectedOrgIds((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    )
  }

  // Wrap formAction to inject tags and org_ids as JSON
  function handleSubmit(formData: FormData) {
    formData.set('tags', JSON.stringify(tags))
    formData.set('organization_ids', JSON.stringify(selectedOrgIds))
    formAction(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Hidden ID for edit mode */}
      {isEdit && <input type="hidden" name="id" value={contact.id} />}

      {/* First + Last name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={contact?.first_name ?? ''}
            placeholder="Sarah"
            required
            className="h-9 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={contact?.last_name ?? ''}
            placeholder="Chen"
            required
            className="h-9 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={contact?.title ?? ''}
          placeholder="VP of Clinical Operations"
          className="h-9 border-white/8 focus:border-white/15 text-sm"
          style={{ background: 'oklch(0.14 0.005 280)' }}
        />
      </div>

      {/* Email + Phone row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ''}
            placeholder="s.chen@example.com"
            className="h-9 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={contact?.phone ?? ''}
            placeholder="+1 (555) 000-0000"
            className="h-9 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
          Tags
        </Label>
        <TagInput value={tags} onChange={setTags} placeholder="Add tags..." />
      </div>

      {/* Organizations multi-select */}
      {organizations.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            Organizations
          </Label>
          <div
            className="max-h-40 overflow-y-auto rounded-md border border-white/8 divide-y divide-white/6"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          >
            {organizations.map((org, idx) => {
              const isSelected = selectedOrgIds.includes(org.id)
              const isPrimary = isSelected && selectedOrgIds[0] === org.id
              return (
                <button
                  key={org.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/4"
                  onClick={() => toggleOrg(org.id)}
                >
                  {/* Checkbox visual */}
                  <div
                    className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all"
                    style={{
                      background: isSelected ? 'oklch(0.65 0.24 280 / 20%)' : 'transparent',
                      borderColor: isSelected ? 'oklch(0.65 0.24 280 / 50%)' : 'oklch(1 0 0 / 15%)',
                    }}
                  >
                    {isSelected && (
                      <Check className="h-2.5 w-2.5" style={{ color: 'oklch(0.70 0.20 280)' }} />
                    )}
                  </div>

                  <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40" />

                  <span className="flex-1 text-sm text-foreground/80 truncate">{org.name}</span>

                  {isPrimary && (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: 'oklch(0.65 0.24 280 / 10%)',
                        color: 'oklch(0.65 0.18 280)',
                      }}
                    >
                      primary
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/40">
            First selected is primary organization. Hold Ctrl/Cmd to select multiple.
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={contact?.notes ?? ''}
          placeholder="Additional notes..."
          rows={3}
          className="resize-none border-white/8 focus:border-white/15 text-sm"
          style={{ background: 'oklch(0.14 0.005 280)' }}
        />
      </div>

      {/* Error message */}
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <SubmitButton isEdit={isEdit} />
    </form>
  )
}
