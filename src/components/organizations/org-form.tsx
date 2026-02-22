'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { createOrganization, updateOrganization } from '@/lib/actions/organizations'
import type { OrgRow, ActionState } from '@/lib/types/app'
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
import { Loader2, Building2 } from 'lucide-react'

interface OrgFormProps {
  organization?: OrgRow
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
      {pending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Organization'}
    </Button>
  )
}

export function OrgForm({ organization, onSuccess }: OrgFormProps) {
  const isEdit = !!organization
  const action = isEdit ? updateOrganization : createOrganization

  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success)
      onSuccess?.()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, onSuccess])

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden ID for edit mode */}
      {isEdit && <input type="hidden" name="id" value={organization.id} />}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
          Organization Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={organization?.name ?? ''}
          placeholder="e.g. Meridian Health System"
          required
          className="h-9 bg-white/3 border-white/8 focus:border-white/15 text-sm"
          style={{ background: 'oklch(0.14 0.005 280)' }}
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
          Type
        </Label>
        <Select name="type" defaultValue={organization?.type ?? ''}>
          <SelectTrigger
            className="h-9 border-white/8 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          >
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hospital">Hospital</SelectItem>
            <SelectItem value="clinic">Clinic</SelectItem>
            <SelectItem value="lab">Lab</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Phone + Website row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={organization?.phone ?? ''}
            placeholder="+1 (555) 000-0000"
            className="h-9 bg-white/3 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            Website
          </Label>
          <Input
            id="website"
            name="website"
            type="text"
            defaultValue={organization?.website ?? ''}
            placeholder="example.com"
            className="h-9 bg-white/3 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
          Street Address
        </Label>
        <Input
          id="address"
          name="address"
          defaultValue={organization?.address ?? ''}
          placeholder="123 Main St"
          className="h-9 bg-white/3 border-white/8 focus:border-white/15 text-sm"
          style={{ background: 'oklch(0.14 0.005 280)' }}
        />
      </div>

      {/* City + State row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            City
          </Label>
          <Input
            id="city"
            name="city"
            defaultValue={organization?.city ?? ''}
            placeholder="San Francisco"
            className="h-9 bg-white/3 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
            State
          </Label>
          <Input
            id="state"
            name="state"
            defaultValue={organization?.state ?? ''}
            placeholder="CA"
            className="h-9 bg-white/3 border-white/8 focus:border-white/15 text-sm"
            style={{ background: 'oklch(0.14 0.005 280)' }}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={organization?.notes ?? ''}
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
