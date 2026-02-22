'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckSquare, AlertCircle, Clock, CheckCircle2, Plus, Pencil, Trash2 } from 'lucide-react'
import type { TaskWithRelations } from '@/lib/types/app'
import { completeTask, deleteTask } from '@/lib/actions/tasks'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { TaskFormSheet } from '@/components/tasks/task-form-sheet'
import { Button } from '@/components/ui/button'

const PRIORITY_CONFIG: Record<
  string,
  { borderOklch: string; labelOklch: string; bgOklch: string }
> = {
  high: {
    borderOklch: 'oklch(0.55 0.22 25 / 60%)',
    labelOklch: 'oklch(0.60 0.20 25)',
    bgOklch: 'oklch(0.55 0.22 25 / 8%)',
  },
  medium: {
    borderOklch: 'oklch(0.65 0.24 280 / 60%)',
    labelOklch: 'oklch(0.65 0.20 280)',
    bgOklch: 'oklch(0.65 0.24 280 / 6%)',
  },
  low: {
    borderOklch: 'oklch(1 0 0 / 10%)',
    labelOklch: 'oklch(0.50 0 0)',
    bgOklch: 'oklch(0.16 0 0)',
  },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface LinkedTasksProps {
  tasks: TaskWithRelations[]
  contactId?: string
  dealId?: string
  allContacts?: { id: string; first_name: string; last_name: string }[]
  allDeals?: { id: string; title: string }[]
}

export function LinkedTasks({
  tasks,
  contactId,
  dealId,
  allContacts = [],
  allDeals = [],
}: LinkedTasksProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskWithRelations | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.is_complete && !b.is_complete) return 1
    if (!a.is_complete && b.is_complete) return -1
    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return a.due_date.localeCompare(b.due_date)
  })

  const pendingCount = tasks.filter((t) => !t.is_complete).length
  const completedCount = tasks.filter((t) => t.is_complete).length

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

  return (
    <div
      className="gradient-border-top rounded-xl overflow-hidden"
      style={{
        background: 'oklch(0.13 0.005 280)',
        border: '1px solid oklch(1 0 0 / 7%)',
      }}
    >
      {/* Section header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 5%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{
                background: 'oklch(0.65 0.18 150 / 12%)',
                border: '1px solid oklch(0.65 0.18 150 / 20%)',
              }}
            >
              <CheckSquare
                className="h-3.5 w-3.5"
                style={{ color: 'oklch(0.65 0.18 150)' }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground/90">Linked Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: 'oklch(0.65 0.18 150 / 10%)',
                  color: 'oklch(0.65 0.18 150)',
                  border: '1px solid oklch(0.65 0.18 150 / 20%)',
                }}
              >
                {completedCount} done
              </span>
            )}
            <span
              className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[10px] font-bold tabular-nums"
              style={{
                background: 'oklch(0.65 0.18 150 / 12%)',
                color: 'oklch(0.65 0.18 150)',
                border: '1px solid oklch(0.65 0.18 150 / 20%)',
              }}
            >
              {tasks.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs border-white/10 bg-transparent hover:bg-white/5 hover:border-white/15"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div
            className="mt-3 h-1 rounded-full overflow-hidden"
            style={{ background: 'oklch(0.18 0 0)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
                background:
                  'linear-gradient(90deg, oklch(0.55 0.18 150), oklch(0.65 0.20 160))',
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: 'oklch(0.65 0.18 150 / 5%)',
                border: '1px solid oklch(0.65 0.18 150 / 10%)',
              }}
            >
              <CheckSquare
                className="h-5 w-5"
                style={{ color: 'oklch(0.65 0.18 150 / 30%)' }}
              />
            </div>
            <p className="text-sm text-muted-foreground">No linked tasks</p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-white/10 bg-transparent hover:bg-white/5"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Add first task
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => {
              const isOverdue = task.isOverdue
              const isCompleted = task.is_complete
              const priority = task.priority ?? 'low'
              const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low

              return (
                <div
                  key={task.id}
                  className="group relative rounded-lg overflow-hidden pl-[3px] transition-all duration-200"
                  style={{
                    boxShadow: isOverdue
                      ? '0 0 16px -4px oklch(0.55 0.22 25 / 20%)'
                      : 'none',
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
                        : cfg.borderOklch,
                    }}
                  />

                  <div
                    className="flex items-start gap-3 px-3.5 py-3"
                    style={{
                      background: isOverdue
                        ? 'oklch(0.55 0.22 25 / 6%)'
                        : isCompleted
                        ? 'oklch(0.14 0 0)'
                        : cfg.bgOklch,
                      border: '1px solid oklch(1 0 0 / 5%)',
                      borderLeft: 'none',
                      borderRadius: '0 0.5rem 0.5rem 0',
                    }}
                  >
                    {/* Complete toggle */}
                    <button
                      onClick={() => handleComplete(task)}
                      disabled={isPending}
                      className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                    >
                      {isOverdue ? (
                        <AlertCircle
                          className="h-4 w-4"
                          style={{ color: 'oklch(0.60 0.22 25)' }}
                        />
                      ) : isCompleted ? (
                        <CheckCircle2
                          className="h-4 w-4"
                          style={{ color: 'oklch(0.65 0.18 150)' }}
                        />
                      ) : (
                        <div
                          className="h-4 w-4 rounded border-2"
                          style={{ borderColor: 'oklch(0.35 0 0)' }}
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
                            : 'oklch(0.90 0 0)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </p>
                      {task.due_date && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock
                            className="h-2.5 w-2.5 flex-shrink-0"
                            style={{
                              color: isOverdue
                                ? 'oklch(0.60 0.22 25)'
                                : 'oklch(0.40 0 0)',
                            }}
                          />
                          <p
                            className="text-[11px] font-medium"
                            style={{
                              color: isOverdue
                                ? 'oklch(0.60 0.22 25)'
                                : 'oklch(0.45 0 0)',
                            }}
                          >
                            {isOverdue ? 'Overdue · ' : 'Due: '}
                            {formatDate(task.due_date)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Priority badge */}
                    {task.priority && (
                      <div className="flex-shrink-0">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            background: isOverdue
                              ? 'oklch(0.55 0.22 25 / 12%)'
                              : isCompleted
                              ? 'oklch(0.16 0 0)'
                              : cfg.bgOklch,
                            color: isOverdue
                              ? 'oklch(0.60 0.20 25)'
                              : isCompleted
                              ? 'oklch(0.35 0 0)'
                              : cfg.labelOklch,
                            border: `1px solid ${
                              isOverdue
                                ? 'oklch(0.55 0.22 25 / 30%)'
                                : isCompleted
                                ? 'oklch(1 0 0 / 6%)'
                                : cfg.borderOklch
                            }`,
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    )}

                    {/* Edit/Delete */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground/40 hover:text-foreground hover:bg-white/5"
                        onClick={() => setEditTask(task)}
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8"
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
        )}
      </div>

      {/* Add Task sheet */}
      <TaskFormSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        contacts={allContacts}
        deals={allDeals}
        defaultContactId={contactId}
        defaultDealId={dealId}
        onSuccess={() => {
          setAddOpen(false)
          router.refresh()
        }}
      />

      {/* Edit Task sheet */}
      {editTask && (
        <TaskFormSheet
          open={true}
          onOpenChange={(open) => !open && setEditTask(null)}
          task={editTask}
          contacts={allContacts}
          deals={allDeals}
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
    </div>
  )
}
