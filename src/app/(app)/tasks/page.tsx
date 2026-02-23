import { getTasks } from '@/lib/queries/tasks'
import { getContacts } from '@/lib/queries/contacts'
import { getDealsList } from '@/lib/queries/deals'
import { TaskFilters } from '@/components/tasks/task-filters'
import { TaskList } from '@/components/tasks/task-list'
import { AddTaskButton } from '@/components/tasks/add-task-button'
import { Pagination } from '@/components/shared/pagination'

interface TasksPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { status, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  // Validate status param
  const validStatus = ['pending', 'completed', 'overdue'].includes(status ?? '')
    ? (status as 'pending' | 'completed' | 'overdue')
    : undefined

  const [tasksResult, contactsResult, deals] = await Promise.all([
    getTasks({ status: validStatus, page, pageSize: 20 }),
    getContacts({ pageSize: 200 }),
    getDealsList(),
  ])

  const contacts = contactsResult.data.map((c) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
  }))

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your action items and follow-ups across all accounts.
          </p>
        </div>
        <div className="flex-shrink-0">
          <AddTaskButton contacts={contacts} deals={deals} />
        </div>
      </div>

      {/* Status filter tabs */}
      <TaskFilters currentStatus={status ?? 'all'} />

      {/* Task list */}
      <TaskList tasks={tasksResult.data} contacts={contacts} deals={deals} />

      {/* Pagination */}
      {tasksResult.totalPages > 1 && (
        <Pagination
          currentPage={tasksResult.page}
          totalPages={tasksResult.totalPages}
        />
      )}
    </div>
  )
}
