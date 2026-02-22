import { AlertTriangle, Circle, CheckSquare } from "lucide-react";
import Link from "next/link";

function formatDueDate(dateStr: string): { label: string; overdue: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0) {
    return { label: `${Math.abs(diff)}d overdue`, overdue: true };
  }
  if (diff === 0) return { label: "Due today", overdue: false };
  if (diff === 1) return { label: "Tomorrow", overdue: false };
  return {
    label: due.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    overdue: false,
  };
}

const PRIORITY_BORDER: Record<string, string> = {
  high: "oklch(0.55 0.22 25)",
  medium: "oklch(0.65 0.24 280)",
  low: "oklch(0.40 0.05 280)",
};

const PRIORITY_LABEL_COLOR: Record<string, string> = {
  high: "text-red-400/80",
  medium: "text-primary/80",
  low: "text-muted-foreground/50",
};

interface UpcomingTask {
  id: string;
  title: string;
  due_date: string | null;
  priority: string | null;
  is_complete: boolean;
  isOverdue: boolean;
}

interface TasksWidgetProps {
  tasksDueToday: number;
  overdueCount: number;
  upcomingTasks: UpcomingTask[];
}

export function TasksWidget({
  tasksDueToday,
  overdueCount,
  upcomingTasks,
}: TasksWidgetProps) {
  return (
    <div className="glow-card gradient-border-top bg-noise rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/20">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Tasks
            </h2>
            <p className="mt-1 text-xl font-bold tabular-nums text-gradient-violet">
              {tasksDueToday}
            </p>
            <p className="text-[11px] text-muted-foreground/50 font-light mt-0.5">
              due today
            </p>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-400/70" />
              <span className="text-[10px] font-semibold text-red-400/70 tabular-nums">
                {overdueCount} overdue
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 px-5 py-2">
        {upcomingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <CheckSquare className="h-6 w-6 text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground/40">All caught up!</p>
          </div>
        ) : (
          upcomingTasks.map((task, idx) => {
            const dueDateResult = task.due_date
              ? formatDueDate(task.due_date)
              : null;
            const overdue = dueDateResult?.overdue ?? false;
            const label = dueDateResult?.label ?? "No due date";
            const priority = task.priority ?? "low";
            const borderColor =
              PRIORITY_BORDER[priority] ?? PRIORITY_BORDER.low;
            const isLast = idx === upcomingTasks.length - 1;

            return (
              <div
                key={task.id}
                className={`group/task flex items-start gap-3 py-3 transition-colors duration-150 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg cursor-default ${
                  !isLast ? "border-b border-border/10" : ""
                }`}
              >
                {/* Left color accent bar */}
                <div
                  className="mt-1 flex-shrink-0 w-0.5 self-stretch rounded-full opacity-70"
                  style={{
                    background: borderColor,
                    minHeight: "2rem",
                  }}
                />

                {/* Status indicator */}
                <div className="mt-[3px] flex-shrink-0">
                  {overdue ? (
                    <AlertTriangle className="h-3 w-3 text-red-400/70" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/25" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] font-medium leading-snug truncate transition-colors duration-150 ${
                      overdue
                        ? "text-red-300/80"
                        : "text-foreground/80 group-hover/task:text-foreground/95"
                    }`}
                  >
                    {task.title}
                  </p>
                </div>

                {/* Right: due date + priority */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] font-medium tabular-nums ${
                      overdue
                        ? "text-red-400/80 font-semibold"
                        : "text-muted-foreground/45"
                    }`}
                  >
                    {label}
                  </span>
                  {task.priority && (
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider ${
                        PRIORITY_LABEL_COLOR[priority] ?? PRIORITY_LABEL_COLOR.low
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View all link */}
      <div className="px-5 py-3 border-t border-border/10">
        <Link
          href="/tasks"
          className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors"
        >
          View all tasks →
        </Link>
      </div>
    </div>
  );
}
