'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Circle, Pencil, Trash2, Clock } from 'lucide-react'
import Link from 'next/link'
import type { TaskWithRelations } from '@/lib/types/app'
import { completeTask, deleteTask } from '@/lib/actions/tasks'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { TaskFormSheet } from './task-form-sheet'
import { Button } from '@/components/ui/button'

const PRIORITY_CONFIG: Record<
  string,
  { borderColor: string; labelColor: string; bgColor: string }
> = {
  high: {
    borderColor: 'oklch(0.55 0.22 25)',
    labelColor: 'oklch(0.60 0.20 25)',
    bgColor: 'oklch(0.55 0.22 25 / 8%)',
  },
  medium: {
    borderColor: 'oklch(0.65 0.24 280)',
    labelColor: 'oklch(0.65 0.20 280)',
    bgColor: 'oklch(0.65 0.24 280 / 6%)',
  },
  low: {
    borderColor: 'oklch(1 0 0 / 10%)',
    labelColor: 'oklch(0.50 0 0)',
    bgColor: 'oklch(0.16 0 0)',
  },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface TaskListProps {
  tasks: TaskWithRelations[]
  contacts?: { id: string; first_name: string; last_name: string }[]
  deals?: { id: string; title: string }[]
}

export function TaskList({ tasks, contacts = [], deals = [] }: TaskListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editTask, setEditTask] = useState<TaskWithRelations | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function handleComplete(task: TaskWithRelations) {
    startTransition(async () => {
      const result = await completeTask(task.id, task.is_complete)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(result?.success ?? 'Task updated.')
        router.refresh()
      }
    })
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteTask(deleteId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Task deleted.')
        router.refresh()
      }
      setDeleteId(null)
    })
  }

  if (tasks.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-xl"
        style={{
          background: 'oklch(0.12 0.004 280)',
          border: '1px dashed oklch(1 0 0 / 8%)',
        }}
      >
        <CheckCircle2 className="h-8 w-8 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground/50">No tasks found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => {
          const priority = task.priority ?? 'low'
          const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low
          const isOverdue = task.isOverdue
          const isCompleted = task.is_complete

          const contactName = task.contacts
            ? `${task.contacts.first_name} ${task.contacts.last_name}`
            : null
          const dealTitle = task.deals?.title ?? null

          return (
            <div
              key={task.id}
              className="group relative rounded-lg overflow-hidden pl-[3px] transition-all duration-200"
              style={{
                boxShadow: isOverdue ? '0 0 16px -4px oklch(0.55 0.22 25 / 20%)' : 'none',
              }}
            >
              {/* Left priority border */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{
                  background: isOverdue
                    ? 'oklch(0.55 0.22 25)'
                    : isCompleted
                    ? 'oklch(0.65 0.18 150 / 40%)'
                    : cfg.borderColor,
                }}
              />

              <div
                className="flex items-start gap-3 px-3.5 py-3"
                style={{
                  background: isOverdue
                    ? 'oklch(0.55 0.22 25 / 5%)'
                    : isCompleted
                    ? 'oklch(0.12 0 0)'
                    : cfg.bgColor,
                  border: '1px solid oklch(1 0 0 / 5%)',
                  borderLeft: 'none',
                  borderRadius: '0 0.5rem 0.5rem 0',
                }}
              >
                {/* Complete checkbox */}
                <button
                  onClick={() => handleComplete(task)}
                  disabled={isPending}
                  className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                >
                  {isCompleted ? (
                    <CheckCircle2
                      className="h-4 w-4"
                      style={{ color: 'oklch(0.65 0.18 150)' }}
                    />
                  ) : (
                    <Circle
                      className="h-4 w-4"
                      style={{ color: isOverdue ? 'oklch(0.60 0.22 25)' : 'oklch(0.35 0 0)' }}
                    />
                  )}
                </button>

                {/* Task info */}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: isCompleted
                        ? 'oklch(0.40 0 0)'
                        : isOverdue
                        ? 'oklch(0.70 0.18 25)'
                        : 'oklch(0.90 0 0)',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Clock
                          className="h-2.5 w-2.5 flex-shrink-0"
                          style={{
                            color: isOverdue
                              ? 'oklch(0.60 0.22 25)'
                              : 'oklch(0.40 0 0)',
                          }}
                        />
                        <span
                          className="text-[11px] font-medium"
                          style={{
                            color: isOverdue
                              ? 'oklch(0.60 0.22 25)'
                              : 'oklch(0.45 0 0)',
                          }}
                        >
                          {isOverdue && 'Overdue · '}
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    )}

                    {contactName && (
                      <Link
                        href={`/contacts/${task.contact_id}`}
                        className="text-[11px] text-primary/60 hover:text-primary/90 transition-colors"
                      >
                        {contactName}
                      </Link>
                    )}

                    {dealTitle && (
                      <Link
                        href={`/deals/${task.deal_id}`}
                        className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors truncate"
                      >
                        {dealTitle}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Priority badge */}
                {task.priority && (
                  <span
                    className="flex-shrink-0 self-start inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                    style={{
                      background: isOverdue
                        ? 'oklch(0.55 0.22 25 / 12%)'
                        : isCompleted
                        ? 'oklch(0.14 0 0)'
                        : cfg.bgColor,
                      color: isOverdue
                        ? 'oklch(0.60 0.20 25)'
                        : isCompleted
                        ? 'oklch(0.35 0 0)'
                        : cfg.labelColor,
                      border: `1px solid ${
                        isOverdue
                          ? 'oklch(0.55 0.22 25 / 30%)'
                          : isCompleted
                          ? 'oklch(1 0 0 / 6%)'
                          : cfg.borderColor + '60'
                      }`,
                    }}
                  >
                    {task.priority}
                  </span>
                )}

                {/* Edit/Delete actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground/50 hover:text-foreground hover:bg-white/6"
                    onClick={() => setEditTask(task)}
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8"
                    onClick={() => setDeleteId(task.id)}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit sheet */}
      {editTask && (
        <TaskFormSheet
          open={true}
          onOpenChange={(open) => !open && setEditTask(null)}
          task={editTask}
          contacts={contacts}
          deals={deals}
          onSuccess={() => {
            setEditTask(null)
            router.refresh()
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  )
}
