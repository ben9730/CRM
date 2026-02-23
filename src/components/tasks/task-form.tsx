'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { createTask, updateTask } from '@/lib/actions/tasks'
import type { ActionState, TaskWithRelations } from '@/lib/types/app'
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

interface TaskFormProps {
  task?: TaskWithRelations
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

export function TaskForm({
  task,
  contacts,
  deals,
  defaultContactId,
  defaultDealId,
  onSuccess,
}: TaskFormProps) {
  const isEdit = Boolean(task)
  const action = isEdit ? updateTask : createTask

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

  const defaultContactId_ = task?.contact_id ?? defaultContactId ?? '__none__'
  const defaultDealId_ = task?.deal_id ?? defaultDealId ?? '__none__'

  return (
    <form action={formAction} className="space-y-4">
      {isEdit && (
        <input type="hidden" name="id" value={task!.id} />
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs text-muted-foreground/80">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="What needs to be done?"
          defaultValue={task?.title ?? ''}
          required
          className="border-white/10 bg-white/4 focus:border-primary/40"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs text-muted-foreground/80">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Additional context or details..."
          defaultValue={task?.description ?? ''}
          rows={3}
          className="border-white/10 bg-white/4 focus:border-primary/40 resize-none"
        />
      </div>

      {/* Due Date */}
      <div className="space-y-1.5">
        <Label htmlFor="due_date" className="text-xs text-muted-foreground/80">
          Due Date
        </Label>
        <Input
          id="due_date"
          name="due_date"
          type="date"
          defaultValue={task?.due_date ?? ''}
          className="border-white/10 bg-white/4 focus:border-primary/40"
        />
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <Label htmlFor="priority" className="text-xs text-muted-foreground/80">
          Priority
        </Label>
        <Select name="priority" defaultValue={task?.priority ?? 'normal'}>
          <SelectTrigger
            id="priority"
            className="border-white/10 bg-white/4 focus:border-primary/40"
          >
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
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

      <SubmitButton label={isEdit ? 'Update Task' : 'Create Task'} />
    </form>
  )
}
